# TransitOps

A modular fleet management backend featuring Role-Based Access Control (RBAC), JWT authentication, and automated database initialization.

## Prerequisites
- Node.js (v18+)
- Python (3.9+)

## 1. Database Initialization
This project uses SQLite for lightweight local development. The database schema, triggers, and seed data are initialized via a custom Node.js script.

1. Install the SQLite drivers for Node:
   ```bash
   npm install sqlite3
   ```
2. Run the initialization script to build tables and insert the seed data (Admin, Drivers, Vehicles, etc.):
   ```bash
   node infrastructure/scripts/init-db.js
   ```

## 2. Python API Backend (Auth & Services)
The core backend API is built using Python, Flask, Flask-JWT-Extended, and Flask-CORS.

1. Activate your virtual environment (or create a new one):
   ```bash
   # Windows
   python -m venv myenv
   .\myenv\Scripts\activate
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the API Gateway:
   ```bash
   # Make sure PYTHONPATH is set to the project root
   $env:PYTHONPATH="."
   python services/auth-service/src/app.py
   ```
   The API will start running on `http://127.0.0.1:8000`.

## API Architecture & Blueprints

The backend utilizes modular Flask Blueprints to enforce role-specific access (A valid JWT token must be passed in the `Authorization: Bearer <token>` header):
- **/api/auth**: Login and Registration (Generates the JWT)
- **/api/admin**: User management and Role assignment
- **/api/fleet**: Fleet tracking, driver assignment, and maintenance logging
- **/api/driver**: Trip acceptance and lifecycle updates
- **/api/finance**: Fuel logs, expenses, and dashboard aggregates
