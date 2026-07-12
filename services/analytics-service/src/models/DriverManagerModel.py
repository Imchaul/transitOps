from config.db import db

class DriverManager(db.Model):
    __tablename__ = 'driver_manager'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='driver', nullable=False)
    status = db.Column(db.String(50), default='active', nullable=False)
    
    # Relationship with Trips that this driver/manager creates, assigns, and monitors
    trips = db.relationship("Trip", back_populates="driver_manager", cascade="all, delete-orphan")

class SafetyOfficer(db.Model):
    __tablename__ = 'safety_officer'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='safety_officer', nullable=False)
    status = db.Column(db.String(50), default='active', nullable=False)
    
    # Relationships for compliance and safety tracking
    compliance_audits = db.relationship("ComplianceAudit", back_populates="safety_officer", cascade="all, delete-orphan")

class FinancialAnalyst(db.Model):
    __tablename__ = 'financial_analyst'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='financial_analyst', nullable=False)
    status = db.Column(db.String(50), default='active', nullable=False)
    
    # Relationships for financial reviews (operational expenses, fuel consumption, maintenance costs)
    expense_reviews = db.relationship("ExpenseReview", back_populates="financial_analyst", cascade="all, delete-orphan")
