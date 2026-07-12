from flask import Blueprint, jsonify, request
from src.middleware.rbac import role_required
from src.config.db import get_db_connection

fleet_bp = Blueprint('fleet', __name__)

@fleet_bp.route('/vehicles', methods=['GET'])
@role_required('Fleet Manager')
def get_vehicles():
    conn = get_db_connection()
    vehicles = conn.execute('''
        SELECT 
            v.*,
            t.trip_id AS active_trip_id,
            t.status AS active_trip_status,
            d.driver_name AS assigned_driver_name,
            d.driver_id AS assigned_driver_id
        FROM vehicles v
        LEFT JOIN trips t ON v.vehicle_id = t.vehicle_id AND t.status IN ('PENDING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS')
        LEFT JOIN drivers d ON t.driver_id = d.driver_id
    ''').fetchall()
    conn.close()
    return jsonify([dict(v) for v in vehicles]), 200

@fleet_bp.route('/vehicles', methods=['POST'])
@role_required('Fleet Manager')
def create_vehicle():
    conn = get_db_connection()
    data = request.json
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO vehicles (registration_number, vehicle_name, manufacturer, model, vehicle_type, year, fuel_type, max_load_capacity, acquisition_cost, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
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

@fleet_bp.route('/vehicles/<int:vehicle_id>', methods=['PUT'])
@role_required('Fleet Manager')
def update_vehicle(vehicle_id):
    conn = get_db_connection()
    data = request.json
    try:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE vehicles
            SET registration_number = ?, vehicle_name = ?, manufacturer = ?, model = ?,
                vehicle_type = ?, year = ?, fuel_type = ?, max_load_capacity = ?,
                acquisition_cost = ?, status = ?
            WHERE vehicle_id = ?
        ''', (
            data['registration_number'], data['vehicle_name'], data['manufacturer'],
            data['model'], data['vehicle_type'], data['year'], data['fuel_type'],
            data['max_load_capacity'], data.get('acquisition_cost', 0), data['status'],
            vehicle_id
        ))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Vehicle not found"}), 404
        conn.close()
        return jsonify({"message": "Vehicle updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@fleet_bp.route('/drivers', methods=['GET'])
@role_required('Fleet Manager')
def manage_drivers():
    conn = get_db_connection()
    drivers = conn.execute('''
        SELECT 
            d.*, 
            u.email, 
            u.is_active,
            t.trip_id AS active_trip_id,
            t.source AS active_trip_source,
            t.destination AS active_trip_destination,
            v.registration_number AS active_vehicle_registration
        FROM drivers d
        JOIN users u ON d.user_id = u.user_id
        LEFT JOIN trips t ON d.driver_id = t.driver_id AND t.status IN ('PENDING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS')
        LEFT JOIN vehicles v ON t.vehicle_id = v.vehicle_id
    ''').fetchall()
    conn.close()
    return jsonify([dict(d) for d in drivers]), 200

@fleet_bp.route('/trips', methods=['GET'])
@role_required('Fleet Manager')
def get_trips():
    conn = get_db_connection()
    trips = conn.execute('''
        SELECT 
            t.*,
            d.driver_name,
            u.email AS driver_email,
            v.registration_number,
            v.vehicle_name
        FROM trips t
        JOIN drivers d ON t.driver_id = d.driver_id
        JOIN users u ON d.user_id = u.user_id
        JOIN vehicles v ON t.vehicle_id = v.vehicle_id
        ORDER BY t.trip_id DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(t) for t in trips]), 200

@fleet_bp.route('/trips', methods=['POST'])
@role_required('Fleet Manager')
def create_trip():
    data = request.json
    driver_id = data.get('driver_id')
    vehicle_id = data.get('vehicle_id')
    
    if not all([driver_id, vehicle_id, data.get('source'), data.get('destination')]):
        return jsonify({"error": "Missing required fields"}), 400
        
    conn = get_db_connection()
    
    # 1. Check if driver is already assigned/occupied
    active_driver_trip = conn.execute('''
        SELECT COUNT(*) FROM trips 
        WHERE driver_id = ? AND status IN ('PENDING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS')
    ''', (driver_id,)).fetchone()[0]
    
    driver_status = conn.execute('SELECT status FROM drivers WHERE driver_id = ?', (driver_id,)).fetchone()
    
    if active_driver_trip > 0 or (driver_status and driver_status['status'] in ('SUSPENDED', 'OFF_DUTY')):
        conn.close()
        return jsonify({"error": "Driver is currently occupied or unavailable"}), 400
        
    # 2. Check if vehicle is already assigned/occupied
    active_vehicle_trip = conn.execute('''
        SELECT COUNT(*) FROM trips 
        WHERE vehicle_id = ? AND status IN ('PENDING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS')
    ''', (vehicle_id,)).fetchone()[0]
    
    vehicle_status = conn.execute('SELECT status FROM vehicles WHERE vehicle_id = ?', (vehicle_id,)).fetchone()
    
    if active_vehicle_trip > 0 or (vehicle_status and vehicle_status['status'] in ('IN_MAINTENANCE', 'RETIRED')):
        conn.close()
        return jsonify({"error": "Vehicle is currently occupied or unavailable"}), 400

    # Format destination to include metadata
    destination = data['destination']
    scheduled_time = data.get('scheduled_time', '')
    priority = data.get('priority', 'Normal')
    notes = data.get('notes', '')
    
    meta_str = f" [Scheduled: {scheduled_time}] [Priority: {priority}]"
    if notes:
        meta_str += f" (Notes: {notes})"
    full_destination = f"{destination}{meta_str}"

    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO trips (driver_id, vehicle_id, source, destination, cargo_weight, planned_distance, status)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING_ACCEPTANCE')
        ''', (
            driver_id, vehicle_id, data['source'], 
            full_destination, data.get('cargo_weight', 0), data.get('planned_distance', 0)
        ))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Trip created and assigned", "trip_id": new_id}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@fleet_bp.route('/trips/<int:trip_id>', methods=['DELETE'])
@role_required('Fleet Manager')
def delete_trip(trip_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Only delete if status is CREATED or PENDING_ACCEPTANCE
        cursor.execute('''
            DELETE FROM trips
            WHERE trip_id = ? AND status IN ('CREATED', 'PENDING_ACCEPTANCE')
        ''', (trip_id,))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Trip not found or has already been accepted/started"}), 400
        conn.close()
        return jsonify({"message": "Trip assignment removed successfully"}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@fleet_bp.route('/trips/<int:trip_id>/approve', methods=['PUT'])
@role_required('Fleet Manager')
def approve_trip(trip_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Set status to COMPLETED if it's currently PENDING_REVIEW
        cursor.execute('''
            UPDATE trips
            SET status = 'COMPLETED'
            WHERE trip_id = ? AND status = 'PENDING_REVIEW'
        ''', (trip_id,))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Trip not found or not pending review"}), 400
        conn.close()
        return jsonify({"message": "Trip completion approved successfully"}), 200
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@fleet_bp.route('/maintenance', methods=['GET'])
@role_required('Fleet Manager')
def get_maintenance():
    conn = get_db_connection()
    logs = conn.execute('''
        SELECT m.*, v.registration_number, v.vehicle_name, u.email AS created_by_email
        FROM maintenance m
        JOIN vehicles v ON m.vehicle_id = v.vehicle_id
        JOIN users u ON m.created_by = u.user_id
        ORDER BY m.maintenance_id DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(m) for m in logs]), 200

@fleet_bp.route('/maintenance', methods=['POST'])
@role_required('Fleet Manager')
def create_maintenance():
    from flask_jwt_extended import get_jwt
    user_id = get_jwt().get('sub')
    data = request.json
    
    vehicle_id = data.get('vehicle_id')
    title = data.get('title')
    
    if not vehicle_id or not title:
        return jsonify({"error": "Missing vehicle_id or title"}), 400
        
    conn = get_db_connection()
    
    # Format description to include metadata
    desc = data.get('description', '')
    m_type = data.get('maintenance_type', 'General')
    tech = data.get('technician', 'N/A')
    cost = data.get('cost', 0)
    m_date = data.get('maintenance_date', '')
    
    meta_desc = f"{desc}\nType: {m_type}\nTechnician: {tech}\nCost: ${cost}\nDate: {m_date}"
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO maintenance (vehicle_id, title, description, status, created_by)
            VALUES (?, ?, ?, 'ACTIVE', ?)
        ''', (vehicle_id, title, meta_desc, user_id))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"message": "Maintenance logged", "maintenance_id": new_id}), 201
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 400

@fleet_bp.route('/maintenance/<int:maintenance_id>/complete', methods=['PUT'])
@role_required('Fleet Manager')
def complete_maintenance(maintenance_id):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE maintenance
            SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
            WHERE maintenance_id = ? AND status = 'ACTIVE'
        ''', (maintenance_id,))
        conn.commit()
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Active maintenance record not found"}), 404
        conn.close()
        return jsonify({"message": "Maintenance marked as completed"}), 200
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
    stats['pending_trips'] = conn.execute("SELECT COUNT(*) FROM trips WHERE status = 'PENDING_ACCEPTANCE'").fetchone()[0]
    conn.close()
    return jsonify(stats), 200
