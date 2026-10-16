CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (length(trim(email)) BETWEEN 1 AND 254),
  message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 2000),
  rating INTEGER NOT NULL CHECK (typeof(rating) = 'integer' AND rating BETWEEN 1 AND 5),
  created_at INTEGER NOT NULL CHECK (typeof(created_at) = 'integer')
);
