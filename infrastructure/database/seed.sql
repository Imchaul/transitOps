-- ============================================================
-- TransitOps Seed Data
-- Location: infrastructure/database/seed.sql
-- Run this AFTER schema.sql has been applied.
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------
-- USERS (1 Fleet Manager, 3 Drivers, 1 Financial Analyst)
-- Password hash for all: bcrypt hash of 'password123'
-- ---------------------------------------------------------
INSERT INTO users (email, password_hash, role, is_active, created_at) VALUES
('fleet.mgr@transitops.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fleet Manager', 1, '2026-07-05 10:00:00'),
('driver1@transitops.local',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Driver', 1, '2026-07-05 10:00:00'),
('driver2@transitops.local',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Driver', 1, '2026-07-05 10:00:00'),
('driver3@transitops.local',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Driver', 1, '2026-07-05 10:00:00'),
('finance@transitops.local',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Financial Analyst', 1, '2026-07-05 10:00:00');

-- ---------------------------------------------------------
-- DRIVERS
-- ---------------------------------------------------------
INSERT INTO drivers (user_id, driver_name, phone_number, license_number, license_expiry, status, created_at) VALUES
(2, 'John Doe',      '+1-555-0101', 'DL-2024-001', '2026-12-31', 'AVAILABLE',  '2026-07-05 10:00:00'),
(3, 'Jane Smith',    '+1-555-0102', 'DL-2024-002', '2026-11-30', 'ON_TRIP',    '2026-07-05 10:00:00'),
(4, 'Bob Wilson',    '+1-555-0103', 'DL-2024-003', '2027-01-15', 'AVAILABLE',  '2026-07-05 10:00:00');

-- ---------------------------------------------------------
-- VEHICLES (5 units)
-- ---------------------------------------------------------
INSERT INTO vehicles (registration_number, vehicle_name, manufacturer, model, vehicle_type, year, fuel_type, max_load_capacity, current_odometer, acquisition_cost, status, created_at) VALUES
('ABC-1234', 'Truck Alpha',   'Ford',      'F-150',       'TRUCK',       2022, 'DIESEL', 2000.0, 15000.0, 35000.00, 'AVAILABLE',       '2026-07-05 10:00:00'),
('XYZ-5678', 'Van Beta',      'Mercedes',  'Sprinter',    'VAN',         2021, 'DIESEL', 1500.0, 28000.0, 42000.00, 'ON_TRIP',         '2026-07-05 10:00:00'),
('DEF-9012', 'Truck Gamma',   'Volvo',     'FH16',        'HEAVY_TRUCK', 2023, 'DIESEL', 5000.0,  5000.0, 120000.00, 'IN_MAINTENANCE',  '2026-07-05 10:00:00'),
('GHI-3456', 'Pickup Delta',  'Toyota',    'Hilux',       'PICKUP',      2022, 'PETROL', 1000.0, 22000.0, 28000.00, 'AVAILABLE',       '2026-07-05 10:00:00'),
('JKL-7890', 'Van Epsilon',   'Ford',      'Transit',     'VAN',         2021, 'PETROL', 1200.0, 35000.0, 32000.00, 'AVAILABLE',       '2026-07-05 10:00:00');

-- ---------------------------------------------------------
-- TRIPS (3 trips in various lifecycle stages)
-- ---------------------------------------------------------
INSERT INTO trips (driver_id, vehicle_id, source, destination, cargo_weight, planned_distance, actual_distance, status, created_at, accepted_at, started_at, ended_at) VALUES
(3, 4, 'Port Terminal',      'Warehouse C',        2000.0,  80.0,  85.0, 'COMPLETED',          '2026-07-09 08:00:00', '2026-07-09 08:15:00', '2026-07-09 08:30:00', '2026-07-11 14:00:00'),
(2, 2, 'Warehouse A',        'Distribution B',     1200.0, 450.0, NULL, 'IN_PROGRESS',        '2026-07-11 09:00:00', '2026-07-11 09:30:00', '2026-07-12 06:00:00', NULL),
(1, 1, 'Depot Central',        'Retail Store North',  800.0, 120.0, NULL, 'PENDING_ACCEPTANCE', '2026-07-12 08:00:00', NULL,               NULL,               NULL);

-- ---------------------------------------------------------
-- MAINTENANCE (1 active record for Truck Gamma)
-- Trigger will automatically set vehicle status to IN_MAINTENANCE.
-- ---------------------------------------------------------
INSERT INTO maintenance (vehicle_id, title, description, status, created_by, created_at, completed_at) VALUES
(3, 'Scheduled Engine Service', 'Oil change, filter replacement, brake inspection', 'ACTIVE', 1, '2026-07-12 09:00:00', NULL);

-- ---------------------------------------------------------
-- FUEL LOGS
-- ---------------------------------------------------------
INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date) VALUES
(2, 2,  80.0, 120.00, '2026-07-12'),
(4, 1,  45.0,  70.00, '2026-07-09'),
(1, NULL, 60.0,  90.00, '2026-07-05'),
(3, NULL, 100.0, 150.00, '2026-07-05');

-- ---------------------------------------------------------
-- EXPENSES
-- ---------------------------------------------------------
INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, description, expense_date) VALUES
(2, 2,  'TOLL',       25.00, 'Highway toll I-95',         '2026-07-12'),
(4, 1,  'PARKING',    15.00, 'Overnight parking fee',     '2026-07-09'),
(1, NULL, 'REPAIR',   200.00, 'Tire replacement',          '2026-07-05'),
(3, NULL, 'INSURANCE', 500.00, 'Monthly fleet insurance',   '2026-07-05'),
(2, NULL, 'CLEANING',  35.00, 'Interior deep cleaning',    '2026-07-11');