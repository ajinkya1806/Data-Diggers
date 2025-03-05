import os
from flask import Blueprint, request, jsonify, g, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from ocr_utils import extract_document_data  # Updated to use a single extraction function

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    if 'file' not in request.files:
        return jsonify({"error": "File is required"}), 400

    file = request.files['file']

    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file format"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join('uploads', filename)
    os.makedirs('uploads', exist_ok=True)
    file.save(file_path)

    # Use a generic OCR extraction function that identifies the document type (Aadhar/PAN)
    extracted_data = extract_document_data(file_path)

    if not extracted_data or 'doc_type' not in extracted_data:
        return jsonify({"error": "Failed to extract data or detect document type"}), 500

    doc_type = extracted_data['doc_type'].lower()

    if doc_type not in ['aadhar', 'pan']:
        return jsonify({"error": f"Unknown document type '{doc_type}' detected"}), 400

    # Update user's document data in MongoDB
    db = current_app.config['DATABASE']
    username = g.current_user['username']

    # Fetch the existing user data
    user_data = db.users.find_one({"username": username}) or {}

    # Define the target field based on document type
    target_field = "aadhar" if doc_type == "aadhar" else "pan"

    # Check if data already exists for the document type
    if target_field in user_data and user_data[target_field]:
        # Data exists, ask the user which fields to update
        existing_data = user_data[target_field]
        response = {
            "message": f"{doc_type.capitalize()} data already exists. Please specify which fields to update.",
            "existing_data": existing_data,
            "new_data": extracted_data,
            "fields_to_update": ["doc_type", "identifier", "name", "dob", "gender"]
        }
        return jsonify(response), 200
    else:
        # No existing data, insert directly
        db.users.update_one(
            {"username": username},
            {"$set": {target_field: extracted_data}},
            upsert=True  # Insert if user doesn't exist
        )
        message = f"{doc_type.capitalize()} uploaded and data saved successfully!"
        return jsonify({"message": message, "data": extracted_data}), 200

@upload_bp.route('/update_fields', methods=['POST'])
@jwt_required()
def update_document_fields():
    """
    Endpoint to handle field updates based on user input after being prompted.
    Expects JSON payload with doc_type and fields_to_update.
    Example payload:
    {
        "doc_type": "aadhar",
        "fields_to_update": {
            "name": "New Name",
            "dob": "New DOB"
        }
    }
    """
    data = request.get_json()
    if not data or 'doc_type' not in data or 'fields_to_update' not in data:
        return jsonify({"error": "Invalid request payload"}), 400

    doc_type = data['doc_type'].lower()
    if doc_type not in ['aadhar', 'pan']:
        return jsonify({"error": f"Unknown document type '{doc_type}'"}), 400

    fields_to_update = data['fields_to_update']
    valid_fields = {"doc_type", "identifier", "name", "dob", "gender"}
    
    # Validate provided fields
    if not all(field in valid_fields for field in fields_to_update.keys()):
        return jsonify({"error": "Invalid fields specified"}), 400

    # Update user's document data in MongoDB
    db = current_app.config['DATABASE']
    username = g.current_user['username']
    target_field = "aadhar" if doc_type == "aadhar" else "pan"

    # Construct the update query for specific fields
    update_fields = {f"{target_field}.{key}": value for key, value in fields_to_update.items()}
    result = db.users.update_one(
        {"username": username},
        {"$set": update_fields}
    )

    if result.modified_count > 0:
        updated_data = db.users.find_one({"username": username})[target_field]
        message = f"{doc_type.capitalize()} data updated successfully!"
        return jsonify({"message": message, "data": updated_data}), 200
    else:
        return jsonify({"error": "No updates applied"}), 400