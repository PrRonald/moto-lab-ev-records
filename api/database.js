import { DatabaseSync } from 'node:sqlite';

// Inicializa el esquema de la primera versión y activa la integridad referencial.
export const openDatabase = (path) => {
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY, clientId INTEGER NOT NULL REFERENCES clients(id), model TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY, vehicleId INTEGER NOT NULL REFERENCES vehicles(id),
      startsAt TEXT NOT NULL, reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','cancelled'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS reserved_time ON appointments(startsAt) WHERE status='reserved';
    CREATE TABLE IF NOT EXISTS sessions (digest TEXT PRIMARY KEY, expires INTEGER NOT NULL);
  `);
  return db;
};

