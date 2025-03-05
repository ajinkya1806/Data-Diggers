from flask import Flask, g
from dotenv import load_dotenv, find_dotenv
import os
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from auth_routes import auth_bp
from jwt_middleware import jwt_middleware  # Import the middleware

# Load environment variables
load_dotenv(find_dotenv())

app = Flask(__name__)

# MongoDB setup
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not found in environment variables")

client = MongoClient(MONGO_URI)
db = client['user_db']
app.config['DATABASE'] = db

# JWT Setup
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)

@app.before_request
def before_request():
    jwt_middleware()  # Call middleware before every request

@app.route('/')
def home():
    return {"message": "Welcome to Data Diggers Backend!"}

if __name__ == '__main__':
    app.run(debug=True)
