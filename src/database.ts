import Database from 'better-sqlite3';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type ClinicDatabase = Database.Database;
export const defaultDatabasePath = './data/agentclinic.sqlite';

export function openDatabase(path = process.env.DATABASE_PATH ?? defaultDatabasePath): ClinicDatabase {
  try {
    if (!path.trim()) throw new Error('DATABASE_PATH must not be empty');
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    const db = new Database(path);
    db.pragma('foreign_keys = ON');
    return db;
  } catch (error) {
    throw new Error(`Cannot open clinic database at ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function migrate(db: ClinicDatabase, directory = new URL('./migrations/', import.meta.url)) {
  db.exec('CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY)');
  for (const name of readdirSync(directory).filter((name) => name.endsWith('.sql')).sort()) {
    db.transaction(() => {
      if (db.prepare('SELECT name FROM migrations WHERE name = ?').get(name)) return;
      db.exec(readFileSync(new URL(name, directory), 'utf8'));
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(name);
    }).immediate();
  }
}

export function requireSchema(db: ClinicDatabase) {
  const hasHistory = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'migrations'").get();
  const names = readdirSync(new URL('./migrations/', import.meta.url)).filter((name) => name.endsWith('.sql'));
  if (!hasHistory || names.some((name) => !db.prepare('SELECT name FROM migrations WHERE name = ?').get(name))) {
    throw new Error('Clinic database is not migrated. Run npm run db:migrate before starting.');
  }
  // Fail before listening if schema/history was manually damaged.
  for (const table of ['agents', 'ailments', 'agent_ailments', 'therapies', 'ailment_therapies', 'therapists', 'appointments', 'seed_history']) {
    if (!db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(table)) {
      throw new Error('Clinic database schema is incomplete. Restore the database or apply the documented migrations.');
    }
  }
}

export interface Agent { id: number; name: string; model_type: string; status: string; complaints: string }
export interface Ailment { id: number; name: string; description: string }
export function listAgents(db: ClinicDatabase) {
  return db.prepare<[], Agent>('SELECT id, name, model_type, status, complaints FROM agents ORDER BY name, id').all();
}
export function findAgent(db: ClinicDatabase, id: number) {
  return db.prepare<[number], Agent>('SELECT id, name, model_type, status, complaints FROM agents WHERE id = ?').get(id);
}
export function listAilments(db: ClinicDatabase) {
  return db.prepare<[], Ailment>('SELECT * FROM ailments ORDER BY name, id').all();
}
export function agentAilments(db: ClinicDatabase, id: number) {
  return db.prepare<[number], Ailment>(`SELECT a.* FROM ailments a JOIN agent_ailments link ON link.ailment_id = a.id
    WHERE link.agent_id = ? ORDER BY a.name, a.id`).all(id);
}
