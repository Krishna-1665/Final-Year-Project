

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
import base64
from PIL import Image
import io
import numpy as np
import uuid
from datetime import datetime , timedelta
load_dotenv()
import certifi



os.environ['SSL_CERT_FILE'] = certifi.where()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
BASE_DIR = os.path.dirname(__file__)


from sentence_transformers import SentenceTransformer

# Load semantic model
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'interview_semantic_clf.joblib')
MODEL = joblib.load(MODEL_PATH)

# Load semantic embedder
VEC = SentenceTransformer('all-MiniLM-L6-v2')

# Load TF-IDF vectorizer for robust gibberish detection
TFIDF_VEC_PATH = os.path.join(BASE_DIR, 'model', 'vectorizer_calibrated.joblib')
TFIDF_VEC = joblib.load(TFIDF_VEC_PATH)

# Load Dataset
DATASET_PATH = os.path.join(BASE_DIR, 'data', 'dataset.xlsx')
df = pd.read_excel(DATASET_PATH)

# MongoDB Configuration
# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
print("Mongo URI:", MONGO_URI)
if not MONGO_URI:
    raise Exception("❌ MONGO_URI not found in .env file")

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
        session_id = str(uuid.uuid4())
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
                    "category": row["category"],
                    "session_id": session_id
                })

        return jsonify({
            "session_id":session_id,
            "questions":final_questions
        })

    except Exception as e:
        print("Error fetching questions:", e)
        return jsonify({"error": str(e)}), 500


def predict_score_dict(answer_text):
    """
    Returns: expected_class (float), score_0_5 (float), probabilities (list)
    """
    cleaned = clean_text(answer_text)
    
    # If the text is empty after cleaning
    if not cleaned.strip():
        return {
            "expected_class": 0.0,
            "score_0_5": 0.0,
            "probabilities": [1.0, 0.0, 0.0]
        }

    import re
    # Simple length check
    if len(re.sub(r'[^a-zA-Z]', '', cleaned)) < 3:
        return {
            "expected_class": 0.0,
            "score_0_5": 0.0,
            "probabilities": [1.0, 0.0, 0.0]
        }
        
    # Robust gibberish check using the old TF-IDF vocabulary
    # If no words in the answer match any training data words, it's gibberish/off-topic.
    if TFIDF_VEC.transform([cleaned]).nnz == 0:
        return {
            "expected_class": 0.0,
            "score_0_5": 0.0,
            "probabilities": [1.0, 0.0, 0.0]
        }

    X = VEC.encode([cleaned])
        
    proba = MODEL.predict_proba(X)[0]                # probabilities for classes [0,1,2]
    classes = np.array(sorted(MODEL.classes_), dtype=float)
    expected = float((proba * classes).sum())
    max_class = classes.max() if classes.size else 1.0
    score_0_5 = (expected / max_class) * 5.0 if max_class > 0 else expected
    return {
        "expected_class": round(expected, 3),
        "score_0_5": round(float(score_0_5), 2),
        "probabilities": [round(float(x), 4) for x in proba.tolist()]
    }

# ------------------ API: Submit Answer ------------------
@app.route('/api/submit-answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    session_id = data.get("session_id")
    answer = data.get("answer", "")
    question_id = data.get("question_id")
    
    if answer is None or not str(answer).strip():
        return jsonify({
            "prediction": {"expected_class": 0},
            "message": "Skipped"
        })

    if not answer or not question_id or not session_id:
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
            "score": result["expected_class"],
            "session_id": session_id 
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
        session_id = request.args.get("session_id")

        if not session_id:
            return jsonify({"error": "session_id required"}), 400

        results = list(db.results.find({"session_id": session_id}, {"_id": 0}))
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
        req = google_requests.Request()
        idinfo = id_token.verify_oauth2_token(token, req, GOOGLE_CLIENT_ID)

        email = idinfo['email']
        name = idinfo.get('name', '')

        user = users_collection.find_one({"email": email})

        if not user:
            users_collection.insert_one({
                "name": name,
                "email": email,
                "google_id": idinfo['sub']
            })

        now = datetime.utcnow()

        last_login = db.login_history.find_one(
            {"email": email},
            sort=[("loginTime", -1)]
        )

        should_insert = True

        if last_login and "loginTime" in last_login:
            last_time = last_login["loginTime"]

            # 🔥 HANDLE STRING FORMAT SAFELY
            if isinstance(last_time, str):
                try:
                    last_time = datetime.fromisoformat(last_time)
                except:
                    try:
                        last_time = datetime.strptime(last_time, "%Y-%m-%d %H:%M:%S")
                    except:
                        last_time = None

            if last_time:
                diff = (now - last_time).total_seconds()
                if diff < 60:
                    should_insert = False

        if should_insert:
            db.login_history.insert_one({
                "name": name,
                "email": email,
                "loginTime": now
            })

        return jsonify({
            "message": "Google Login successful",
            "user": {
                "name": name,
                "email": email
            }
        }), 200

    except Exception as e:
        print(f"Google Login Error: {e}")
        return jsonify({"error": str(e)}), 400

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

        now = datetime.utcnow()

        last_login = db.login_history.find_one(
            {"email": email},
            sort=[("loginTime", -1)]
        )

        should_insert = True

        if last_login and "loginTime" in last_login:
            last_time = last_login["loginTime"]

            # 🔥 HANDLE STRING FORMAT SAFELY
            if isinstance(last_time, str):
                try:
                    last_time = datetime.fromisoformat(last_time)
                except:
                    try:
                        last_time = datetime.strptime(last_time, "%Y-%m-%d %H:%M:%S")
                    except:
                        last_time = None

            if last_time:
                diff = (now - last_time).total_seconds()
                if diff < 60:
                    should_insert = False

        if should_insert:
            db.login_history.insert_one({
            "name": user['name'],
            "email": user['email'],
            "loginTime": now
        })

        return jsonify({
            "message": "Login successful",
            "user": {
                "name": user['name'],
                "email": user['email']
            }
        }), 200
        
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    if not email.endswith('@gmail.com'):
        return jsonify({"error": "Invalid email format"}), 400

    if email == 'admin@gmail.com' and password == 'admin123':
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid Admin Credentials"}), 401

@app.route('/api/live', methods=['POST'])
def update_live():
    data = request.json

    if not data.get("email"):
        return jsonify({"error": "Email required"}), 400

    # ✅ GET EXISTING USER
    existing = db.live.find_one({"email": data.get("email")})

    if existing and existing.get("isCompleted"):
        # If this is a fresh start (Start Interview button), it sends isCompleted: false
        if "isCompleted" in data and data["isCompleted"] is False:
            pass # Allow full update to restart
        else:
            # It's just a heartbeat from a stopped/completed interview, so only update lastActive
            db.live.update_one(
                {"email": data.get("email")},
                {"$set": {"lastActive": datetime.now().isoformat()}}
            )
            return jsonify({"message": "kept as completed"})

    # ✅ UPDATE LAST ACTIVE
    data["lastActive"] = datetime.now().isoformat()

    # ✅ UPDATE DATABASE
    db.live.update_one(
        {"email": data.get("email")},
        {"$set": data},
        upsert=True
    )

    return jsonify({"message": "updated"})

@app.route('/api/all-users', methods=['GET'])
def get_all_users():
    users = list(db.login_history.find({}, {"_id": 0}))
    for u in users:
        if "loginTime" in u and hasattr(u["loginTime"], "isoformat"):
            u["loginTime"] = u["loginTime"].isoformat() + "Z"
    return jsonify(users)

@app.route('/api/upload-frame', methods=['POST'])
def upload_frame():
    data = request.json

    record = {
        "name": data.get("name"),
        "email": data.get("email"),
        "image": data.get("image"),
        "time": datetime.now().isoformat()
    }

    db.frames.insert_one(record)
    
    # Update live collection with the latest image for fast retrieval
    db.live.update_one(
        {"email": data.get("email")},
        {"$set": {"image": data.get("image")}}
    )

    return jsonify({"message": "Frame saved"})
@app.route('/api/frames', methods=['GET'])
def get_frames():
    frames = list(db.frames.find({}, {"_id": 0}))
    return jsonify(frames)



@app.route('/api/live', methods=['GET'])
def get_live():
    users = list(db.live.find({}, {"_id": 0}))

    for u in users:
        last_active = u.get("lastActive")
        is_completed = u.get("isCompleted", False)
        status = u.get("status", "")
        
        is_active = False
        if not is_completed and status == "In Interview" and last_active:
            try:
                last_active_time = datetime.fromisoformat(last_active.replace("Z", ""))
                if datetime.now() - last_active_time < timedelta(seconds=20):
                    is_active = True
            except Exception as e:
                print("Time parse error:", e)
        
        # Do not send frozen image if disconnected or completed
        if not is_active and "image" in u:
            u["image"] = None
            
        u["isActive"] = is_active

    # Return all users so dashboard can display total, active, and completed candidates correctly
    return jsonify(users)
@app.route('/api/save-user', methods=['POST'])
def save_user():
    data = request.json

    db.final_results.insert_one({
        "name": data.get("name"),
        "email": data.get("email"),
        "score": data.get("score")
    })

    return jsonify({"message": "saved"})
# @app.route('/api/upload-frame', methods=['POST'])
# def upload_frame():
#     data = request.json

#     db.frames.insert_one({
#         "name": data.get("name"),
#         "email": data.get("email"),
#         "image": data.get("image")
#     })

#     return jsonify({"message": "frame saved"})
@app.route('/api/completed', methods=['GET'])
def get_completed():
    users = list(db.live.find({"status": "Completed"}, {"_id": 0}))
    return jsonify(users)





@app.route('/api/admin-stop', methods=['POST'])
def admin_stop():
    data = request.json
    email = data.get("email")

    db.live.update_one(
        {"email": email},
        {"$set": {"isCompleted": True, "status": "Stopped by Admin", "lastActive": datetime.now().isoformat()}},
        upsert=True
    )

    return jsonify({"message": "Interview stopped"})
if __name__ == '__main__':
  
    app.run(host='0.0.0.0', debug=True, port=5000)

