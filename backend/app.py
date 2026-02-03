from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import random

from utils.preprocessing import clean_text

# ------------------ APP SETUP ------------------
app = Flask(__name__)
CORS(app)  # allow frontend requests

# ------------------ LOAD MODEL ------------------
model = joblib.load("model/interview_model.joblib")
vectorizer = joblib.load("model/vectorizer.joblib")

# ------------------ LOAD DATASET ------------------
df = pd.read_excel("data/dataset.xlsx") 

# Keep only required columns
df = df[["question_id", "question", "answer", "score"]]

# ------------------ API 1: GET QUESTION ------------------
@app.route("/api/question", methods=["GET"])
def get_question():
    question = df.sample(1).iloc[0]

    return jsonify({
        "question_id": int(question["question_id"]),
        "question": question["question"]
    })


# ------------------ API 2: SUBMIT ANSWER ------------------
@app.route("/api/submit-answer", methods=["POST"])
def submit_answer():
    data = request.json

    user_answer = data.get("answer")
    question_id = data.get("question_id")

    if not user_answer or not question_id:
        return jsonify({"error": "Missing data"}), 400

    # Clean user answer
    cleaned_answer = clean_text(user_answer)

    # Vectorize
    X = vectorizer.transform([cleaned_answer])

    # Predict score
    predicted_score = model.predict(X)[0]

    return jsonify({
        "predicted_score": int(predicted_score)
    })


# ------------------ HEALTH CHECK ------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "Backend is running"})


if __name__ == "__main__":
    app.run(debug=True)
