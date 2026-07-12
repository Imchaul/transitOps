-- ============================================================
-- TransitOps SQLite Schema
-- Location: infrastructure/database/schema.sql
-- Purpose: Single source of truth for all tables, constraints,
--          indexes, and triggers.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------
-- USERS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK(role IN ('Fleet Manager', 'Driver', 'Financial Analyst')),
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ---------------------------------------------------------
-- DRIVERS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS drivers (
    driver_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE,
    driver_name     TEXT NOT NULL,
    phone_number    TEXT NOT NULL,
    license_number  TEXT NOT NULL UNIQUE,
    license_expiry  DATE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED')),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

-- ---------------------------------------------------------
-- VEHICLES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT NOT NULL UNIQUE,
    vehicle_name        TEXT NOT NULL,
    manufacturer        TEXT NOT NULL,
    model               TEXT NOT NULL,
    vehicle_type        TEXT NOT NULL,
    year                INTEGER NOT NULL,
    fuel_type           TEXT NOT NULL,
    max_load_capacity   REAL NOT NULL,
    current_odometer    REAL NOT NULL DEFAULT 0,
    acquisition_cost    REAL NOT NULL DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'ON_TRIP', 'IN_MAINTENANCE', 'RETIRED')),
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_reg ON vehicles(registration_number);

-- ---------------------------------------------------------
-- TRIPS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
    trip_id             INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id           INTEGER NOT NULL,
    vehicle_id          INTEGER NOT NULL,
    source              TEXT NOT NULL,
    destination         TEXT NOT NULL,
    cargo_weight        REAL NOT NULL DEFAULT 0,
    planned_distance    REAL NOT NULL DEFAULT 0,
    actual_distance     REAL,
    status              TEXT NOT NULL DEFAULT 'CREATED' CHECK(status IN ('CREATED', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED')),
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at         DATETIME,
    started_at          DATETIME,
    ended_at            DATETIME,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- ---------------------------------------------------------
-- MAINTENANCE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id        INTEGER NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT,
    status            TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'COMPLETED')),
    created_by        INTEGER NOT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at      DATETIME,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);

-- ---------------------------------------------------------
-- FUEL LOGS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_logs (
    fuel_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id  INTEGER NOT NULL,
    trip_id     INTEGER,
    liters      REAL NOT NULL CHECK(liters > 0),
    cost        REAL NOT NULL CHECK(cost >= 0),
    fuel_date   DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_trip ON fuel_logs(trip_id);

-- ---------------------------------------------------------
-- EXPENSES
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    expense_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id      INTEGER NOT NULL,
    trip_id         INTEGER,
    expense_type    TEXT NOT NULL,
    amount          REAL NOT NULL CHECK(amount >= 0),
    description     TEXT,
    expense_date    DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);

-- ============================================================
-- TRIGGERS (Business Rules)
-- ============================================================

-- Rule: Creating an ACTIVE maintenance record automatically
-- changes the vehicle status to IN_MAINTENANCE.
CREATE TRIGGER IF NOT EXISTS trg_maintenance_active_set_vehicle
AFTER INSERT ON maintenance
FOR EACH ROW
WHEN NEW.status = 'ACTIVE'
BEGIN
    UPDATE vehicles
    SET status = 'IN_MAINTENANCE'
    WHERE vehicle_id = NEW.vehicle_id
      AND status != 'IN_MAINTENANCE';
END;

-- Rule: Completing maintenance restores vehicle to AVAILABLE.
CREATE TRIGGER IF NOT EXISTS trg_maintenance_complete_set_vehicle
AFTER UPDATE OF status ON maintenance
FOR EACH ROW
WHEN NEW.status = 'COMPLETED' AND OLD.status = 'ACTIVE'
BEGIN
    UPDATE vehicles
    SET status = 'AVAILABLE'
    WHERE vehicle_id = NEW.vehicle_id;
END;

-- Rule: Approving trip completion (status -> COMPLETED) restores
-- Vehicle -> AVAILABLE and Driver -> AVAILABLE.
CREATE TRIGGER IF NOT EXISTS trg_trip_complete_restore_availability
AFTER UPDATE OF status ON trips
FOR EACH ROW
WHEN NEW.status = 'COMPLETED' AND OLD.status = 'PENDING_REVIEW'
BEGIN
    UPDATE vehicles
    SET status = 'AVAILABLE'
    WHERE vehicle_id = NEW.vehicle_id;

    UPDATE drivers
    SET status = 'AVAILABLE'
    WHERE driver_id = NEW.driver_id;
END;

-- Rule: When a trip moves to IN_PROGRESS, lock driver and vehicle.
CREATE TRIGGER IF NOT EXISTS trg_trip_in_progress_lock
AFTER UPDATE OF status ON trips
FOR EACH ROW
WHEN NEW.status = 'IN_PROGRESS' AND OLD.status = 'ACCEPTED'
BEGIN
    UPDATE drivers
    SET status = 'ON_TRIP'
    WHERE driver_id = NEW.driver_id;

    UPDATE vehicles
    SET status = 'ON_TRIP'
    WHERE vehicle_id = NEW.vehicle_id;
END;

-- Rule: Enforce that user role must be 'Driver' to insert/update in drivers table.
CREATE TRIGGER IF NOT EXISTS trg_drivers_validate_user_role
BEFORE INSERT ON drivers
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN (SELECT role FROM users WHERE user_id = NEW.user_id) != 'Driver'
        THEN RAISE(ABORT, 'User role must be Driver to have a driver profile')
    END;
END;

-- Rule: Deleting/Updating role to non-driver automatically deletes driver profile.
CREATE TRIGGER IF NOT EXISTS trg_users_role_update_delete_driver
AFTER UPDATE OF role ON users
FOR EACH ROW
WHEN OLD.role = 'Driver' AND NEW.role != 'Driver'
BEGIN
    DELETE FROM drivers WHERE user_id = OLD.user_id;
END;

-- Rule: Updating role to driver automatically creates a default driver profile.
CREATE TRIGGER IF NOT EXISTS trg_users_role_update_create_driver
AFTER UPDATE OF role ON users
FOR EACH ROW
WHEN OLD.role != 'Driver' AND NEW.role = 'Driver'
BEGIN
    INSERT OR IGNORE INTO drivers (user_id, driver_name, phone_number, license_number, license_expiry, status)
    VALUES (
        NEW.user_id, 
        'New Driver', 
        '+1-555-0000', 
        'TEMP-' || NEW.user_id, 
        strftime('%Y-%m-%d', date('now', '+1 year')), 
        'AVAILABLE'
    );
END;