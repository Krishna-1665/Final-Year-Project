from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import uuid
import os

from utils.preprocessing import clean_text

# ---------------- APP SETUP ----------------
app = Flask(__name__)
CORS(app)

# ---------------- LOAD MODEL ----------------
MODEL_PATH = os.path.join("model", "interview_model.joblib")
VEC_PATH = os.path.join("model", "vectorizer.joblib")

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VEC_PATH)

LABEL_MAP = {0: "Poor", 1: "Average", 2: "Good"}

# ---------------- LOAD QUESTIONS ----------------
df = pd.read_excel("data/dataset.xlsx")

QUESTIONS = df["question"].dropna().tolist()

if not QUESTIONS:
    raise ValueError("No questions found in dataset.xlsx")

# Limit interview length
QUESTIONS = QUESTIONS[:5]

# ---------------- SESSION STORAGE ----------------
sessions = {}

# ---------------- START INTERVIEW ----------------
@app.route("/start-interview", methods=["POST"])
def start_interview():
    session_id = str(uuid.uuid4())

    sessions[session_id] = {
        "current_index": 0,
        "total_score": 0
    }

    return jsonify({
        "session_id": session_id,
        "question": QUESTIONS[0]
    })

# ---------------- SUBMIT ANSWER ----------------
@app.route("/submit-answer", methods=["POST"])
def submit_answer():
    data = request.get_json()

    session_id = data.get("session_id")
    answer = data.get("answer")

    if not session_id or not answer:
        return jsonify({"error": "Invalid request"}), 400

    session = sessions.get(session_id)
    if not session:
        return jsonify({"error": "Invalid session"}), 400

    cleaned = clean_text(answer)
    vector = vectorizer.transform([cleaned])
    score = int(model.predict(vector)[0])

    session["total_score"] += score
    session["current_index"] += 1

    if session["current_index"] >= len(QUESTIONS):
        return jsonify({
            "finished": True,
            "final_score": session["total_score"],
            "verdict": "Selected" if session["total_score"] >= 6 else "Needs Improvement"
        })

    next_question = QUESTIONS[session["current_index"]]

    return jsonify({
        "finished": False,
        "next_question": next_question,
        "answer_score": score,
        "label": LABEL_MAP[score]
    })

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)
