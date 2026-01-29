from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/", methods=["POST"])
def chatbot():
    user_message = request.json.get("message", "")

  
    response = f"I received your message: {user_message}"

    return jsonify({
        "reply": response
    })    
