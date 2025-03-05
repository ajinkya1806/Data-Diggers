from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os

upload_bp = Blueprint('upload', __name__)

# Allowed file extensions for upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# @upload_bp.route('/upload', methods=['POST'])
# def upload_document():
#     """
#     Endpoint to upload a document (image or PDF) and extract data using OCR.
#     If the document type already exists for the user, prompt for field updates.
#     Otherwise, save the new data directly.
#     No JWT authentication required.
#     """
#     # Check if file is present in the request
#     if 'file' not in request.files:
#         return jsonify({"error": "File is required"}), 400

#     file = request.files['file']

#     # Validate file name and extension
#     if file.filename == '' or not allowed_file(file.filename):
#         return jsonify({"error": "Invalid file format"}), 400

#     # Securely save the file
#     filename = secure_filename(file.filename)
#     file_path = os.path.join('uploads', filename)
#     os.makedirs('uploads', exist_ok=True)
#     file.save(file_path)

#     # Extract data using OCR utility
#     extracted_data = extract_document_data(file_path)
#     if not extracted_data or 'doc_type' not in extracted_data:
#         return jsonify({"error": "Failed to extract data or detect document type"}), 500

#     doc_type = extracted_data['doc_type'].lower()
#     if doc_type not in ['aadhar', 'pan']:
#         return jsonify({"error": f"Unknown document type '{doc_type}' detected"}), 400

#     # Get MongoDB instance
#     db = current_app.config['DATABASE']
#     # Hardcoded username for testing (replace with your logic if needed)
#     username = "shreyas@gmail.com"

#     # Fetch existing user data
#     user_data = db.users.find_one({"username": username}) or {}
#     target_field = "aadhar" if doc_type == "aadhar" else "pan"

#     # Check if document data already exists
#     if target_field in user_data and user_data[target_field]:
#         existing_data = user_data[target_field]
#         response = {
#             "message": f"{doc_type.capitalize()} data already exists. Please specify which fields to update.",
#             "existing_data": existing_data,
#             "new_data": extracted_data,
#             "fields_to_update": ["doc_type", "identifier", "name", "dob", "gender"]
#         }
#         return jsonify(response), 200
#     else:
#         # Insert new data if no existing record
#         db.users.update_one(
#             {"username": username},
#             {"$set": {target_field: extracted_data}},
#             upsert=True
#         )
#         message = f"{doc_type.capitalize()} uploaded and data saved successfully!"
#         return jsonify({"message": message, "data": extracted_data}), 200

# @upload_bp.route('/update_fields', methods=['POST'])
# def update_document_fields():
#     """
#     Endpoint to update specific fields of an existing document based on user selection.
#     Expects JSON payload with doc_type and fields_to_update.
#     No JWT authentication required.
#     Example payload:
#     {
#         "doc_type": "aadhar",
#         "fields_to_update": {
#             "name": "New Name",
#             "dob": "New DOB"
#         }
#     }
#     """
#     # Parse JSON request body
#     data = request.get_json()
#     if not data or 'doc_type' not in data or 'fields_to_update' not in data:
#         return jsonify({"error": "Invalid request payload"}), 400

#     doc_type = data['doc_type'].lower()
#     if doc_type not in ['aadhar', 'pan']:
#         return jsonify({"error": f"Unknown document type '{doc_type}'"}), 400

#     fields_to_update = data['fields_to_update']
#     valid_fields = {"doc_type", "identifier", "name", "dob", "gender"}

#     # Validate fields to update
#     if not all(field in valid_fields for field in fields_to_update.keys()):
#         return jsonify({"error": "Invalid fields specified"}), 400

#     # Get MongoDB instance
#     db = current_app.config['DATABASE']
#     # Hardcoded username for testing (replace with your logic if needed)
#     username = "test_user"

#     target_field = "aadhar" if doc_type == "aadhar" else "pan"

#     # Construct update query for MongoDB
#     update_fields = {f"{target_field}.{key}": value for key, value in fields_to_update.items()}
#     result = db.users.update_one(
#         {"username": username},
#         {"$set": update_fields}
#     )

#     # Check if update was successful
#     if result.modified_count > 0:
#         updated_data = db.users.find_one({"username": username})[target_field]
#         message = f"{doc_type.capitalize()} data updated successfully!"
#         return jsonify({"message": message, "data": updated_data}), 200
#     else:
#         return jsonify({"error": "No updates applied"}), 400
import re
import cv2
import numpy as np
from paddleocr import PaddleOCR
import google.generativeai as genai
import logging
from typing import Dict, List
from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename

# PDF to Image conversion
from pdf2image import convert_from_path

class DocumentInfoExtractor:
    def __init__(self, lang: str = 'en', logging_level: int = logging.INFO):
        logging.basicConfig(level=logging_level, format='%(asctime)s - %(levelname)s: %(message)s')
        self.logger = logging.getLogger(__name__)

        try:
            self.ocr = PaddleOCR(use_angle_cls=True, lang=lang, show_log=False)
        except Exception as e:
            self.logger.error(f"OCR Initialization Error: {e}")
            raise

        # Set up Gemini API
        genai.configure(api_key="YOUR_GEMINI_KEY")

    def convert_pdf_to_images(self, pdf_path: str, output_dir: str) -> List[str]:
        """
        Convert PDF to images and save them in the specified directory.
        
        Args:
            pdf_path (str): Path to the PDF file
            output_dir (str): Directory to save converted images
        
        Returns:
            List[str]: Paths to the generated image files
        """
        try:
            # Ensure output directory exists
            os.makedirs(output_dir, exist_ok=True)
            
            # Convert PDF to images
            images = convert_from_path(pdf_path, dpi=300)
            
            # Save images
            image_paths = []
            for i, image in enumerate(images):
                image_path = os.path.join(output_dir, f'page_{i+1}.png')
                image.save(image_path, 'PNG')
                image_paths.append(image_path)
            
            return image_paths
        
        except Exception as e:
            self.logger.error(f"PDF to Image Conversion Error: {e}")
            raise

    def preprocess_image(self, image_path: str) -> np.ndarray:
        try:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read the image")

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )

            return thresh

        except Exception as e:
            self.logger.error(f"Image Preprocessing Error: {e}")
            raise

    def extract_text(self, image_path: str) -> str:
        try:
            result = self.ocr.ocr(image_path, cls=True)
            extracted_text = "\n".join([line[1][0] for lines in result for line in lines])
            
            # Print OCR extracted text to console
            print("\n--- OCR Extracted Text ---")
            print(extracted_text)
            print("\n--------------------------")
            
            return extracted_text
        except Exception as e:
            self.logger.error(f"Text Extraction Error: {e}")
            return ""

    def correct_name_format(self, raw_name: str) -> str:
        """Uses Gemini API to correct name formatting."""
        try:
            response = genai.generate_text(
                model="gemini-pro",
                prompt=f"Format the following name properly without extra spaces: {raw_name}"
            )
            return response.text.strip()
        except Exception as e:
            self.logger.error(f"Name Formatting Error: {e}")
            return raw_name

    def infer_gender(self, name: str) -> str:
        """Uses Gemini API to infer gender based on the name."""
        try:
            response = genai.generate_text(
                model="gemini-pro",
                prompt=f"Based on the name '{name}', infer the most likely gender (Male/Female). If uncertain, return 'Not applicable'."
            )
            return response.text.strip()
        except Exception as e:
            self.logger.error(f"Gender Inference Error: {e}")
            return "Not applicable"

    def extract_document_info(self, text: str) -> Dict[str, str]:
        doc_type = "Unknown"
        identifier, name, dob, gender, father_name = "Not found", "Not found", "Not found", "Not applicable", "Not found"

        # Identify document type
        if re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', text):
            doc_type = "Aadhar"
        elif re.search(r'\b[A-Z]{5}\d{4}[A-Z]\b', text):
            doc_type = "PAN"

        # Extract identifier
        match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', text)
        if match:
            identifier = match.group().replace(" ", "")
        else:
            match = re.search(r'\b[A-Z]{5}\d{4}[A-Z]\b', text)
            if match:
                identifier = match.group()

        # Split text into lines and clean them
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Improved name extraction
        name_patterns = {
            "Aadhar": [
                r'^Name\s*:?\s*(.+)$',
                r'Name\s*:?\s*(.+)'
            ],
            "PAN": [
                r'^Name\s*:?\s*(.+)$',
                r'Name\s*:?\s*(.+)',
                r'^([A-Z\s]+)$'  # Fallback for full uppercase names
            ]
        }

        # Search for name using patterns specific to document type
        name_found = False
        for pattern in name_patterns.get(doc_type, []):
            for line in lines:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    potential_name = match.group(1).strip()
                    # Filter out names that are too short or contain numbers
                    if len(potential_name.split()) > 1 and not re.search(r'\d', potential_name):
                        name = potential_name
                        name_found = True
                        break
            if name_found:
                break

        # Extract father's name for PAN card
        if doc_type == "PAN":
            father_name_patterns = [
                r'^Father\'?s?\s*Name\s*:?\s*(.+)$',
                r'Father\'?s?\s*Name\s*:?\s*(.+)'
            ]
            for pattern in father_name_patterns:
                for i, line in enumerate(lines):
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        potential_father_name = match.group(1).strip()
                        if len(potential_father_name.split()) > 1 and not re.search(r'\d', potential_father_name):
                            father_name = potential_father_name
                            break

        # Extract DOB
        dob_patterns = [
            r'\b(\d{2}/\d{2}/\d{4})\b',
            r'\b(\d{2}-\d{2}-\d{4})\b',
            r'\b(\d{2}\.\d{2}\.\d{4})\b'
        ]
        for pattern in dob_patterns:
            match = re.search(pattern, text)
            if match:
                dob = match.group(1)
                break

        # Gender inference for PAN card
        if doc_type == "PAN":
            gender = self.infer_gender(name)

        # Format names
        formatted_name = self.correct_name_format(name)
        formatted_father_name = self.correct_name_format(father_name)

        result = {
            "doc_type": doc_type,
            "identifier": identifier,
            "name": formatted_name,
            "dob": dob,
            "gender": gender,
            "father_name": formatted_father_name if doc_type == "PAN" else "Not applicable"
        }

        return result

    def format_output(self, extracted_info: Dict[str, str]) -> str:
        """Formats the extracted document information."""
        formatted_text = f"""
        Document Type: {extracted_info.get('doc_type', 'Unknown')}
        Identifier: {extracted_info.get('identifier', 'Not found')}
        Name: {extracted_info.get('name', 'Not found')}
        DOB: {extracted_info.get('dob', 'Not found')}
        Gender: {extracted_info.get('gender', 'Not applicable')}
        """
        if extracted_info.get('father_name') != "Not applicable":
            formatted_text += f"\nFather's Name: {extracted_info.get('father_name', 'Not found')}"

        return formatted_text.strip()



    def process_document(self, file_path: str) -> Dict[str, str]:
        try:
            # Check file type
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext == '.pdf':
                # Convert PDF to images
                temp_image_dir = os.path.join(os.path.dirname(file_path), 'temp_pdf_images')
                image_paths = self.convert_pdf_to_images(file_path, temp_image_dir)
                
                # Process first page (can be modified to process all pages)
                first_page_path = image_paths[0]
                preprocessed_image = self.preprocess_image(first_page_path)
                extracted_text = self.extract_text(first_page_path)
                
                # Clean up temporary images
                for img_path in image_paths:
                    os.remove(img_path)
                os.rmdir(temp_image_dir)
            else:
                # Process image file directly
                preprocessed_image = self.preprocess_image(file_path)
                extracted_text = self.extract_text(file_path)
            
            doc_info = self.extract_document_info(extracted_text)
            formatted_output = self.format_output(doc_info)

            self.logger.info(f"Extracted Document Info: {formatted_output}")
            return {
                "text": extracted_text,
                "info": doc_info,
                "formatted_output": formatted_output
            }

        except Exception as e:
            self.logger.error(f"Document Processing Error: {e}")
            return {
                "error": str(e)
            }

# Flask App Setup

# Create extractor instance
extractor = DocumentInfoExtractor()

@upload_bp.route('/upload', methods=['POST'])
def process_document():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            extracted_data = extractor.process_document(filepath)
            # return jsonify(result)
            if not extracted_data or 'doc_type' not in extracted_data:
                return jsonify({"error": "Failed to extract data or detect document type"}), 500

            doc_type = extracted_data['doc_type'].lower()
            if doc_type not in ['aadhar', 'pan']:
                return jsonify({"error": f"Unknown document type '{doc_type}' detected"}), 400

            # Get MongoDB instance
            db = current_app.config['DATABASE']
            # Hardcoded username for testing (replace with your logic if needed)
            username = "shreyas@gmail.com"

            # Fetch existing user data
            user_data = db.users.find_one({"username": username}) or {}
            target_field = "aadhar" if doc_type == "aadhar" else "pan"

            # Check if document data already exists
            if target_field in user_data and user_data[target_field]:
                existing_data = user_data[target_field]
                response = {
                    "message": f"{doc_type.capitalize()} data already exists. Please specify which fields to update.",
                    "existing_data": existing_data,
                    "new_data": extracted_data,
                    "fields_to_update": ["doc_type", "identifier", "name", "dob", "gender"]
                }
                return jsonify(response), 200
            else:
                # Insert new data if no existing record
                db.users.update_one(
                    {"username": username},
                    {"$set": {target_field: extracted_data}},
                    upsert=True
                )
                message = f"{doc_type.capitalize()} uploaded and data saved successfully!"
                return jsonify({"message": message, "data": extracted_data}), 200
        except Exception as e:
                return jsonify({"error": str(e)}), 500
        finally:
            # Optional: Remove the uploaded file after processing
            os.remove(filepath)
