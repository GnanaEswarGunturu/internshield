def extract_text_features(text: str, vectorizer=None):
    """
    Extracts TF-IDF features from text if vectorizer is provided.
    Otherwise returns basic text length features.
    """
    if not text or not isinstance(text, str):
        return {"text_length": 0, "word_count": 0}, None

    features = {
        "text_length": len(text),
        "word_count": len(text.split()),
    }

    tfidf_features = None
    if vectorizer:
        tfidf_features = vectorizer.transform([text])

    return features, tfidf_features
