/**
 * TransitOps — Shared SQLite Database Connection
 * Location: shared/config/database.js
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.TRANSITOPS_DB_PATH 
  || path.resolve(__dirname, '../../infrastructure/database/transitops.db');

let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Failed to open SQLite database:', err.message);
        throw err;
      }
      console.log(`[DB] Connected to SQLite at ${DB_PATH}`);
    });
    db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

function closeDb(callback) {
  if (db) {
    db.close((err) => {
      if (err) console.error('Error closing DB:', err.message);
      else console.log('[DB] Connection closed.');
      db = null;
      if (callback) callback(err);
    });
  } else if (callback) {
    callback();
  }
}

function query(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  getDb,
  closeDb,
  query,
  run,
  DB_PATH,
};