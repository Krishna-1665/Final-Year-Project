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

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
BASE_DIR = os.path.dirname(__file__)


# Load model and vectorizer
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'interview_model.joblib')
VEC_PATH = os.path.join(BASE_DIR, 'model', 'vectorizer.joblib')

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
    # Shuffle dataset and take 10 unique questions
    sample_df = df.sample(n=10)
    questions = []

    for _, row in sample_df.iterrows():
        questions.append({
            "question_id": str(row["question_id"]),
            "question": row["question"]
        })

    return jsonify(questions)

# ------------------ API: Submit Answer ------------------
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    data = request.get_json()

    answer = data.get("answer")
    question_id = data.get("question_id")

    if not answer or question_id is None:
        return jsonify({"error": "Missing answer or question_id"}), 400

    # Clean answer
    cleaned = clean_text(answer)

    # Vectorize
    X = VEC.transform([cleaned])

    # Predict
    predicted_score = MODEL.predict(X)[0]

    return jsonify({
        "predicted_score": int(predicted_score)
    })


   
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

