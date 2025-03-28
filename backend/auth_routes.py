from flask import Blueprint, request, jsonify, current_app, g
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

# Signup Route
@auth_bp.route('/signup', methods=['POST'])
def signup():
    db = current_app.config['DATABASE']
    users_collection = db['users']

    data = request.json
    print("data: ", data)

    if not data or not data.get('username') or not data.get('password') or not data.get('fullName'):
        return jsonify({"error": "Name, Username and Password are required"}), 400

    # Check if user already exists
    if users_collection.find_one({"username": data['username']}):
        return jsonify({"error": "Username already exists"}), 409

    # Hash the password and store user
    hashed_password = generate_password_hash(data['password'])
    users_collection.insert_one({
        "fullName": data['fullName'],
        "username": data['username'],
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully"}), 201

# Signin Route
@auth_bp.route('/signin', methods=['POST'])
def signin():
    db = current_app.config['DATABASE']
    users_collection = db['users']

    data = request.json

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and Password are required"}), 400

    user = users_collection.find_one({"username": data['username']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Invalid credentials"}), 401

    # Create JWT token
    access_token = create_access_token(identity={"username": user['username']})
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "fullName": user.get('fullName', 'N/A') 
    }), 200

# Protected Profile Route
@auth_bp.route('/profile', methods=['GET'])
def profile():
    db = current_app.config['DATABASE']
    users_collection = db['users']

    # Access current user from global context
    if not hasattr(g, 'current_user') or not g.current_user:
        return jsonify({"error": "Unauthorized"}), 401

    username = g.current_user['username']

    user = users_collection.find_one({"username": username}, {"_id": 0})

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "message": f"Welcome {user['username']}! This is your profile.",
        "fullName": user.get('fullName', 'N/A'),
        "username": user['username'],
        "aadhar": user.get('aadhar'),
        "pan": user.get('pan'),
    }), 200