import sys
import os

# Add the src directory to sys.path so Python can find our modules (config, models, controllers)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from flask import Flask, jsonify
from config.db import db, init_db

# Import all models so SQLAlchemy knows about them before calling create_all()
from models.MainManagementModel import Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
from models.FleetManagerModel import FleetManager
from models.DriverManagerModel import DriverManager

# Create the Flask application
app = Flask(__name__)

# Initialize the database with our Flask app
init_db(app)

# Ensure tables are created when the app starts up
with app.app_context():
    db.create_all()

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Welcome to the TransitOps DB Test Server!",
        "endpoints": [
            "/init-db (Creates a test vehicle)",
            "/vehicles (Lists all vehicles in the database)"
        ]
    })

@app.route('/init-db', methods=['GET'])
def init_database():
    """Endpoint to insert dummy data into the database."""
    test_vehicle = Vehicle.query.filter_by(registration_number="TEST-1234").first()
    
    if not test_vehicle:
        # Create a new vehicle
        test_vehicle = Vehicle(
            registration_number="TEST-1234",
            name_model="Transit Test Van",
            type="Van",
            max_load_capacity=800.0,
            acquisition_cost=15000.0
        )
        db.session.add(test_vehicle)
        db.session.commit()
        return jsonify({"status": "SUCCESS", "message": f"Inserted vehicle '{test_vehicle.name_model}' with ID {test_vehicle.id}"})
    else:
        return jsonify({"status": "SUCCESS", "message": f"Found existing test vehicle with ID {test_vehicle.id}"})

@app.route('/vehicles', methods=['GET'])
def get_vehicles():
    """Endpoint to retrieve and display all vehicles."""
    vehicles = Vehicle.query.all()
    results = []
    for v in vehicles:
        results.append({
            "id": v.id,
            "registration_number": v.registration_number,
            "name_model": v.name_model,
            "status": v.status,
            "capacity": v.max_load_capacity
        })
    return jsonify({"status": "SUCCESS", "count": len(results), "vehicles": results})

if __name__ == '__main__':
    print("Starting Flask Test Server on http://127.0.0.1:5000")
    # Run the Flask development server
    app.run(debug=True, host='127.0.0.1', port=5000)
