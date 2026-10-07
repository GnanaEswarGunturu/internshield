import math

# Modular thresholds so they can be retuned after research validation.
LOW_MAX = 30
VERIFY_MAX = 65


def safe_number(value, default=0.0):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    if math.isnan(number) or math.isinf(number):
        return default
    return number


def clamp_score(value):
    return int(max(0, min(100, round(safe_number(value, 0.0)))))


def risk_level_from_score(score):
    if score <= LOW_MAX:
        return "LOW"
    if score <= VERIFY_MAX:
        return "VERIFY"
    return "HIGH"


def recommendations_for_level(level):
    if level == "LOW":
        return [
            "No major risk indicators were detected.",
            "Continue normal verification through official channels.",
        ]
    if level == "VERIFY":
        return [
            "Verify the recruiter and company before proceeding.",
            "Confirm the posting on the organization's official careers page.",
            "Do not share sensitive documents until the offer is independently verified.",
        ]
    return [
        "Do not pay any registration, training, or refundable fee.",
        "Verify the company through its official website.",
        "Do not share bank credentials, OTPs, or unnecessary identity documents.",
        "Contact the company using an independently verified official channel.",
    ]


def prediction_label(level):
    if level == "LOW":
        return "Likely Legitimate"
    if level == "VERIFY":
        return "Suspicious"
    return "Fraudulent"
