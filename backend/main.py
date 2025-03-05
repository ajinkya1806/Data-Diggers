from flask import Flask, g
from dotenv import load_dotenv, find_dotenv
import os
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from auth_routes import auth_bp
from uploads import upload_bp  # Make sure this matches your actual file
from jwt_middleware import jwt_middleware
from flask_cors import CORS

# Load environment variables
load_dotenv(find_dotenv())

app = Flask(__name__)

# Allow CORS for all routes (you may want to limit this in production)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# MongoDB setup
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("MONGO_URI not found in environment variables")

client = MongoClient(MONGO_URI)
db = client['OCR']
app.config['DATABASE'] = db

# JWT Setup
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(upload_bp, url_prefix='/upload')

@app.before_request
def before_request():
    jwt_middleware()  # Ensure jwt_middleware allows OPTIONS requests for CORS and non-protected routes

@app.route('/')
def home():
    return {"message": "Welcome to Data Diggers Backend!"}

if __name__ == '__main__':
    with app.test_request_context():
        print("Registered Routes: ", [str(rule) for rule in app.url_map.iter_rules()])
    app.run(debug=True, host='0.0.0.0', port=5000)
