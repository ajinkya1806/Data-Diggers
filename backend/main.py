from flask import Flask, g
from dotenv import load_dotenv, find_dotenv
import os
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from auth_routes import auth_bp
from jwt_middleware import jwt_middleware
from flask_cors import CORS

# Load environment variables
load_dotenv(find_dotenv())

app = Flask(__name__)

# CORS setup: Allow requests from http://localhost:5173 for all routes
CORS(app, resources={r"/auth/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# MongoDB setup
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found in environment variables")

client = MongoClient(MONGO_URI)
db = client['OCR']
app.config['DATABASE'] = db

# JWT Setup
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

@app.before_request
def before_request():
    jwt_middleware()  # Call middleware before every request

@app.route('/')
def home():
    return {"message": "Welcome to Data Diggers Backend!"}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)