const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Error: TURSO_CONNECTION_URL is not set in the environment.");
  process.exit(1);
}

console.log(`Connecting to LibSQL/Turso database at: ${url}`);

const db = createClient({
  url: url,
  authToken: authToken || undefined,
});

// Helper function to initialize database tables from schema.sql
async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Strip SQL comments and empty lines
    const cleanSql = schemaSql
      .split('\n')
      .map(line => line.replace(/--.*$/, '').trim()) // Strip single-line comments
      .join('\n');

    // Split statements by semicolon and filter out empty strings
    const statements = cleanSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log("Initializing database schema...");
    for (const stmt of statements) {
      await db.execute(stmt);
    }

    try {
      await db.execute('ALTER TABLE users ADD COLUMN name_tag TEXT');
      console.log("Added name_tag column to users table");
    } catch (e) {
      // Already exists
    }

    try {
      await db.execute("ALTER TABLE users ADD COLUMN profile_pic TEXT DEFAULT 'p1.png'");
      console.log("Added profile_pic column to users table");
    } catch (e) {
      // Already exists
    }

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

module.exports = {
  db,
  initDatabase
};
