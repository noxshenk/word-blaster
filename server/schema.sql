-- Database Schema for Word Blaster

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  highscore INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  name_tag TEXT,
  profile_pic TEXT DEFAULT 'p1.png',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'pending', -- pending, active, completed
  winner_username TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id TEXT,
  username TEXT,
  score INTEGER DEFAULT 0,
  PRIMARY KEY (match_id, username)
);
