from config.db import db
from models.MainManagementModel import Vehicle, MaintenanceLog, Trip, Driver

def create_vehicle(data):
    new_vehicle = Vehicle(
        registration_number=data['registration_number'],
        name_model=data['name_model'],
        type=data['type'],
        max_load_capacity=data['max_load_capacity'],
        odometer=data.get('odometer', 0.0),
        acquisition_cost=data['acquisition_cost']
    )
    db.session.add(new_vehicle)
    db.session.commit()
    return new_vehicle

def create_maintenance_log(vehicle_id, data):
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        raise ValueError("Vehicle not found")
        
    if vehicle.status == 'Retired':
        raise ValueError("Cannot perform maintenance on a retired vehicle")
        
    new_log = MaintenanceLog(
        vehicle_id=vehicle.id,
        date=data['date'],
        description=data['description'],
        cost=data.get('cost', 0.0)
    )
    
    vehicle.status = 'In Shop'
    
    db.session.add(new_log)
    db.session.commit()
    return new_log

def close_maintenance_log(log_id):
    log = MaintenanceLog.query.get(log_id)
    if not log:
        raise ValueError("Maintenance log not found")
        
    vehicle = Vehicle.query.get(log.vehicle_id)
    if not vehicle:
        raise ValueError("Vehicle not found")
        
    if vehicle.status != 'Retired':
        vehicle.status = 'Available'
        
    db.session.commit()
    return log

def get_dashboard_kpis():
    total_vehicles = Vehicle.query.count()
    active_vehicles = Vehicle.query.filter_by(status='On Trip').count()
    available_vehicles = Vehicle.query.filter_by(status='Available').count()
    maintenance_vehicles = Vehicle.query.filter_by(status='In Shop').count()
    
    active_trips = Trip.query.filter_by(status='Dispatched').count()
    pending_trips = Trip.query.filter_by(status='Draft').count()
    drivers_on_duty = Driver.query.filter_by(status='On Trip').count()
    
    fleet_utilization = (active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0
    
    return {
        "Active Vehicles": active_vehicles,
        "Available Vehicles": available_vehicles,
        "Vehicles in Maintenance": maintenance_vehicles,
        "Active Trips": active_trips,
        "Pending Trips": pending_trips,
        "Drivers On Duty": drivers_on_duty,
        "Fleet Utilization (%)": round(fleet_utilization, 2)
    }
