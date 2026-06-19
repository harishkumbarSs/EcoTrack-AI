import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function initializeDatabase(): void {
  const dbPath = process.env.DB_PATH || './data/ecotrack.db';
  const dbDir = path.dirname(dbPath);

  // Ensure data directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations();
  logger.info(`SQLite database connected at: ${dbPath}`);
}

function runMigrations(): void {
  const database = getDatabase();

  database.exec(`
    -- Activities table: stores all user activity entries
    CREATE TABLE IF NOT EXISTS activities (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT    NOT NULL,
      type        TEXT    NOT NULL CHECK(type IN ('transport','electricity','food','waste')),
      sub_type    TEXT    NOT NULL,
      value       REAL    NOT NULL CHECK(value > 0),
      unit        TEXT    NOT NULL,
      co2e        REAL    NOT NULL CHECK(co2e >= 0),
      date        TEXT    NOT NULL,
      notes       TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_activities_session_date
      ON activities(session_id, date);

    CREATE INDEX IF NOT EXISTS idx_activities_type
      ON activities(session_id, type);

    -- Goals table: user's daily carbon reduction goal
    CREATE TABLE IF NOT EXISTS goals (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id        TEXT    NOT NULL,
      target_kg_per_day REAL    NOT NULL CHECK(target_kg_per_day > 0),
      start_date        TEXT    NOT NULL,
      created_at        TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_goals_session
      ON goals(session_id);

    -- Achievements table: earned badges per session
    CREATE TABLE IF NOT EXISTS achievements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT    NOT NULL,
      badge_id   TEXT    NOT NULL,
      earned_at  TEXT    DEFAULT (datetime('now')),
      UNIQUE(session_id, badge_id)
    );

    CREATE INDEX IF NOT EXISTS idx_achievements_session
      ON achievements(session_id);
  `);

  logger.info('Database migrations applied successfully');
}

// For testing: close and reset the database
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database.Database;
  }
}

// For testing: use in-memory database
export function initializeTestDatabase(): void {
  db = new Database(':memory:');
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations();
}
