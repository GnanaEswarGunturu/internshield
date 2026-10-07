import os
import json
import traceback

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from features.scam_rules import extract_employment_scam_features
from features.url_features import extract_url_features
from features.contact_features import extract_contact_features
from features.text_features import extract_text_features
from model.predict import predict_risk, is_model_available, load_models
from scoring import (
    clamp_score,
    prediction_label,
    recommendations_for_level,
    risk_level_from_score,
    safe_number,
)

app = FastAPI(title="InternShield API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JobPosting(BaseModel):
    title: str = Field(default="")
    description: str = Field(default="")
    company: str = Field(default="")
    website: str = Field(default="")
    email: str = Field(default="")
    salary: str = Field(default="")
    url: str = Field(default="")


def _clean(value):
    if value is None:
        return ""
    return str(value).strip()


@app.get("/")
def root():
    load_models()
    return {
        "name": "InternShield",
        "status": "ok",
        "model_available": is_model_available(),
        "endpoints": ["/", "/health", "/analyze", "/metrics"],
    }


@app.get("/health")
def health():
    load_models()
    return {
        "status": "ok",
        "model_available": is_model_available(),
    }


@app.get("/metrics")
def get_metrics():
    metrics_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "model", "metrics.json"
    )
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data.setdefault("dataset_type", "synthetic_demo")
        data.setdefault("validated_research", False)
        data["model_available"] = is_model_available()
        return data
    return {
        "error": "Metrics unavailable — run the training pipeline.",
        "dataset_type": "none",
        "validated_research": False,
        "model_available": is_model_available(),
    }


@app.post("/analyze")
def analyze_posting(job: JobPosting):
    try:
        title = _clean(job.title)
        description = _clean(job.description)
        company = _clean(job.company)
        website = _clean(job.website)
        email = _clean(job.email)
        salary = _clean(job.salary)
        url = _clean(job.url)

        if not title and not description:
            raise HTTPException(
                status_code=400,
                detail="Job title or description is required for analysis.",
            )

        combined_text = " ".join(part for part in [title, description, salary] if part)

        # 1. Preprocessing + multi-layer feature extraction
        text_features, _ = extract_text_features(combined_text)
        rule_features, rule_evidence = extract_employment_scam_features(
            combined_text, salary=salary, title=title
        )
        url_features, url_evidence = extract_url_features(url or website)
        contact_features, contact_evidence = extract_contact_features(email, website)

        fused_features = {
            **text_features,
            **rule_features,
            **url_features,
            **contact_features,
        }

        all_evidence = []

        # Text / NLP heuristic risk (max 35)
        text_risk = min(35, sum(rule_features.values()) * 8)
        if text_features.get("word_count", 0) < 8 and description:
            text_risk = min(35, text_risk + 4)
        for ev in rule_evidence:
            all_evidence.append({"text": ev, "category": "Text / NLP", "impact": "+ risk"})

        # URL risk (max 20)
        url_risk = 0
        if url_features.get("has_url") == 0:
            url_risk += 8
        if url_features.get("is_https") == 0 and url_features.get("has_url") == 1:
            url_risk += 10
        if url_features.get("suspicious_domain") == 1:
            url_risk += 15
        url_risk = min(20, url_risk)
        for ev in url_evidence:
            all_evidence.append({"text": ev, "category": "URL", "impact": "+ risk"})

        # Contact risk (max 15)
        contact_risk = 0
        if contact_features.get("free_email") == 1:
            contact_risk += 8
        if contact_features.get("domain_mismatch") == 1:
            contact_risk += 7
        contact_risk = min(15, contact_risk)
        for ev in contact_evidence:
            all_evidence.append({"text": ev, "category": "Contact", "impact": "+ risk"})

        # Scam pattern risk (max 30)
        scam_pattern_risk = min(30, sum(rule_features.values()) * 6)
        for ev in rule_evidence:
            all_evidence.append({"text": ev, "category": "Scam Pattern", "impact": "+ risk"})

        # Deduplicate evidence text while keeping category
        seen = set()
        unique_evidence = []
        for item in all_evidence:
            key = (item.get("text"), item.get("category"))
            if key in seen:
                continue
            seen.add(key)
            unique_evidence.append(item)

        # 2. ML classifier or rule fallback
        ml_features = {**rule_features, **url_features, **contact_features}
        probability, prediction_class, confidence, model_available = predict_risk(
            description, ml_features
        )

        probability = min(1.0, max(0.0, safe_number(probability, 0.5)))
        confidence = min(1.0, max(0.0, safe_number(confidence, 0.5)))

        heuristic_score = text_risk + url_risk + contact_risk + scam_pattern_risk

        if model_available:
            final_score = clamp_score((probability * 50) + (heuristic_score * 0.55))
        else:
            final_score = clamp_score(heuristic_score)

        # Strong employment-scam signals should remain high-risk even if ML is conservative.
        if sum(rule_features.values()) >= 4:
            final_score = max(final_score, 70)

        risk_level = risk_level_from_score(final_score)
        prediction = prediction_label(risk_level)
        if prediction_class == 1 and risk_level == "LOW":
            prediction = "Suspicious"

        return {
            "risk_score": final_score,
            "risk_level": risk_level,
            "prediction": prediction,
            "confidence": round(confidence, 2),
            "text_risk": int(text_risk),
            "url_risk": int(url_risk),
            "contact_risk": int(contact_risk),
            "scam_pattern_risk": int(scam_pattern_risk),
            "evidence": unique_evidence,
            "recommendations": recommendations_for_level(risk_level),
            "model_available": bool(model_available),
            "company": company,
            "title": title,
        }

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
