from flask import Blueprint, jsonify, request
import bcrypt
from src.middleware.rbac import role_required
from src.config.db import get_db_connection

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@role_required('Admin')
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT user_id, email, role, is_active, created_at FROM users').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users]), 200

@admin_bp.route('/roles', methods=['PUT'])
@role_required('Admin')
def assign_roles():
    data = request.json
    user_id = data.get('user_id')
    new_role = data.get('role')
    
    if not user_id or not new_role:
        return jsonify({"error": "Missing user_id or role"}), 400
        
    valid_roles = ['Fleet Manager', 'Driver', 'Financial Analyst']
    if new_role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of {valid_roles}"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET role = ? WHERE user_id = ?', (new_role, user_id))
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "User not found"}), 404
        
    conn.close()
    return jsonify({"message": "Role updated successfully"}), 200

@admin_bp.route('/reset-password', methods=['PUT'])
@role_required('Admin')
def reset_password():
    data = request.json
    user_id = data.get('user_id')
    new_password = data.get('new_password')
    
    if not user_id or not new_password:
        return jsonify({"error": "Missing user_id or new_password"}), 400
        
    hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', (hashed_pw, user_id))
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({"error": "User not found"}), 404
        
    conn.close()
    return jsonify({"message": "Password reset successfully"}), 200