from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt
from src.middleware.rbac import role_required
from src.config.db import get_db_connection

driver_bp = Blueprint('driver', __name__)

def get_driver_id_by_user(user_id):
    conn = get_db_connection()
    row = conn.execute('SELECT driver_id FROM drivers WHERE user_id = ?', (user_id,)).fetchone()
    conn.close()
    return row['driver_id'] if row else None

@driver_bp.route('/trips/assigned', methods=['GET'])
@role_required('Driver')
def assigned_trips():
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    if not driver_id:
        return jsonify({"error": "Driver profile not found"}), 404
        
    conn = get_db_connection()
    trips = conn.execute('SELECT * FROM trips WHERE driver_id = ?', (driver_id,)).fetchall()
    conn.close()
    return jsonify([dict(t) for t in trips]), 200

@driver_bp.route('/trips/<int:trip_id>/accept', methods=['PUT'])
@role_required('Driver')
def accept_trip(trip_id):
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE trips SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP 
        WHERE trip_id = ? AND driver_id = ? AND status = 'PENDING_ACCEPTANCE'
    ''', (trip_id, driver_id))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    
    if rowcount == 0:
        return jsonify({"error": "Trip not found or not in PENDING_ACCEPTANCE status"}), 400
    return jsonify({"message": f"Trip {trip_id} accepted successfully"}), 200

@driver_bp.route('/trips/<int:trip_id>/start', methods=['PUT'])
@role_required('Driver')
def start_trip(trip_id):
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE trips SET status = 'IN_PROGRESS', started_at = CURRENT_TIMESTAMP 
        WHERE trip_id = ? AND driver_id = ? AND status = 'ACCEPTED'
    ''', (trip_id, driver_id))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    
    if rowcount == 0:
        return jsonify({"error": "Trip not found or not in ACCEPTED status"}), 400
    return jsonify({"message": f"Trip {trip_id} started successfully"}), 200

@driver_bp.route('/trips/<int:trip_id>/complete', methods=['PUT'])
@role_required('Driver')
def complete_trip(trip_id):
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE trips SET status = 'PENDING_REVIEW', ended_at = CURRENT_TIMESTAMP 
        WHERE trip_id = ? AND driver_id = ? AND status = 'IN_PROGRESS'
    ''', (trip_id, driver_id))
    conn.commit()
    rowcount = cursor.rowcount
    conn.close()
    
    if rowcount == 0:
        return jsonify({"error": "Trip not found or not IN_PROGRESS"}), 400
    return jsonify({"message": f"Trip {trip_id} submitted for review"}), 200

@driver_bp.route('/profile', methods=['GET'])
@role_required('Driver')
def view_profile():
    user_id = get_jwt().get('sub')
    conn = get_db_connection()
    profile = conn.execute('SELECT * FROM drivers WHERE user_id = ?', (user_id,)).fetchone()
    conn.close()
    
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(dict(profile)), 200