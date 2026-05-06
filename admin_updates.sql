-- Add started_at and stopped_at to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS stopped_at TIMESTAMP WITH TIME ZONE;
