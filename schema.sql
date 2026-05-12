-- ==========================================
-- CONSOLIDATED CITY BINGO SCHEMA
-- ==========================================

-- 0. Clean Up
DROP TABLE IF EXISTS team_progress CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS bonus_challenges CASCADE;
DROP TABLE IF EXISTS bonus_team_progress CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- 1. Create Tables

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
    name TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 7200,
    admin_passcode TEXT,
    points_per_square INTEGER NOT NULL DEFAULT 1,
    points_per_bingo INTEGER NOT NULL DEFAULT 2,
    points_per_unique INTEGER NOT NULL DEFAULT 2,
    require_instagram BOOLEAN NOT NULL DEFAULT FALSE,
    game_rules TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    stopped_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenges table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    position INTEGER NOT NULL, -- 0-24
    is_free_space BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    team_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
    name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, name)
);

-- Team Progress table
CREATE TABLE team_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    instagram_url TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, challenge_id)
);

-- Bonus Challenges table
CREATE TABLE bonus_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bonus Team Progress table
CREATE TABLE bonus_team_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    bonus_challenge_id UUID REFERENCES bonus_challenges(id) ON DELETE CASCADE,
    instagram_url TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, bonus_challenge_id)
);

-- Push Subscriptions table
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Real-time
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE team_progress;
  ALTER PUBLICATION supabase_realtime ADD TABLE teams;
  ALTER PUBLICATION supabase_realtime ADD TABLE games;
  ALTER PUBLICATION supabase_realtime ADD TABLE bonus_challenges;
  ALTER PUBLICATION supabase_realtime ADD TABLE bonus_team_progress;
  ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;
COMMIT;

-- 3. Enable RLS and Add Policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_team_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Games Policies
CREATE POLICY "Allow public read games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update games" ON games FOR UPDATE USING (true);

-- Challenges Policies
CREATE POLICY "Allow public read challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow public insert challenges" ON challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete challenges" ON challenges FOR DELETE USING (true);

-- Teams Policies
CREATE POLICY "Allow public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete teams" ON teams FOR DELETE USING (true);

-- Team Progress Policies
CREATE POLICY "Allow public read team_progress" ON team_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert team_progress" ON team_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete team_progress" ON team_progress FOR DELETE USING (true);

-- Bonus Challenges Policies
CREATE POLICY "Allow public read bonus_challenges" ON bonus_challenges FOR SELECT USING (true);
CREATE POLICY "Allow public insert bonus_challenges" ON bonus_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete bonus_challenges" ON bonus_challenges FOR DELETE USING (true);

-- Bonus Team Progress Policies
CREATE POLICY "Allow public read bonus_team_progress" ON bonus_team_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert bonus_team_progress" ON bonus_team_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete bonus_team_progress" ON bonus_team_progress FOR DELETE USING (true);

-- Push Subscriptions Policies
CREATE POLICY "Allow public read push_subscriptions" ON push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert push_subscriptions" ON push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update push_subscriptions" ON push_subscriptions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete push_subscriptions" ON push_subscriptions FOR DELETE USING (true);

-- 4. Sample Data (Optional)

-- Create a game
INSERT INTO games (id, game_code, name, duration_seconds, admin_passcode, require_instagram) 
VALUES ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'CITY26', 'Downtown Explorer', 7200, '7421', false);

-- Create challenges (25 for a 5x5 grid)
INSERT INTO challenges (game_id, title, description, position, is_free_space) VALUES
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Find a Blue Door', 'Locate and take a picture of a bright blue residential door.', 0, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Street Performer', 'Watch a street performer for at least 2 minutes.', 1, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Local Coffee', 'Buy a drink from a non-chain coffee shop.', 2, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Historic Plaque', 'Find a blue or green historic plaque and read it.', 3, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Statue Selfie', 'Take a selfie with a public statue.', 4, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Red Mailbox', 'Find a classic red pillar box or mailbox.', 5, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Flower Bed', 'Find a well-maintained public flower bed.', 6, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Street Art', 'Find a piece of mural or street art.', 7, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Park Bench', 'Sit on a park bench for 1 minute.', 8, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Bicycle Rack', 'Find a full bicycle rack.', 9, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Library', 'Visit the local public library.', 10, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Clock Tower', 'Find a clock on a building.', 11, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'FREE SPACE', 'Enjoy the game!', 12, true),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Fountain', 'Find a water fountain.', 13, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Bridge', 'Cross a bridge (even a small one).', 14, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Market Stall', 'Buy something from a market stall.', 15, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Green Space', 'Walk through a park.', 16, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Public Map', 'Find a "You are here" map.', 17, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Bus Stop', 'Find a bus stop with a digital display.', 18, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Old Tree', 'Find a particularly large or old tree.', 19, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Church', 'Find a church or place of worship.', 20, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Post Office', 'Find a local post office.', 21, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Cobbled Street', 'Walk on a cobbled street.', 22, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Modern Building', 'Find a building with lots of glass.', 23, false),
('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Public Phone', 'Find a public telephone box.', 24, false);

-- Create teams
INSERT INTO teams (id, game_id, team_code, name) VALUES
('4f7b6b1a-9f5b-4c1a-8e1a-5b6b1a9f5b4c', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'EXPLOR', 'The Explorers'),
('5a8c7c2b-0a6c-5d2b-9f2b-6c7c2b0a6c5d', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'RACERS', 'Urban Racers'),
('6b9d8d3c-1b7d-6e3c-0a3c-7d8d3c1b7d6e', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'SLEUTH', 'City Sleuths');
