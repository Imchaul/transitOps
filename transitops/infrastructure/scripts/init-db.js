#!/usr/bin/env node
/**
 * TransitOps — Database Initializer
 * Location: infrastructure/scripts/init-db.js
 */

const fs = require('fs');
const path = require('path');
const { getDb, closeDb, DB_PATH } = require('../../shared/config/database');

const SCHEMA_PATH = path.resolve(__dirname, '../database/schema.sql');
const SEED_PATH   = path.resolve(__dirname, '../database/seed.sql');

function fileExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function readSql(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function execSql(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getTableCount(db, tableName) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT COUNT(*) as cnt FROM ${tableName}`, [], (err, row) => {
      if (err) reject(err);
      else resolve(row.cnt);
    });
  });
}

async function main() {
  console.log('============================================');
  console.log('TransitOps — SQLite Database Initialization');
  console.log('============================================\n');

  if (!fileExists(SCHEMA_PATH)) {
    console.error(`ERROR: Schema file not found at ${SCHEMA_PATH}`);
    process.exit(1);
  }
  if (!fileExists(SEED_PATH)) {
    console.error(`ERROR: Seed file not found at ${SEED_PATH}`);
    process.exit(1);
  }

  const db = getDb();
  console.log(`[INIT] Database path: ${DB_PATH}\n`);

  console.log('[INIT] Applying schema.sql ...');
  try {
    await execSql(db, readSql(SCHEMA_PATH));
    console.log('[INIT] Schema applied successfully.\n');
  } catch (err) {
    console.error('[INIT] Schema failed:', err.message);
    closeDb(() => process.exit(1));
    return;
  }

  const userCount = await getTableCount(db, 'users');
  if (userCount === 0) {
    console.log('[INIT] Tables are empty. Applying seed.sql ...');
    try {
      await execSql(db, readSql(SEED_PATH));
      console.log('[INIT] Seed data applied successfully.\n');
    } catch (err) {
      console.error('[INIT] Seed failed:', err.message);
      closeDb(() => process.exit(1));
      return;
    }
  } else {
    console.log(`[INIT] Skipping seed.sql — ${userCount} user(s) already present.\n`);
  }

  console.log('--------------------------------------------');
  console.log('VERIFICATION REPORT');
  console.log('--------------------------------------------');
  const tables = [
    'users', 'drivers', 'vehicles', 'trips',
    'maintenance', 'fuel_logs', 'expenses'
  ];
  for (const t of tables) {
    const cnt = await getTableCount(db, t);
    console.log(`  ${t.padEnd(15)} | ${cnt.toString().padStart(4)} rows`);
  }
  console.log('--------------------------------------------');
  console.log('\nDatabase is ready. You can now start the services.\n');

  closeDb(() => process.exit(0));
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  closeDb(() => process.exit(1));
});