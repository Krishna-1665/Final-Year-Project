from flask import Flask, request, jsonify
import joblib, os
from utils.preprocessing import clean_text  # if you have it

app = Flask(_name_)

# optional: load model if present
MODEL_PATH = os.path.join(os.path.dirname(_file_), 'model', 'interview_model.joblib')
VEC_PATH = os.path.join(os.path.dirname(_file_), 'model', 'vectorizer.joblib')
MODEL = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
VEC = joblib.load(VEC_PATH) if os.path.exists(VEC_PATH) else None

@app.route('/')
def index():
    return "Backend up. Try /health or POST to /predict", 200

@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200



if _name_ == '_main_':
    for rule in app.url_map.iter_rules():
        print(rule, list(rule.methods))
    app.run(debug=True)