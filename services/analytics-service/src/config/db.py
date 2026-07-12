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
        # Format the SQLite URI (relative path to the project root/working directory)
        database_uri = f"sqlite:///{db_name}"
    
    # 2. Configure Flask App Database Settings
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # 3. Initialize the app with the database instance
    db.init_app(app)