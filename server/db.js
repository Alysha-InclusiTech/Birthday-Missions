const path = require('path');
const Database = require('better-sqlite3');
const { missions } = require('./data/missions');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tag TEXT NOT NULL,
    points INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    mission_id INTEGER NOT NULL REFERENCES missions(id),
    file_path TEXT NOT NULL,
    media_type TEXT NOT NULL,
    submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, mission_id)
  );
`);

const seedStmt = db.prepare(
  `INSERT INTO missions (number, title, description, tag, points) VALUES (@number, @title, @description, @tag, @points)
   ON CONFLICT(number) DO UPDATE SET title=excluded.title, description=excluded.description, tag=excluded.tag, points=excluded.points`
);
const seedAll = db.transaction((rows) => {
  rows.forEach((row) => seedStmt.run(row));
});
seedAll(missions);

module.exports = db;
