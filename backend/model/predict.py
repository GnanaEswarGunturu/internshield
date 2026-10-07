import os
import pickle

import numpy as np
import pandas as pd

from scoring import safe_number

model_dir = os.path.dirname(os.path.abspath(__file__))

model = None
vectorizer = None
feature_names = None
_load_attempted = False
_model_available = False


def is_model_available():
    return _model_available


def load_models():
    global model, vectorizer, feature_names, _load_attempted, _model_available
    if _load_attempted:
        return _model_available

    _load_attempted = True
    model_path = os.path.join(model_dir, "model.pkl")
    vectorizer_path = os.path.join(model_dir, "vectorizer.pkl")
    features_path = os.path.join(model_dir, "feature_names.pkl")

    if not (os.path.exists(model_path) and os.path.exists(vectorizer_path)):
        print("Models not found. Using rule-based fallback pipeline.")
        _model_available = False
        return False

    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        with open(vectorizer_path, "rb") as f:
            vectorizer = pickle.load(f)
        if os.path.exists(features_path):
            with open(features_path, "rb") as f:
                feature_names = pickle.load(f)
        else:
            feature_names = []
        _model_available = True
        return True
    except Exception as exc:
        print(f"Failed to load trained model ({exc}). Using rule-based fallback.")
        model = None
        vectorizer = None
        feature_names = None
        _model_available = False
        return False


def _rule_fallback(other_features_dict):
    values = []
    for value in (other_features_dict or {}).values():
        if isinstance(value, (int, float, np.floating, np.integer)):
            values.append(safe_number(value, 0.0))
    if not values:
        return 0.15, 0, 0.6

    hits = sum(1 for value in values if value > 0)
    density = hits / max(len(values), 1)
    probability = min(0.95, max(0.05, density * 1.8))
    prediction = 1 if probability >= 0.5 else 0
    confidence = probability if prediction == 1 else 1 - probability
    return probability, prediction, confidence


def predict_risk(description, other_features_dict):
    """
    Predicts fraud probability and class.
    Returns (probability, prediction_class, confidence, model_available).
    """
    if not load_models():
        probability, prediction, confidence = _rule_fallback(other_features_dict)
        return probability, prediction, confidence, False

    try:
        tfidf_matrix = vectorizer.transform([description if description else ""])
        tfidf_array = tfidf_matrix.toarray()
        tfidf_df = pd.DataFrame(
            tfidf_array,
            columns=[f"tfidf_{i}" for i in range(tfidf_array.shape[1])],
        )

        other_df = pd.DataFrame([other_features_dict or {}])
        names = feature_names or list(other_df.columns)
        for col in names:
            if col not in other_df.columns:
                other_df[col] = 0
        other_df = other_df[names]

        X = pd.concat([tfidf_df, other_df], axis=1)
        X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

        probability = safe_number(model.predict_proba(X)[0][1], 0.5)
        prediction = int(model.predict(X)[0])
        confidence = probability if prediction == 1 else 1 - probability
        confidence = safe_number(confidence, 0.5)
        probability = min(1.0, max(0.0, probability))
        confidence = min(1.0, max(0.0, confidence))
        return probability, prediction, confidence, True
    except Exception as exc:
        print(f"ML prediction failed ({exc}). Using rule-based fallback.")
        probability, prediction, confidence = _rule_fallback(other_features_dict)
        return probability, prediction, confidence, False
