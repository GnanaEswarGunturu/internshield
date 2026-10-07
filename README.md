# InternShield

**InternShield** is an explainable multi-layer framework for detecting fraudulent job and internship opportunities.
Created by G. Gnana Eswar & P. Akshaya, Bapatla Engineering College, for the college research paper presentation at Razzle Review, RVR & JC Engineering College.

## Project Objective
The goal is to build a functional web-based system that analyzes job/internship postings and estimates whether they are likely to be legitimate, suspicious, or high-risk. Instead of a black-box model, InternShield emphasizes explainability by identifying exact features, NLP markers, and heuristic rules that influenced the risk score.

## Architecture
The system uses a Multi-Layer Feature Extraction approach:
1. **NLP Processing (Text)**: TF-IDF vectorization to capture semantic patterns, urgency language, and unusual compensation claims.
2. **URL Heuristics**: Analyzes the structure of embedded links or company URLs, checking for missing HTTPS, IP usage, or free domains.
3. **Contact Integrity**: Verifies mismatches between recruiter emails and claimed corporate domains.
4. **Scam Rule Context**: Employs heuristic patterns for known scams like upfront registration fees or "direct joining without interview."

These features are fused and classified via a Logistic Regression model to output an overall risk score (0-100).

## Technology Stack
- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: Python + FastAPI
- **Machine Learning**: scikit-learn, TF-IDF
- **Data Handling**: Pandas, Numpy

## Setup Instructions

### 1. Training the Model
Before running the backend API, you must train the model so it can perform classifications.
```bash
cd internshield/backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Unix/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python model/train.py
```
This generates a synthetic dataset simulating job postings and trains a Logistic Regression model, saving `model.pkl`, `vectorizer.pkl`, and evaluation metrics.

### 2. Starting the Backend API
```bash
cd internshield/backend
# Ensure virtual environment is activated
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Starting the Frontend
```bash
cd internshield/frontend
npm install
npm run dev
```

## Demo Instructions
1. Open the frontend URL (usually `http://localhost:5173`).
2. Explore the dashboard.
3. Go to the "Job Analyzer" tab.
4. Click "Load Demo Scam" or "Load Demo Legit" to pre-fill the form with test data.
5. Enable "Live Demo Mode" checkbox for an animated demonstration of the pipeline.
6. Click "Analyze Posting" to view the resulting Risk Score and Explainable Evidence.

## Ethical Considerations
InternShield is meant as an assistive tool to raise red flags about potentially fraudulent employment opportunities. It should not be the sole decision maker, and a "Low Risk" score does not guarantee legitimacy.

## Limitations
- The current ML model is trained on a synthetic subset demonstrating the EMSCAD properties.
- True detection performance scales with the quality and size of the dataset provided in the real world.
