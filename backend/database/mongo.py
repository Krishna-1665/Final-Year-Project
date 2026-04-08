from pymongo import MongoClient

client = MongoClient("your_mongodb_uri")  # Atlas URI
db = client["interview_db"]

# Collections
admin_collection = db["admin"]
user_collection = db["users"]
live_collection = db["live"]
frames_collection = db["frames"]