-- Idempotent schema for the productivity dashboard. Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS tasks (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  priority     SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tasks_open_idx ON tasks (due_date) WHERE completed_at IS NULL;

CREATE TABLE IF NOT EXISTS habits (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  color       TEXT NOT NULL DEFAULT 'emerald',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS habit_checkins (
  habit_id INTEGER NOT NULL REFERENCES habits (id) ON DELETE CASCADE,
  day      DATE NOT NULL,
  PRIMARY KEY (habit_id, day)
);

CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',
  pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id         SERIAL PRIMARY KEY,
  label      TEXT NOT NULL DEFAULT '',
  minutes    INTEGER NOT NULL CHECK (minutes BETWEEN 1 AND 600),
  ended_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS focus_sessions_ended_idx ON focus_sessions (ended_at);
