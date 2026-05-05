-- 1. Add admin_passcode to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS admin_passcode TEXT;

-- 2. Update RLS Policies to allow public game creation and challenge management
-- Note: In a production app, you might want to restrict this to authenticated users.

-- Allow public insert to games (for creating a game)
CREATE POLICY "Allow public insert games" ON games FOR INSERT WITH CHECK (true);

-- Allow public update to games (for editing a game)
-- Ideally this would be checked against admin_passcode, but for simplicity in a prototype 
-- we rely on the application logic and open RLS.
CREATE POLICY "Allow public update games" ON games FOR UPDATE USING (true);

-- Allow public insert to challenges (for creating challenges for a game)
CREATE POLICY "Allow public insert challenges" ON challenges FOR INSERT WITH CHECK (true);

-- Allow public delete to challenges (for re-inserting challenges during edit)
-- 3. Add started_at to teams table for team-specific timing
ALTER TABLE teams ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;
CREATE POLICY "Allow public update teams" ON teams FOR UPDATE USING (true) WITH CHECK (true);
