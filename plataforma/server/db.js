// Banco local (SQLite embutido do Node, sem dependência nativa). Guarda apenas conta e situação da assinatura.
// Dados de cartão NUNCA passam por aqui: são digitados na página do provedor de pagamento (Stripe Checkout).
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export function openDb(dataDir) {
  if (dataDir !== ':memory:') fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(dataDir === ':memory:' ? ':memory:' : path.join(dataDir, 'app.db'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      pass_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      trial_ends_at INTEGER NOT NULL,
      stripe_customer TEXT,
      stripe_sub TEXT,
      sub_status TEXT,
      current_period_end INTEGER,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      synced_at INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, at INTEGER NOT NULL);`);
  if (!db.prepare('PRAGMA table_info(users)').all().some(c => c.name === 'checkout_session')) db.exec('ALTER TABLE users ADD COLUMN checkout_session TEXT');
  return db;
}
