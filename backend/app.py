from flask import Flask, request, jsonify
import joblib
from utils.preprocessing import clean_text  # if you created preprocessing.py
import os

app = Flask(__name__)

# Load the trained model and vectorizer
model_path = os.path.join(os.path.dirname(__file__), 'model', 'interview_model.joblib')
vectorizer_path = os.path.join(os.path.dirname(__file__), 'model', 'vectorizer.joblib')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    answer = data.get('answer', '')

    # Preprocess text
    clean_answer = clean_text(answer)
    X = vectorizer.transform([clean_answer])
    y_pred = model.predict(X)[0]

    return jsonify({"prediction": int(y_pred)})

if __name__ == '__main__':
    app.run(debug=True)
