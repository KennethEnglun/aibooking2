import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initializeDb() {
  db = await open({ filename: 'aibooking.db', driver: sqlite3.Database });
  // Enable FK
  await db.exec('PRAGMA foreign_keys = ON');

  // Create tables if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_id INTEGER NOT NULL,
      title TEXT,
      start DATETIME NOT NULL,
      end DATETIME NOT NULL,
      recurrence_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(venue_id) REFERENCES venues(id),
      FOREIGN KEY(recurrence_id) REFERENCES recurrences(id)
    );

    CREATE TABLE IF NOT EXISTS recurrences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule TEXT NOT NULL -- RRULE string
    );
  `);

  // Seed venues if empty
  const venues = [
    ...Array.from({ length: 4 }, (_, i) => `${101 + i}`),
    ...Array.from({ length: 4 }, (_, i) => `${201 + i}`),
    ...Array.from({ length: 4 }, (_, i) => `${301 + i}`),
    '音樂室',
    '活動室',
    '英語室',
    '電腦室',
    '電競室',
    '禮堂',
    '操場',
    '廚房',
    '輔導室',
  ];

  for (const name of venues) {
    await db.run('INSERT OR IGNORE INTO venues (name) VALUES (?)', name);
  }

  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('DB not initialized');
  }
  return db;
} 