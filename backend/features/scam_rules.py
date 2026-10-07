import re


def _salary_amount(salary: str):
    if not salary or not isinstance(salary, str):
        return None
    match = re.search(r"(\d[\d,]*)", salary)
    if not match:
        return None
    try:
        return int(match.group(1).replace(",", ""))
    except ValueError:
        return None


def extract_employment_scam_features(text: str, salary: str = "", title: str = ""):
    """
    Extracts binary features based on known employment scam patterns in the text.
    Returns a dictionary of features and the matched evidence.
    """
    empty_features = {
        "upfront_payment": 0,
        "registration_fee": 0,
        "security_deposit": 0,
        "no_interview": 0,
        "guaranteed_job": 0,
        "unrealistic_salary": 0,
        "urgent_payment": 0,
        "sensitive_info_request": 0,
    }

    if not text or not isinstance(text, str):
        text = ""
    if not text and not salary and not title:
        return empty_features, []

    features = dict(empty_features)
    text_lower = " ".join(
        part.lower() for part in [title or "", text or "", salary or ""] if part
    )
    evidence = []

    payment_patterns = [
        r"pay\s*(?:a\s+)?(?:refundable\s+)?(?:rs\.?|inr|₹)?\s*\d",
        r"upfront payment",
        r"refundable (?:registration )?fee",
        r"pay immediately",
        r"payment request",
    ]
    registration_patterns = [
        r"registration fee",
        r"training fee",
        r"processing fee",
    ]
    deposit_patterns = [r"security deposit", r"initial deposit"]
    no_interview_patterns = [
        r"no interview required",
        r"without interview",
        r"direct selection",
        r"direct joining",
    ]
    guaranteed_patterns = [
        r"100%\s*guarantee",
        r"guaranteed job",
        r"guaranteed placement",
        r"you have been selected",
    ]
    salary_patterns = [
        r"earn\s*(?:rs\.?|inr|₹)?\s*[5-9]\d{1,2}(?:,\d{3})+",
        r"(?:rs\.?|inr|₹)\s*[5-9]\d{1,2}(?:,\d{3})+\s*(?:\/month|per month)",
        r"earn.{0,25}working from home",
        r"unrealistic",
    ]
    urgent_patterns = [
        r"within\s+\d+\s+hours",
        r"limited seats",
        r"pay today",
        r"pay immediately",
        r"act now",
        r"urgent requirement",
        r"immediate joining",
    ]
    sensitive_patterns = [
        r"aadhaar",
        r"aadhar",
        r"pan card",
        r"bank account details",
        r"otp",
    ]

    def matched(patterns):
        return any(re.search(p, text_lower) for p in patterns)

    if matched(payment_patterns) and not re.search(
        r"no (?:registration fee|payment is required|upfront payment)", text_lower
    ):
        features["upfront_payment"] = 1
        evidence.append("Payment request found in description")

    if matched(registration_patterns) and not re.search(
        r"no registration fee", text_lower
    ):
        features["registration_fee"] = 1
        evidence.append("Registration/training fee requested")

    if matched(deposit_patterns):
        features["security_deposit"] = 1
        evidence.append("Security deposit requested")

    if matched(no_interview_patterns):
        features["no_interview"] = 1
        evidence.append("Direct selection without interview mentioned")

    if matched(guaranteed_patterns):
        features["guaranteed_job"] = 1
        evidence.append("Guaranteed placement/selection mentioned")

    amount = _salary_amount(salary)
    internship_context = bool(
        re.search(r"intern|internship|student|fresher", text_lower)
    )
    if matched(salary_patterns) or (
        amount is not None and internship_context and amount >= 50000
    ):
        features["unrealistic_salary"] = 1
        evidence.append("Unrealistic compensation mentioned")

    if matched(urgent_patterns):
        features["urgent_payment"] = 1
        evidence.append("Urgency or immediate payment language used")

    if matched(sensitive_patterns):
        features["sensitive_info_request"] = 1
        evidence.append("Sensitive document (Aadhaar/PAN/Bank) requested")

    return features, evidence
