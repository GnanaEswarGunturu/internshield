import re
from urllib.parse import urlparse

def extract_url_features(url: str):
    """
    Extracts features from the job URL or company website.
    """
    if not url or not isinstance(url, str) or not str(url).strip():
        return {"has_url": 0, "is_https": 0, "url_length": 0, "suspicious_domain": 0}, []

    features = {
        "has_url": 1,
        "is_https": 1 if url.startswith("https") else 0,
        "url_length": len(url),
        "suspicious_domain": 0
    }
    
    evidence = []
    
    if features["is_https"] == 0 and url.startswith("http"):
        evidence.append("URL is not using HTTPS")
        
    try:
        parsed = urlparse(url if url.startswith("http") else "http://" + url)
        domain = parsed.netloc.lower()
        
        # Check for free hosting or shorteners
        suspicious_domains = ['bit.ly', 'tinyurl.com', 'forms.gle', 'wordpress.com', 'blogspot.com', 'wixsite.com']
        if any(sd in domain for sd in suspicious_domains):
            features["suspicious_domain"] = 1
            evidence.append(f"Suspicious or free domain used: {domain}")
            
        # Check for IP address instead of domain
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
            features["suspicious_domain"] = 1
            evidence.append("IP address used instead of domain name")
            
    except Exception:
        pass
        
    return features, evidence
