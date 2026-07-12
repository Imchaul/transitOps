import sys
import os

# Add the src directory to sys.path so Python can find our modules (config, models, controllers)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from flask import Flask
from config.db import db, init_db

# Import all models so SQLAlchemy knows about them before calling create_all()
from models.MainManagementModel import Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
from models.FleetManagerModel import FleetManager
from models.DriverManagerModel import DriverManager

def run_test():
    app = Flask(__name__)
    
    # We can force the test database name here, or let init_db use the default 'transitops.db'
    app.config['DB_NAME'] = 'test_transitops.db'
    
    # Initialize the database with our Flask app
    init_db(app)
    
    with app.app_context():
        print("1. Connecting to the database and creating tables...")
        db.create_all()
        print("   [SUCCESS] Tables created successfully!")
        
        print("\n2. Testing database insertion...")
        # Check if test vehicle already exists
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
            print(f"   [SUCCESS] Successfully inserted vehicle '{test_vehicle.name_model}' with ID {test_vehicle.id}")
        else:
            print(f"   [SUCCESS] Found existing test vehicle with ID {test_vehicle.id}")
            
        print("\n3. Testing query and retrieval...")
        vehicles = Vehicle.query.all()
        print(f"   [SUCCESS] Retrieved {len(vehicles)} vehicle(s) from the database.")
        for v in vehicles:
            print(f"      - {v.registration_number}: {v.name_model} ({v.status})")
            
        print("\n[SUCCESS] Database test completed successfully!")

if __name__ == '__main__':
    run_test()
