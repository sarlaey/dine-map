-- Migration created at 2026-01-01T19:05:28.939Z

CREATE TABLE list(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE belongs_in_list (
  list_id UUID REFERENCES list(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurant(id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, restaurant_id)
);
