from config.db import db
from models.MainManagementModel import Vehicle, FuelLog, Expense, MaintenanceLog, Trip

def add_fuel_log(vehicle_id, data):
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        raise ValueError("Vehicle not found")
        
    new_fuel_log = FuelLog(
        vehicle_id=vehicle.id,
        date=data['date'],
        liters=data['liters'],
        cost=data['cost']
    )
    db.session.add(new_fuel_log)
    db.session.commit()
    return new_fuel_log

def add_expense(vehicle_id, data):
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        raise ValueError("Vehicle not found")
        
    new_expense = Expense(
        vehicle_id=vehicle.id,
        date=data['date'],
        expense_type=data['expense_type'],
        amount=data['amount']
    )
    db.session.add(new_expense)
    db.session.commit()
    return new_expense

def get_financial_report(vehicle_id):
    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        raise ValueError("Vehicle not found")
    
    fuel_logs = FuelLog.query.filter_by(vehicle_id=vehicle.id).all()
    maintenance_logs = MaintenanceLog.query.filter_by(vehicle_id=vehicle.id).all()
    
    total_fuel_cost = sum(log.cost for log in fuel_logs)
    total_fuel_liters = sum(log.liters for log in fuel_logs)
    total_maintenance_cost = sum(log.cost for log in maintenance_logs)
    
    total_operational_cost = total_fuel_cost + total_maintenance_cost
    
    trips = Trip.query.filter_by(vehicle_id=vehicle.id, status='Completed').all()
    total_distance = sum(trip.planned_distance for trip in trips)
    
    fuel_efficiency = (total_distance / total_fuel_liters) if total_fuel_liters > 0 else 0
    revenue = total_distance * 5 
    
    roi = 0
    if vehicle.acquisition_cost > 0:
        roi = (revenue - total_operational_cost) / vehicle.acquisition_cost
    
    return {
        "vehicle_id": vehicle.id,
        "total_operational_cost": total_operational_cost,
        "fuel_efficiency_per_liter": round(fuel_efficiency, 2),
        "vehicle_roi": round(roi, 4)
    }
