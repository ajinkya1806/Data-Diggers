from flask import Flask
from dotenv import load_dotenv, find_dotenv
import os
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from auth_routes import auth_bp  # Import Blueprint

# Load environment variables
load_dotenv(find_dotenv())

app = Flask(__name__)

# MongoDB setup
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found in environment variables")

client = MongoClient(MONGO_URI)
db = client['OCR']

# Set database into app config
app.config['DATABASE'] = db

# JWT Setup
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
jwt = JWTManager(app)

# Register the auth routes
app.register_blueprint(auth_bp)

@app.route('/')
def home():
    return {"message": "Welcome to Data Diggers Backend!"}

if __name__ == '__main__':
    app.run(debug=True)
