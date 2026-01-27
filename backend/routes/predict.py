from flask import Blueprint, request, jsonify

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/", methods=["POST"])
def predict():
    data = request.json
    answer = data.get("answer", "")

    return jsonify({
        "prediction": "ML model not trained yet",
        "received_answer": answer
    })
