from config.db import db

class FleetManager(db.Model):
    __tablename__ = 'fleet_manager'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='fleet_manager', nullable=False)
    region = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='active', nullable=False)
    
    # Relationships with Vehicles (assets) and MaintenanceLogs
    vehicles = db.relationship("Vehicle", back_populates="fleet_manager", cascade="all, delete-orphan")
    maintenance_logs = db.relationship("MaintenanceLog", back_populates="fleet_manager", cascade="all, delete-orphan")
