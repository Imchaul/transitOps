# Database Test Server

This folder contains the `test_db_server.py` script, which acts as a lightweight Flask application designed to verify that the database connection and Object-Relational Mapping (ORM) models are functioning properly.

## What it does

When executed, the script will:
1. Connect to the SQLite database. It will automatically resolve the path and create `transitops.db` in `infrastructure/database/` if it does not exist.
2. Automatically generate all the SQL tables defined in the SQLAlchemy Python models.
3. Start a local Flask web server on port 5000 exposing interactive test endpoints.

## How to Run

1. Open your terminal (PowerShell).
2. Ensure you have the required dependencies installed (`Flask` and `Flask-SQLAlchemy`).
3. Activate the project's virtual environment from the root folder:
   ```powershell
   H:\OdooHack2\transitops\myenv\Scripts\Activate.ps1
   ```
4. Navigate to this `tests` directory:
   ```powershell
   cd H:\OdooHack2\transitops\services\analytics-service\tests
   ```
5. Run the server:
   ```powershell
   python test_db_server.py
   ```

## Endpoints

Once the server is running on `http://127.0.0.1:5000/`, you can visit the following endpoints in your browser to test the database read/write capabilities:

* **`/` (GET)** : Displays a welcome message and a list of available endpoints.
* **`/init-db` (GET)** : Inserts a dummy "Test Vehicle" into the database and returns a success message confirming the write operation.
* **`/vehicles` (GET)** : Queries the database and returns a JSON array of all registered vehicles.
