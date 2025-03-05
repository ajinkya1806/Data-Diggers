# main.py
from flask import Flask
from dotenv import load_dotenv, find_dotenv
import os
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from auth_routes import auth_bp
from uploads import upload_bp
from flask_cors import CORS

load_dotenv(find_dotenv())

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("MONGO_URI not found in environment variables")
client = MongoClient(MONGO_URI)
db = client['OCR']
app.config['DATABASE'] = db

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key')
jwt = JWTManager(app)

# Set the upload folder configuration
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create the upload directory if it doesn’t exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(upload_bp, url_prefix='/upload')

@app.route('/')
def home():
    return {"message": "Welcome to Data Diggers Backend!"}

if __name__ == '__main__':
    with app.test_request_context():
        print("Registered Routes: ", [str(rule) for rule in app.url_map.iter_rules()])
    app.run(debug=True, host='0.0.0.0', port=5000)