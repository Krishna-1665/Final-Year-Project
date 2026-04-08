from database.mongo import admin_collection
import bcrypt

password = "admin123".encode()
hashed = bcrypt.hashpw(password, bcrypt.gensalt())

admin_collection.insert_one({
    "email": "admin@gmail.com",
    "password": hashed
})

print("Admin created")