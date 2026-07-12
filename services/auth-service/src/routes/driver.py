from flask import Blueprint, jsonify, request
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
    
    # Validation: Driver can only have one active trip
    active_count = cursor.execute('''
        SELECT COUNT(*) FROM trips 
        WHERE driver_id = ? AND status IN ('ACCEPTED', 'IN_PROGRESS')
    ''', (driver_id,)).fetchone()[0]
    
    if active_count > 0:
        conn.close()
        return jsonify({"error": "Cannot accept new trips while you have an active trip."}), 400

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

@driver_bp.route('/trips/<int:trip_id>/expenses', methods=['POST'])
@role_required('Driver')
def log_expense(trip_id):
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    conn = get_db_connection()
    trip = conn.execute('SELECT vehicle_id FROM trips WHERE trip_id = ? AND driver_id = ? AND status IN ("ACCEPTED", "IN_PROGRESS")', (trip_id, driver_id)).fetchone()
    if not trip:
        conn.close()
        return jsonify({"error": "Invalid trip or trip not active"}), 400
        
    data = request.json
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, description, expense_date)
            VALUES (?, ?, ?, ?, ?, DATE('now'))
        ''', (trip['vehicle_id'], trip_id, data['expense_type'], data['amount'], data.get('description')))
        conn.commit()
        conn.close()
        return jsonify({"message": "Expense logged"}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@driver_bp.route('/trips/<int:trip_id>/fuel', methods=['POST'])
@role_required('Driver')
def log_fuel(trip_id):
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    conn = get_db_connection()
    trip = conn.execute('SELECT vehicle_id FROM trips WHERE trip_id = ? AND driver_id = ? AND status IN ("ACCEPTED", "IN_PROGRESS")', (trip_id, driver_id)).fetchone()
    if not trip:
        conn.close()
        return jsonify({"error": "Invalid trip or trip not active"}), 400
        
    data = request.json
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
            VALUES (?, ?, ?, ?, DATE('now'))
        ''', (trip['vehicle_id'], trip_id, data['liters'], data['cost']))
        conn.commit()
        conn.close()
        return jsonify({"message": "Fuel logged"}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@driver_bp.route('/stats', methods=['GET'])
@role_required('Driver')
def driver_stats():
    user_id = get_jwt().get('sub')
    driver_id = get_driver_id_by_user(user_id)
    
    conn = get_db_connection()
    # Fuel expenses for this driver
    fuel = conn.execute('''
        SELECT SUM(f.cost) FROM fuel_logs f
        JOIN trips t ON f.trip_id = t.trip_id
        WHERE t.driver_id = ?
    ''', (driver_id,)).fetchone()[0]
    
    # Earnings for this driver (e.g., $1.50 per planned_distance km for completed trips)
    earnings = conn.execute('''
        SELECT SUM(planned_distance) * 1.5 FROM trips
        WHERE driver_id = ? AND status = 'COMPLETED'
    ''', (driver_id,)).fetchone()[0]
    
    conn.close()
    
    return jsonify({
        "total_fuel_expenses": float(fuel) if fuel else 0.0,
        "total_earnings": float(earnings) if earnings else 0.0
    }), 200

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
