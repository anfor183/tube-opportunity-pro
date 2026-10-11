const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'youtube_intelligence.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    
    // Initialize schema
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    dbInstance.exec(schemaSql);
  }
  return dbInstance;
}

module.exports = {
  getDb,
  DB_PATH
};
