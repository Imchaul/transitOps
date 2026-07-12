import sqlite3
import os

def get_db_connection():
    """
    Establish a connection to the primary SQLite database.
    Returns a connection object configured to return dict-like rows.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.abspath(os.path.join(current_dir, "..", "..", "..", ".."))
    db_path = os.path.join(workspace_root, "infrastructure", "database", "transitops.db")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Allows column access by name
    
    # Enforce SQLite foreign key constraints
    conn.execute('PRAGMA foreign_keys = ON')
    return conn