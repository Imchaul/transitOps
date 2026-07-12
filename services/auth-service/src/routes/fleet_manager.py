from flask import Blueprint, jsonify, request
from src.middleware.rbac import role_required
from src.config.db import get_db_connection

fleet_bp = Blueprint('fleet', __name__)

@fleet_bp.route('/vehicles', methods=['GET', 'POST'])
@role_required('Fleet Manager')
def manage_vehicles():
    conn = get_db_connection()
    
    if request.method == 'GET':
        vehicles = conn.execute('SELECT * FROM vehicles').fetchall()
        conn.close()
        return jsonify([dict(v) for v in vehicles]), 200
        
    if request.method == 'POST':
        data = request.json
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO vehicles (registration_number, vehicle_name, manufacturer, model, vehicle_type, year, fuel_type, max_load_capacity, acquisition_cost)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['registration_number'], data['vehicle_name'], data['manufacturer'], 
                data['model'], data['vehicle_type'], data['year'], data['fuel_type'], 
                data['max_load_capacity'], data.get('acquisition_cost', 0)
            ))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()
            return jsonify({"message": "Vehicle created", "vehicle_id": new_id}), 201
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({"error": str(e)}), 400

@fleet_bp.route('/drivers', methods=['GET'])
@role_required('Fleet Manager')
def manage_drivers():
    conn = get_db_connection()
    drivers = conn.execute('''
        SELECT d.*, u.email, u.is_active 
        FROM drivers d
        JOIN users u ON d.user_id = u.user_id
    ''').fetchall()
    conn.close()
    return jsonify([dict(d) for d in drivers]), 200

@fleet_bp.route('/trips', methods=['GET', 'POST'])
@role_required('Fleet Manager')
def manage_trips():
    conn = get_db_connection()
    
    if request.method == 'GET':
        trips = conn.execute('SELECT * FROM trips').fetchall()
        conn.close()
        return jsonify([dict(t) for t in trips]), 200
        
    if request.method == 'POST':
        data = request.json
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO trips (driver_id, vehicle_id, source, destination, cargo_weight, planned_distance, status)
                VALUES (?, ?, ?, ?, ?, ?, 'CREATED')
            ''', (
                data['driver_id'], data['vehicle_id'], data['source'], 
                data['destination'], data['cargo_weight'], data['planned_distance']
            ))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()
            return jsonify({"message": "Trip created", "trip_id": new_id}), 201
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({"error": str(e)}), 400

@fleet_bp.route('/maintenance', methods=['GET', 'POST'])
@role_required('Fleet Manager')
def manage_maintenance():
    conn = get_db_connection()
    
    if request.method == 'GET':
        logs = conn.execute('SELECT * FROM maintenance').fetchall()
        conn.close()
        return jsonify([dict(m) for m in logs]), 200
        
    if request.method == 'POST':
        from flask_jwt_extended import get_jwt
        user_id = get_jwt().get('sub')
        data = request.json
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO maintenance (vehicle_id, title, description, status, created_by)
                VALUES (?, ?, ?, 'ACTIVE', ?)
            ''', (data['vehicle_id'], data['title'], data.get('description', ''), user_id))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()
            return jsonify({"message": "Maintenance logged", "maintenance_id": new_id}), 201
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({"error": str(e)}), 400

@fleet_bp.route('/dashboard', methods=['GET'])
@role_required('Fleet Manager')
def dashboard():
    conn = get_db_connection()
    stats = {}
    stats['total_vehicles'] = conn.execute('SELECT COUNT(*) FROM vehicles').fetchone()[0]
    stats['active_trips'] = conn.execute("SELECT COUNT(*) FROM trips WHERE status = 'IN_PROGRESS'").fetchone()[0]
    stats['vehicles_in_maintenance'] = conn.execute("SELECT COUNT(*) FROM vehicles WHERE status = 'IN_MAINTENANCE'").fetchone()[0]
    conn.close()
    return jsonify(stats), 200
