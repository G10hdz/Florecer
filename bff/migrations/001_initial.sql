PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  firefly_pat_encrypted TEXT NOT NULL DEFAULT '',
  companion_mood INTEGER NOT NULL DEFAULT 50,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goals (
  goal_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  firefly_piggy_bank_id INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL,
  deadline TEXT NOT NULL,
  xp_total INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_id TEXT NOT NULL,
  firefly_transaction_id INTEGER NOT NULL DEFAULT 0,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  note TEXT,
  xp_earned INTEGER NOT NULL,
  streak_at_deposit INTEGER NOT NULL,
  mood_change INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mood_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mood INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_user_goal ON deposits(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mood_history_user_created ON mood_history(user_id, created_at);
