CREATE TABLE agents (
  id INTEGER PRIMARY KEY CHECK (id > 0),
  seed_key TEXT UNIQUE,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('awaiting assessment', 'in care', 'recovering')),
  complaints TEXT NOT NULL
);
CREATE TABLE ailments (
  id INTEGER PRIMARY KEY CHECK (id > 0),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);
CREATE TABLE agent_ailments (
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  ailment_id INTEGER NOT NULL REFERENCES ailments(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, ailment_id)
);
CREATE TABLE seed_history (name TEXT PRIMARY KEY);
