from datetime import datetime
from config.db import db
from models.MainManagementModel import Driver, Trip, Vehicle
from models.DriverManagerModel import DriverManager

def create_driver(data):
    new_driver = Driver(
        name=data['name'],
        license_number=data['license_number'],
        license_category=data['license_category'],
        license_expiry_date=data['license_expiry_date'],
        contact_number=data['contact_number'],
        safety_score=data.get('safety_score', 100.0)
    )
    db.session.add(new_driver)
    db.session.commit()
    return new_driver

def create_trip(data):
    new_trip = Trip(
        source=data['source'],
        destination=data['destination'],
        vehicle_id=data['vehicle_id'],
        driver_id=data['driver_id'],
        cargo_weight=data['cargo_weight'],
        planned_distance=data['planned_distance']
    )
    db.session.add(new_trip)
    db.session.commit()
    return new_trip

def dispatch_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        raise ValueError("Trip not found")
        
    if trip.status != 'Draft':
        raise ValueError("Only Draft trips can be dispatched")
        
    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)
    
    if not vehicle or not driver:
        raise ValueError("Vehicle or Driver not found")
        
    if vehicle.status in ['Retired', 'In Shop']:
        raise ValueError("Vehicle is not available for dispatch")
    if vehicle.status == 'On Trip' or driver.status == 'On Trip':
        raise ValueError("Vehicle or Driver is already on another trip")
    if driver.status == 'Suspended':
        raise ValueError("Driver is suspended")
        
    if driver.license_expiry_date and driver.license_expiry_date < datetime.now().date():
        raise ValueError("Driver license is expired")
        
    if trip.cargo_weight > vehicle.max_load_capacity:
        raise ValueError(f"Cargo weight ({trip.cargo_weight}) exceeds vehicle capacity ({vehicle.max_load_capacity})")

    trip.status = 'Dispatched'
    vehicle.status = 'On Trip'
    driver.status = 'On Trip'
    
    db.session.commit()
    return trip

def complete_trip(trip_id, final_odometer=None):
    trip = Trip.query.get(trip_id)
    if not trip:
        raise ValueError("Trip not found")
        
    if trip.status != 'Dispatched':
        raise ValueError("Only Dispatched trips can be completed")
        
    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)
    
    trip.status = 'Completed'
    vehicle.status = 'Available'
    driver.status = 'Available'
    
    if final_odometer:
        vehicle.odometer = final_odometer
        
    db.session.commit()
    return trip

def cancel_trip(trip_id):
    trip = Trip.query.get(trip_id)
    if not trip:
        raise ValueError("Trip not found")
        
    if trip.status != 'Dispatched':
        raise ValueError("Only Dispatched trips can be cancelled")
        
    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)
    
    trip.status = 'Cancelled'
    vehicle.status = 'Available'
    driver.status = 'Available'
    
    db.session.commit()
    return trip
