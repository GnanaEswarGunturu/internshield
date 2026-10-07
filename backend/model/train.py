import os
import sys
import pandas as pd
import numpy as np
import pickle
import json
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.generate_dataset import generate_synthetic_data
from features.scam_rules import extract_employment_scam_features
from features.url_features import extract_url_features
from features.contact_features import extract_contact_features

def extract_all_features(df):
    """Extract features for the entire dataframe."""
    feature_rows = []
    for _, row in df.iterrows():
        # Text/Rule Features
        rule_features, _ = extract_employment_scam_features(str(row['description']))
        
        # URL Features
        url_features, _ = extract_url_features(str(row['url']))
        
        # Contact Features
        contact_features, _ = extract_contact_features(str(row['email']), str(row['website']))
        
        combined = {**rule_features, **url_features, **contact_features}
        feature_rows.append(combined)
        
    return pd.DataFrame(feature_rows)

def train_model():
    print("Generating dataset...")
    generate_synthetic_data()
    
    data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "dataset.csv")
    df = pd.read_csv(data_path)
    
    print(f"Loaded {len(df)} samples.")
    
    # Text Features (TF-IDF)
    print("Extracting TF-IDF features...")
    vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(df['description'].fillna(''))
    tfidf_df = pd.DataFrame(tfidf_matrix.toarray(), columns=[f"tfidf_{i}" for i in range(tfidf_matrix.shape[1])])
    
    # Other Features
    print("Extracting other features...")
    other_features_df = extract_all_features(df)
    
    # Combine
    X = pd.concat([tfidf_df, other_features_df], axis=1)
    y = df['fraudulent']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Logistic Regression model...")
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "dataset_type": "synthetic_demo",
        "validated_research": False,
        "note": "These figures come from a small synthetic/demo dataset and are not validated research results.",
    }
    
    print("\nModel Metrics:")
    for k, v in metrics.items():
        print(f"{k}: {v:.4f}" if isinstance(v, float) else f"{k}: {v}")
        
    # Save model, vectorizer, and metrics
    model_dir = os.path.dirname(os.path.abspath(__file__))
    
    with open(os.path.join(model_dir, "model.pkl"), "wb") as f:
        pickle.dump(model, f)
        
    with open(os.path.join(model_dir, "vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)
        
    # We also need to save the column names of other features to ensure consistent input during prediction
    with open(os.path.join(model_dir, "feature_names.pkl"), "wb") as f:
        pickle.dump(list(other_features_df.columns), f)
        
    with open(os.path.join(model_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=4)
        
    print("Model and vectorizer saved successfully.")

if __name__ == "__main__":
    train_model()
