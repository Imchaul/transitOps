from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(allowed_roles):
    """
    Custom decorator to protect API routes based on User roles.
    Validates the JWT and checks the 'role' claim.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({"error": "Missing or invalid token"}), 401
                
            claims = get_jwt()
            user_role = claims.get('role', None)
            
            if not user_role:
                return jsonify({"error": "Role missing in authorization token"}), 403
            
            roles_list = allowed_roles if isinstance(allowed_roles, list) else [allowed_roles]
            
            if user_role not in roles_list:
                return jsonify({"error": f"Access denied. Required role: {roles_list}, Found: {user_role}"}), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper