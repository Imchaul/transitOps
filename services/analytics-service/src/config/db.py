import os
from flask_sqlalchemy import SQLAlchemy

# Initialize the Flask-SQLAlchemy ORM instance
db = SQLAlchemy()

def init_db(app):
    """
    Configure and initialize the Flask-SQLAlchemy database connection using SQLite.
    
    This function reads connection details from environment variables:
      - DATABASE_URL: Full connection string (e.g. sqlite:///transitops.db)
      - DB_NAME: Database filename (defaults to 'transitops.db')
    """
    # 1. Retrieve the Database URI
    database_uri = os.getenv("DATABASE_URL")
    
    if not database_uri:
        db_name = os.getenv("DB_NAME", "transitops.db")
        
        # Calculate absolute path for transitops/infrastructure/database
        # __file__ is transitops/services/analytics-service/src/config/db.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        workspace_root = os.path.abspath(os.path.join(current_dir, "..", "..", "..", ".."))
        db_folder = os.path.join(workspace_root, "infrastructure", "database")
        
        # Ensure the directory exists
        os.makedirs(db_folder, exist_ok=True)
        
        # Formulate absolute file path
        db_path = os.path.join(db_folder, db_name)
        
        # Format the SQLite URI with the absolute path
        # Note: on Windows, we format as sqlite:///C:\path\to\db.db
        database_uri = f"sqlite:///{db_path}"
    
    # 2. Configure Flask App Database Settings
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # 3. Initialize the app with the database instance
    db.init_app(app)