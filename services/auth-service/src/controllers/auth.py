import sqlite3
import bcrypt
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from src.config.db import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    if not all([email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400
        
    if role == 'Admin':
        return jsonify({"error": "Cannot register as Admin. Admin account is hardcoded."}), 403
        
    valid_roles = ['Fleet Manager', 'Driver', 'Financial Analyst']
    if role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of {valid_roles}"}), 400
        
    # Hash the password
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (email, password_hash, role, is_active)
            VALUES (?, ?, ?, 1)
        ''', (email, hashed_pw, role))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # If role is Driver, we must inject into the drivers table as well
        if role == 'Driver':
            driver_name = data.get('driver_name')
            phone = data.get('phone_number')
            license_num = data.get('license_number')
            license_expiry = data.get('license_expiry')
            
            if not all([driver_name, phone, license_num, license_expiry]):
                conn.execute('DELETE FROM users WHERE user_id = ?', (user_id,))
                conn.commit()
                return jsonify({"error": "Driver registration requires driver_name, phone_number, license_number, license_expiry"}), 400
                
            cursor.execute('''
                INSERT INTO drivers (user_id, driver_name, phone_number, license_number, license_expiry, status)
                VALUES (?, ?, ?, ?, ?, 'AVAILABLE')
            ''', (user_id, driver_name, phone, license_num, license_expiry))
            conn.commit()
            
    except sqlite3.IntegrityError:
        conn.rollback()
        return jsonify({"error": "User with this email or license number already exists"}), 409
    finally:
        conn.close()
        
    return jsonify({"message": "User registered successfully", "user_id": user_id}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400
        
    # Check for hardcoded Admin credentials
    if email == "admin@transitops.local" and password == "admin123":
        access_token = create_access_token(identity="admin_id", additional_claims={"role": "Admin"})
        return jsonify({"access_token": access_token, "role": "Admin", "message": "Admin Login Successful"}), 200
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT user_id, password_hash, role, is_active FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
        
    if user['is_active'] == 0:
        return jsonify({"error": "Account is disabled"}), 403
        
    # Verify bcrypt password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401
        
    access_token = create_access_token(identity=str(user['user_id']), additional_claims={"role": user['role']})
    
    return jsonify({"access_token": access_token, "role": user['role'], "message": "Login Successful"}), 200