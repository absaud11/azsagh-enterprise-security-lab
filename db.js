const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dataDirectory = path.join(__dirname, 'data');

fs.mkdirSync(dataDirectory, {
  recursive: true
});

let database;

async function getDb() {
  if (!database) {
    database = await open({
      filename: path.join(
        dataDirectory,
        'app.db'
      ),

      driver: sqlite3.Database
    });
  }

  return database;
}

async function initDb() {
  const db = await getDb();

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      username TEXT
        NOT NULL
        UNIQUE
        COLLATE NOCASE,

      password_hash TEXT
        NOT NULL,

      role TEXT
        NOT NULL
        CHECK(role IN ('employee', 'admin')),

      created_at TEXT
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      user_id INTEGER,

      username TEXT,

      action TEXT
        NOT NULL,

      success INTEGER
        NOT NULL,

      ip_address TEXT,

      user_agent TEXT,

      created_at TEXT
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY(user_id)
        REFERENCES users(id)
    );
  `);

  console.log(
    'Database initialized successfully.'
  );
}

module.exports = {
  getDb,
  initDb
};
