-- Bonus Challenges table
CREATE TABLE bonus_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    release_at_minutes INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bonus Team Progress table
CREATE TABLE bonus_team_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    bonus_challenge_id UUID REFERENCES bonus_challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, bonus_challenge_id)
);

-- Enable RLS
ALTER TABLE bonus_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_team_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read bonus_challenges" ON bonus_challenges FOR SELECT USING (true);
CREATE POLICY "Allow public insert bonus_challenges" ON bonus_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete bonus_challenges" ON bonus_challenges FOR DELETE USING (true);

CREATE POLICY "Allow public read bonus_team_progress" ON bonus_team_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert bonus_team_progress" ON bonus_team_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete bonus_team_progress" ON bonus_team_progress FOR DELETE USING (true);

-- Enable Real-time
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE bonus_challenges;
  ALTER PUBLICATION supabase_realtime ADD TABLE bonus_team_progress;
COMMIT;

 -- Ensure delete permissions for bonus progress
CREATE POLICY "Allow public delete bonus_team_progress" 
ON bonus_team_progress FOR DELETE 
USING (true);

 -- Ensure delete permissions for the challenges themselves (used during config updates)
CREATE POLICY "Allow public delete bonus_challenges" 
ON bonus_challenges FOR DELETE 
USING (true);
