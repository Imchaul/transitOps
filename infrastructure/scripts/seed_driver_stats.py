import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'transitops.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all drivers
cursor.execute("SELECT driver_id FROM drivers")
drivers = cursor.fetchall()

for (d_id,) in drivers:
    # Check if there are completed trips
    cursor.execute("SELECT COUNT(*) FROM trips WHERE driver_id = ? AND status = 'COMPLETED'", (d_id,))
    completed = cursor.fetchone()[0]
    
    if completed == 0:
        print(f"Adding completed trip for driver {d_id}")
        cursor.execute("""
            INSERT INTO trips (driver_id, vehicle_id, source, destination, planned_distance, status)
            VALUES (?, 1, 'Warehouse A', 'Store B', 120.5, 'COMPLETED')
        """, (d_id,))
    
    # Check if there are fuel logs
    cursor.execute("SELECT COUNT(*) FROM fuel_logs f JOIN trips t ON f.trip_id = t.trip_id WHERE t.driver_id = ?", (d_id,))
    fuel_count = cursor.fetchone()[0]
    
    if fuel_count == 0:
        print(f"Adding fuel log for driver {d_id}")
        # Get a trip_id for this driver
        cursor.execute("SELECT trip_id FROM trips WHERE driver_id = ? LIMIT 1", (d_id,))
        t = cursor.fetchone()
        if t:
            t_id = t[0]
            cursor.execute("""
                INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, fuel_date)
                VALUES (1, ?, 50.0, 75.50, DATE('now'))
            """, (t_id,))
        
conn.commit()
print("Database check and update complete!")
conn.close()
