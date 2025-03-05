from flask import request, jsonify, current_app, g
from flask_jwt_extended import decode_token, get_jwt_identity, verify_jwt_in_request
from jwt import ExpiredSignatureError, InvalidTokenError
import functools

# Excluded routes - No JWT check for these
EXCLUDED_ROUTES = ['/signin', '/signup', '/']

def jwt_middleware():
    """
    Middleware to check JWT on all routes except excluded ones.
    """
    if request.path in EXCLUDED_ROUTES:
        return  # Skip token check for public routes

    try:
        verify_jwt_in_request(optional=True)  # Optional means only verify if token exists

        # Store user info globally (in Flask's `g` object)
        g.current_user = get_jwt_identity()

        if not g.current_user:
            return jsonify({"error": "Invalid token"}), 401

    except ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401

    except InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    except RuntimeError:
        # Handle case where no JWT is provided
        g.current_user = None
