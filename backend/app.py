from flask import Flask
from flask_cors import CORS

from routes.predict import predict_bp
from routes.chatbot import chatbot_bp

app = Flask(__name__)
CORS(app)


app.register_blueprint(predict_bp, url_prefix="/api/predict")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")

@app.route("/")
def home():
    return {"message": "Backend is running successfully "}

if __name__ == "__main__":
    app.run(debug=True)
