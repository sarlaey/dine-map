-- Migration created at 2026-01-01T20:18:13.941Z

ALTER TABLE list ADD COLUMN icon varchar(4) DEFAULT '🍔' NOT NULL;
