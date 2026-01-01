-- Migration created at 2026-01-01T20:47:36.304Z

ALTER TABLE restaurant ADD COLUMN icon varchar(4) DEFAULT '🍔' NOT NULL;
