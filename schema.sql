-- LSAT Tracker — Neon/Postgres schema.
-- Run this once in the Neon SQL editor (or `psql "$DATABASE_URL" -f schema.sql`)
-- against a fresh database before pointing the app at it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tasks (
  date        TEXT PRIMARY KEY,          -- 'YYYY-MM-DD'
  title       TEXT NOT NULL DEFAULT '',
  cat         TEXT NOT NULL DEFAULT '',
  planned_min INTEGER NOT NULL DEFAULT 0,
  skip        BOOLEAN NOT NULL DEFAULT FALSE,
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  actual_min  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS journal (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date       TEXT NOT NULL,               -- 'YYYY-MM-DD'
  mode       TEXT,                        -- 'LR' | 'RC'
  source     TEXT,                        -- 'Section' | 'Drill' | 'PT'
  qtype      TEXT,
  level      INTEGER,
  time_sec   INTEGER,
  test       TEXT,
  section    TEXT,
  q          TEXT,
  why_wrong  TEXT,
  why_right  TEXT,
  created_at BIGINT
);
CREATE INDEX IF NOT EXISTS journal_date_idx ON journal(date);

CREATE TABLE IF NOT EXISTS scores (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date       TEXT NOT NULL,
  kind       TEXT,                        -- 'LR' | 'RC' | 'Drill' | 'PT'
  mode       TEXT,                        -- 'LR' | 'RC' | null for PT
  raw        INTEGER,
  total      INTEGER,
  scaled     INTEGER,                     -- full-PT scaled score
  time_sec   INTEGER,
  br         TEXT,                        -- blind-review note, e.g. "90%" or "155"
  note       TEXT,
  created_at BIGINT
);
CREATE INDEX IF NOT EXISTS scores_date_idx ON scores(date);

CREATE TABLE IF NOT EXISTS config (
  id                    INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- single row
  weekly_goal_min       INTEGER,
  start_date            TEXT,
  tracker_start         TEXT,
  baseline_minutes      INTEGER,
  prior_days_completed  INTEGER,
  prior_best_streak     INTEGER,
  prior_streak_into     INTEGER,
  prior_weeks           JSONB
);
