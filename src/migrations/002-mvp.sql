CREATE TABLE therapies (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 9007199254740991),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);
CREATE TABLE ailment_therapies (
  ailment_id INTEGER NOT NULL REFERENCES ailments(id) ON DELETE CASCADE,
  therapy_id INTEGER NOT NULL REFERENCES therapies(id) ON DELETE CASCADE,
  PRIMARY KEY (ailment_id, therapy_id)
);
CREATE TABLE therapists (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 9007199254740991),
  seed_key TEXT UNIQUE,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL
);
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY CHECK (id BETWEEN 1 AND 9007199254740991),
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  therapist_id INTEGER NOT NULL REFERENCES therapists(id),
  starts_at INTEGER NOT NULL CHECK (typeof(starts_at) = 'integer' AND starts_at % 60000 = 0),
  ends_at INTEGER NOT NULL CHECK (typeof(ends_at) = 'integer' AND ends_at = starts_at + 1800000),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);
CREATE INDEX appointments_agent_time ON appointments(agent_id, starts_at) WHERE status = 'scheduled';
CREATE INDEX appointments_therapist_time ON appointments(therapist_id, starts_at) WHERE status = 'scheduled';
