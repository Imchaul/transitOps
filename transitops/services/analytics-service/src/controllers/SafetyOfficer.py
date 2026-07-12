from datetime import datetime
from config.db import db
from models.MainManagementModel import Driver

def get_compliance_report():
    today = datetime.now().date()
    drivers = Driver.query.all()
    
    non_compliant = []
    for driver in drivers:
        try:
            expiry_days_left = (driver.license_expiry_date - today).days
            is_expired = expiry_days_left < 0
        except Exception:
            is_expired = False
            
        if is_expired or driver.status == 'Suspended' or (driver.safety_score and driver.safety_score < 70):
            non_compliant.append({
                "id": driver.id,
                "name": driver.name,
                "license_expiry_date": str(driver.license_expiry_date),
                "expired": is_expired,
                "safety_score": driver.safety_score,
                "status": driver.status
            })
            
    return non_compliant

def update_safety_score(driver_id, safety_score):
    driver = Driver.query.get(driver_id)
    if not driver:
        raise ValueError("Driver not found")
        
    driver.safety_score = safety_score
    db.session.commit()
    return driver

def suspend_driver(driver_id):
    driver = Driver.query.get(driver_id)
    if not driver:
        raise ValueError("Driver not found")
        
    driver.status = 'Suspended'
    db.session.commit()
    return driver
