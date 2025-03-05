from flask import request, jsonify, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

# Excluded routes - No JWT check for these
EXCLUDED_ROUTES = ['/auth/signin', '/auth/signup', '/']

def jwt_middleware():
    """
    Middleware to set g.current_user for all routes, skipping validation for excluded routes.
    Protected routes will handle JWT validation via @jwt_required().
    """
    if request.path in EXCLUDED_ROUTES:
        g.current_user = None  # No user for public routes
        return

    # For protected routes, @jwt_required() will handle validation
    # If we get here, either no token is required or token is valid
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        g.current_user = {"username": identity} if identity else None
    except Exception as e:
        g.current_user = None  # Fallback if token verification fails unexpectedly