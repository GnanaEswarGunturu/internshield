import pandas as pd
import numpy as np
import os

def generate_synthetic_data():
    """Generates a synthetic dataset for testing when EMSCAD is not available."""
    data = []
    
    # 1. SCAM EXAMPLES
    scam_templates = [
        ("Data Entry Executive", "Work from home data entry. Earn rs 50000 per month. Pay a refundable registration fee of 2000. No interview required. Send bank account details.", "DataTech", "datatech-jobs.blogspot.com", "hr@gmail.com", "50000", "datatech.com", 1),
        ("Software Intern", "Congratulations! Direct joining. Refundable security deposit of 5000 required. Send aadhaar and pan card. 100% guarantee placement.", "Global Tech Careers", "globaltech.wixsite.com", "recruitment@yahoo.com", "75000", "globaltech.com", 1),
        ("Marketing Trainee", "Urgent requirement. Limited seats. Pay today 1500 training fee. Earn huge incentives. OTP will be sent to your number.", "Marketing Pro", "marketing-pro.com", "jobs@rediffmail.com", "40000", "marketing-pro.com", 1),
        ("HR Intern", "Guaranteed job without interview. Just pay processing fee of 1000 INR. High salary and fast promotion.", "HR Solutions", "192.168.1.1", "hr.solutions.123@gmail.com", "30000", "hrsolutions.com", 1),
        ("Backend Developer", "Earn ₹80,000/month with no experience. Immediate joining required. Pay refundable fee 3000. Send bank details.", "Tech Start", "techstart.com", "admin@gmail.com", "80000", "techstart.com", 1)
    ]
    
    # Multiply and slightly perturb to get more samples
    for i in range(10):
        for t in scam_templates:
            data.append(t)
            
    # 2. LEGITIMATE EXAMPLES
    legit_templates = [
        ("Software Engineering Intern", "We are looking for a Software Engineering Intern. Candidates will participate in a technical assessment followed by interviews. The internship provides a monthly stipend based on company policy. Applications should be submitted through the company's official careers portal.", "Example Technologies", "https://exampletech.com", "careers@exampletech.com", "Stipend based", "https://exampletech.com/jobs", 0),
        ("Frontend Developer", "Join our fast-growing startup as a frontend developer. Must have experience with React and Tailwind. 3 rounds of interview. Good compensation package and health benefits.", "WebMakers", "https://webmakers.com", "jobs@webmakers.com", "60000", "https://webmakers.com/careers", 0),
        ("Data Scientist", "Looking for a data scientist with strong ML background. M.S. or Ph.D. preferred. Technical interview and coding round required. Apply on our website.", "Data Insights", "https://datainsights.ai", "careers@datainsights.ai", "120000", "https://datainsights.ai/jobs", 0),
        ("Marketing Intern", "Summer marketing internship available. Work closely with the social media team. Apply with your resume and portfolio. Shortlisted candidates will be contacted for an interview.", "Brand Co", "https://brandco.com", "hr@brandco.com", "15000", "https://brandco.com/internships", 0),
        ("Product Manager", "Experienced PM needed to lead our new product line. Cross-functional team leadership required. 4 interview rounds including a case study presentation.", "Productify", "https://productify.io", "recruiting@productify.io", "150000", "https://productify.io/openings", 0)
    ]
    
    for i in range(10):
        for t in legit_templates:
            data.append(t)
            
    df = pd.DataFrame(data, columns=["title", "description", "company", "website", "email", "salary", "url", "fraudulent"])
    
    # Shuffle
    df = df.sample(frac=1).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    df.to_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset.csv"), index=False)
    print("Synthetic dataset generated: data/dataset.csv")

if __name__ == "__main__":
    generate_synthetic_data()
