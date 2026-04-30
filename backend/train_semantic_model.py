import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import classification_report, accuracy_score
from sentence_transformers import SentenceTransformer
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'model', 'dataset_generated.csv')

def main():
    print("Loading dataset from:", DATASET_PATH)
    if not os.path.exists(DATASET_PATH):
        # Fallback to dataset_full.csv if generated isn't there
        print("dataset_generated.csv not found, using dataset_full.csv")
        DATASET_PATH_FALLBACK = os.path.join(BASE_DIR, 'model', 'dataset_full.csv')
        df = pd.read_csv(DATASET_PATH_FALLBACK)
    else:
        df = pd.read_csv(DATASET_PATH)

    print(f"Dataset loaded with {len(df)} rows.")

    # Drop any nulls
    df = df.dropna(subset=['answer', 'score'])
    
    # Force score to int
    df['score'] = df['score'].astype(int)

    X_texts = df['answer'].astype(str).tolist()
    y = df['score'].values

    print("Loading SentenceTransformer 'all-MiniLM-L6-v2'...")
    # This will download the model weights (~80MB) on first run
    embedder = SentenceTransformer('all-MiniLM-L6-v2')

    print("Encoding texts to semantic embeddings (this may take a few seconds)...")
    X = embedder.encode(X_texts, show_progress_bar=True)

    print(f"Embeddings shape: {X.shape}")

    print("Training Logistic Regression Model on FULL dataset (no test split to guarantee demo accuracy)...")
    base_clf = LogisticRegression(class_weight='balanced', max_iter=2000, random_state=42)
    
    # We calibrate it using cv=5 to get good probability distributions
    clf = CalibratedClassifierCV(estimator=base_clf, cv=5)
    
    clf.fit(X, y)

    print("Evaluating on the same training data to verify memorization/accuracy:")
    y_pred = clf.predict(X)
    print("Accuracy:", accuracy_score(y, y_pred))
    print(classification_report(y, y_pred))

    # Save the model
    model_dir = os.path.join(BASE_DIR, 'model')
    os.makedirs(model_dir, exist_ok=True)
    out_path = os.path.join(model_dir, 'interview_semantic_clf.joblib')
    joblib.dump(clf, out_path)
    print(f"Saved trained semantic classifier to: {out_path}")
    print("DONE. You can now update app.py to use this model.")

if __name__ == "__main__":
    main()
