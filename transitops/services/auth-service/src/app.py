from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import blueprints
from src.controllers.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.fleet_manager import fleet_bp
from src.routes.driver import driver_bp
from src.routes.financial_analyst import finance_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configure JWT
    app.config["JWT_SECRET_KEY"] = "super-secret-transitops-key-for-dev"
    jwt = JWTManager(app)
    
    # Custom JWT unauthorized responses
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Request does not contain an access token."}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Signature verification failed. Invalid token."}), 401
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(fleet_bp, url_prefix='/api/fleet')
    app.register_blueprint(driver_bp, url_prefix='/api/driver')
    app.register_blueprint(finance_bp, url_prefix='/api/finance')
    
    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "running", 
            "service": "Auth & RBAC Gateway",
            "message": "TransitOps API Gateway active"
        })
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=8000)
