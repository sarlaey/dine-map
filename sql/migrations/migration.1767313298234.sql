-- Migration created at 2026-01-02T00:21:38.234Z

ALTER TABLE belongs_in_list ADD COLUMN added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
