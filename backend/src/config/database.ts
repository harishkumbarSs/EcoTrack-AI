import knex, { Knex } from 'knex';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

let db: Knex;

export function getDatabase(): Knex {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export async function initializeDatabase(): Promise<void> {
  const dbPath = process.env.DB_PATH || './data/ecotrack.db';
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = knex({
    client: 'sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true,
    pool: { min: 1, max: 1 },
  });

  await runMigrations();
  logger.info(`SQLite database connected at: ${dbPath}`);
}

async function runMigrations(): Promise<void> {
  const database = getDatabase();

  // Activities
  const hasActivities = await database.schema.hasTable('activities');
  if (!hasActivities) {
    await database.schema.createTable('activities', (table) => {
      table.increments('id').primary();
      table.string('session_id').notNullable().index();
      table.string('type').notNullable();
      table.string('sub_type').notNullable();
      table.float('value').notNullable();
      table.string('unit').notNullable();
      table.float('co2e').notNullable();
      table.string('date').notNullable().index();
      table.string('notes').defaultTo('');
      table.timestamp('created_at').defaultTo(database.fn.now());
    });
  }

  // Goals
  const hasGoals = await database.schema.hasTable('goals');
  if (!hasGoals) {
    await database.schema.createTable('goals', (table) => {
      table.increments('id').primary();
      table.string('session_id').notNullable().index();
      table.float('target_kg_per_day').notNullable();
      table.string('start_date').notNullable();
      table.timestamp('created_at').defaultTo(database.fn.now());
    });
  }

  // Achievements
  const hasAchievements = await database.schema.hasTable('achievements');
  if (!hasAchievements) {
    await database.schema.createTable('achievements', (table) => {
      table.increments('id').primary();
      table.string('session_id').notNullable().index();
      table.string('badge_id').notNullable();
      table.timestamp('earned_at').defaultTo(database.fn.now());
      table.unique(['session_id', 'badge_id']);
    });
  }

  logger.info('Database migrations applied successfully');
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    db = undefined as unknown as Knex;
  }
}

export async function initializeTestDatabase(): Promise<void> {
  db = knex({
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    pool: { min: 1, max: 1 },
  });
  await runMigrations();
}
