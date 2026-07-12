from flask import Blueprint, jsonify, request
from src.middleware.rbac import role_required
from src.config.db import get_db_connection

finance_bp = Blueprint('finance', __name__)

@finance_bp.route('/dashboard', methods=['GET'])
@role_required('Financial Analyst')
def dashboard():
    conn = get_db_connection()
    stats = {}
    
    fuel = conn.execute('SELECT SUM(cost) FROM fuel_logs').fetchone()[0]
    stats['total_fuel_cost'] = float(fuel) if fuel else 0.0
    
    expenses = conn.execute('SELECT SUM(amount) FROM expenses').fetchone()[0]
    stats['total_expenses'] = float(expenses) if expenses else 0.0
    
    conn.close()
    return jsonify(stats), 200

@finance_bp.route('/fuel-logs', methods=['GET', 'POST'])
@role_required('Financial Analyst')
def fuel_logs():
    conn = get_db_connection()
    
    if request.method == 'GET':
        logs = conn.execute('SELECT * FROM fuel_logs').fetchall()
        conn.close()
        return jsonify([dict(l) for l in logs]), 200
        
    if request.method == 'POST':
        data = request.json
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
                VALUES (?, ?, ?, ?, ?)
            ''', (data['vehicle_id'], data.get('trip_id'), data['liters'], data['cost'], data['fuel_date']))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()
            return jsonify({"message": "Fuel log created", "fuel_log_id": new_id}), 201
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({"error": str(e)}), 400

@finance_bp.route('/expenses', methods=['GET', 'POST'])
@role_required('Financial Analyst')
def expenses():
    conn = get_db_connection()
    
    if request.method == 'GET':
        logs = conn.execute('SELECT * FROM expenses').fetchall()
        conn.close()
        return jsonify([dict(l) for l in logs]), 200
        
    if request.method == 'POST':
        data = request.json
        try:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, description, expense_date)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (data['vehicle_id'], data.get('trip_id'), data['expense_type'], data['amount'], data.get('description'), data['expense_date']))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()
            return jsonify({"message": "Expense logged", "expense_id": new_id}), 201
        except Exception as e:
            conn.rollback()
            conn.close()
            return jsonify({"error": str(e)}), 400

@finance_bp.route('/reports', methods=['GET'])
@role_required('Financial Analyst')
def reports():
    conn = get_db_connection()
    # Basic report: Expenses by Type
    data = conn.execute('SELECT expense_type, SUM(amount) as total FROM expenses GROUP BY expense_type').fetchall()
    conn.close()
    return jsonify([dict(r) for r in data]), 200

@finance_bp.route('/analytics', methods=['GET'])
@role_required('Financial Analyst')
def analytics():
    # Placeholder for more complex ROI calculation
    return jsonify({"message": "Analytics engine running. ROI calculation coming soon."}), 200
