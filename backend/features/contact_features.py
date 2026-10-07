import re
from urllib.parse import urlparse

def extract_contact_features(email: str, company_website: str):
    """
    Extracts features by comparing recruiter email and company website.
    """
    features = {
        "free_email": 0,
        "domain_mismatch": 0
    }
    
    evidence = []
    
    if not email or not isinstance(email, str) or not str(email).strip():
        return features, evidence
        
    email_lower = email.lower()
    free_email_providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com']
    
    email_domain = email_lower.split('@')[-1] if '@' in email_lower else ""
    
    if email_domain in free_email_providers:
        features["free_email"] = 1
        evidence.append(f"Free email provider used ({email_domain}) instead of corporate email")
        
    if company_website and isinstance(company_website, str):
        try:
            parsed = urlparse(company_website if company_website.startswith("http") else "http://" + company_website)
            website_domain = parsed.netloc.lower()
            if website_domain.startswith("www."):
                website_domain = website_domain[4:]
                
            if email_domain and email_domain not in free_email_providers:
                if email_domain != website_domain and website_domain not in email_domain:
                    features["domain_mismatch"] = 1
                    evidence.append(f"Email domain ({email_domain}) does not match company website ({website_domain})")
        except Exception:
            pass
            
    return features, evidence
