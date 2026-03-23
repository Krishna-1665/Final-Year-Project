from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, os
from utils.preprocessing import clean_text
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import pandas as pd
import random
import numpy as np

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
BASE_DIR = os.path.dirname(__file__)


# Load model and vectorizer
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'interview_clf_calibrated.joblib')
VEC_PATH = os.path.join(BASE_DIR, 'model', 'vectorizer_calibrated.joblib')

MODEL = joblib.load(MODEL_PATH)
VEC = joblib.load(VEC_PATH)

# Load Dataset
DATASET_PATH = os.path.join(BASE_DIR, 'data', 'dataset.xlsx')
df = pd.read_excel(DATASET_PATH)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['user_database']
users_collection = db['users']

# Google Client ID
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "467984197043-d455hh4reb5sse2m3adkddhp6jdufef3.apps.googleusercontent.com")

# Make sure your Excel has columns: question_id, question

@app.route('/')
def index():
    return "Backend is running. Try /health or /api/question", 200

@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200

# ------------------ API: Get Question ------------------
@app.route('/api/questions', methods=['GET'])
def get_questions():
    try:
        categories = ["HR", "Technical", "Programming", "Database", "AI/ML"]
        final_questions = []

        for cat in categories:
            # Filter category
            cat_df = df[df['category'] == cat].copy()

             # Remove duplicate questions (case-insensitive)
            cat_df['question_clean'] = cat_df['question'].str.lower().str.strip()
            cat_df = cat_df.drop_duplicates(subset='question_clean')

            # Shuffle the category questions
            cat_df = cat_df.sample(frac=1).reset_index(drop=True)

            # Pick 3 random questions (or less if not enough)
            selected = cat_df.head(3)

            for _, row in selected.iterrows():
                final_questions.append({
                    "question_id": str(row["question_id"]),
                    "question": row["question"],
                    "category": row["category"]
                })

        return jsonify(final_questions)

    except Exception as e:
        print("Error fetching questions:", e)
        return jsonify({"error": str(e)}), 500


def predict_score_dict(answer_text):
    """
    Returns: expected_class (float), score_0_5 (float), probabilities (list)
    """
    cleaned = clean_text(answer_text)
    X = VEC.transform([cleaned])
    proba = MODEL.predict_proba(X)[0]                # probabilities for classes [0,1,2]
    classes = np.array(sorted(MODEL.classes_), dtype=float)
    expected = float((proba * classes).sum())
    max_class = classes.max() if classes.size else 1.0
    score_0_5 = (expected / max_class) * 5.0 if max_class > 0 else expected
    return {
        "expected_class": round(expected, 3),
        "score_0_5": round(score_0_5, 2),
        "probabilities": [round(float(x), 4) for x in proba.tolist()]
    }

# ------------------ API: Submit Answer ------------------
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    data = request.get_json()

    answer = data.get("answer")
    question_id = data.get("question_id")

    if not answer or not question_id:
        return jsonify({"error": "Missing answer or question_id"}), 400

    try:
        # 🔥 FIX: handle q5 → 5
        question_id_clean = ''.join(filter(str.isdigit, str(question_id)))

        if not question_id_clean:
            return jsonify({"error": "Invalid question_id"}), 400

        question_id_str = str(question_id).strip()

        row = df[df['question_id'].astype(str) == question_id_str]


        if row.empty:
            return jsonify({"error": "Question not found"}), 404

        category = row.iloc[0]['category']

        # 🔥 Predict score
        result = predict_score_dict(answer)

        record = {
            "question_id": question_id,
            "category": category,
            "score": result["expected_class"]
        }

        db.results.insert_one(record)

        return jsonify({
            "message": "Answer submitted successfully",
            "prediction": result
        }), 200

    except Exception as e:
        print("SUBMIT ERROR:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/career-guidance', methods=['GET'])
def career_guidance():
    try:
        # 🔹 Fetch all results
        results = list(db.results.find({}, {"_id": 0}))

        # 🔹 Initialize category scores
        category_scores = {
            "HR": 0,
            "Technical": 0,
            "Programming": 0,
            "Database": 0,
            "AI/ML": 0
        }

        # 🔹 Aggregate scores
        for r in results:
            if "category" not in r or "score" not in r:
                continue

            cat = r["category"]
            score = r["score"]

            if cat in category_scores:
                category_scores[cat] += score

        # 🔹 Handle empty data
        if all(v == 0 for v in category_scores.values()):
            return jsonify({"error": "No valid data found"}), 400

        # 🔹 Find best category
        best_category = max(category_scores, key=category_scores.get)

        # 🔹 Career mapping
        career_map = {
            "HR": "You have strong communication skills. Go for HR or Management roles.",
            "Technical": "Strong fundamentals. Target core engineering roles.",
            "Programming": "Good in coding. Focus on Software Development and DSA.",
            "Database": "Strong in Database. Go for Data Engineer or Data Scientist roles.",
            "AI/ML": "Great in AI/ML. Go for Machine Learning Engineer or AI roles."
        }

        # 🔥 Round scores to 2 decimal places
        rounded_scores = {
            k: round(v, 2) for k, v in category_scores.items()
        }

        return jsonify({
            "category_scores": rounded_scores,
            "best_category": best_category,
            "career_guidance": career_map[best_category]
        })

    except Exception as e:
        print("Career Guidance Error:", e)
        return jsonify({"error": str(e)}), 500
   
@app.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    token = data.get('credential')
    
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        # ID token is valid. Get user information from ID token.
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Check if user exists, if not create one
        user = users_collection.find_one({"email": email})
        if not user:
            user_data = {
                "name": name,
                "email": email,
                "google_id": idinfo['sub']
            }
            users_collection.insert_one(user_data)
        
        return jsonify({
            "message": "Google Login successful",
            "user": {
                "name": name,
                "email": email
            }
        }), 200
    except Exception as e:
        print(f"Google Login Error: {e}")
        return jsonify({"error": f"Google login failed: {str(e)}"}), 400

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    user_data = {
        "name": name,
        "email": email,
        "password": hashed_password
    }

    users_collection.insert_one(user_data)
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user['password'], password):
        return jsonify({
            "message": "Login successful",
            "user": {
                "name": user['name'],
                "email": user['email']
            }
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

if __name__ == '__main__':
  
    app.run(debug=True, port=5000)

