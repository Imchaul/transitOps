from config.db import db

class Vehicle(db.Model):
    __tablename__ = 'vehicle'
    
    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False)
    name_model = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    max_load_capacity = db.Column(db.Float, nullable=False)
    odometer = db.Column(db.Float, nullable=False, default=0.0)
    acquisition_cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Available', nullable=False) # Available, On Trip, In Shop, Retired
    
    # Links to FleetManager
    fleet_manager_id = db.Column(db.Integer, db.ForeignKey('fleet_manager.id'), nullable=True)
    fleet_manager = db.relationship("FleetManager", back_populates="vehicles")
    
    # Relationships
    trips = db.relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_logs = db.relationship("MaintenanceLog", back_populates="vehicle", cascade="all, delete-orphan")
    fuel_logs = db.relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = db.relationship("Expense", back_populates="vehicle", cascade="all, delete-orphan")


class Driver(db.Model):
    __tablename__ = 'driver'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(100), unique=True, nullable=False)
    license_category = db.Column(db.String(50), nullable=False)
    license_expiry_date = db.Column(db.Date, nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
    safety_score = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), default='Available', nullable=False) # Available, On Trip, Off Duty, Suspended
    
    # Relationships
    trips = db.relationship("Trip", back_populates="driver", cascade="all, delete-orphan")


class Trip(db.Model):
    __tablename__ = 'trip'
    
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(200), nullable=False)
    destination = db.Column(db.String(200), nullable=False)
    cargo_weight = db.Column(db.Float, nullable=False)
    planned_distance = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Draft', nullable=False) # Draft, Dispatched, Completed, Cancelled
    
    # Foreign Keys
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('driver.id'), nullable=False)
    driver_manager_id = db.Column(db.Integer, db.ForeignKey('driver_manager.id'), nullable=True)
    
    # Relationships
    vehicle = db.relationship("Vehicle", back_populates="trips")
    driver = db.relationship("Driver", back_populates="trips")
    driver_manager = db.relationship("DriverManager", back_populates="trips")


class MaintenanceLog(db.Model):
    __tablename__ = 'maintenance_log'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    cost = db.Column(db.Float, nullable=False, default=0.0)
    
    # Link to FleetManager
    fleet_manager_id = db.Column(db.Integer, db.ForeignKey('fleet_manager.id'), nullable=True)
    fleet_manager = db.relationship("FleetManager", back_populates="maintenance_logs")
    
    # Relationships
    vehicle = db.relationship("Vehicle", back_populates="maintenance_logs")


class FuelLog(db.Model):
    __tablename__ = 'fuel_log'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    liters = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    
    # Relationships
    vehicle = db.relationship("Vehicle", back_populates="fuel_logs")


class Expense(db.Model):
    __tablename__ = 'expense'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicle.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    expense_type = db.Column(db.String(100), nullable=False) # Toll, Maintenance, etc.
    amount = db.Column(db.Float, nullable=False)
    
    # Relationships
    vehicle = db.relationship("Vehicle", back_populates="expenses")
