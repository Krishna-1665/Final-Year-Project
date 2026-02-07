from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, os
import pandas as pd
from utils.preprocessing import clean_text

app = Flask(__name__)
CORS(app)  # Allow React frontend to call backend

BASE_DIR = os.path.dirname(__file__)

# Load model and vectorizer
MODEL_PATH = os.path.join(BASE_DIR, 'model', 'interview_model.joblib')
VEC_PATH = os.path.join(BASE_DIR, 'model', 'vectorizer.joblib')

MODEL = joblib.load(MODEL_PATH)
VEC = joblib.load(VEC_PATH)

# Load dataset
DATASET_PATH = os.path.join(BASE_DIR, 'data', 'dataset.xlsx')
df = pd.read_excel(DATASET_PATH)

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

if __name__ == '__main__':
    app.run(debug=True)
