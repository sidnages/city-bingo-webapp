-- 1. Create Tables

-- Games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 7200, -- Default 2 hours
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
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Progress table
CREATE TABLE team_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, challenge_id)
);

-- 2. Enable Real-time (Supabase setting)
-- Note: You'll need to enable this in the Supabase Dashboard:
-- Database -> Replication -> supabase_realtime -> Source -> Tables -> Toggle on 'team_progress' and 'teams'

-- 3. Sample Data

-- Create a game
INSERT INTO games (id, name, duration_seconds) 
VALUES ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Downtown Explorer', 7200);

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
INSERT INTO teams (id, game_id, name) VALUES
('4f7b6b1a-9f5b-4c1a-8e1a-5b6b1a9f5b4c', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'The Explorers'),
('5a8c7c2b-0a6c-5d2b-9f2b-6c7c2b0a6c5d', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Urban Racers'),
('6b9d8d3c-1b7d-6e3c-0a3c-7d8d3c1b7d6e', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'City Sleuths');

-- 4. Enable RLS and Add Policies (For Prototype)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read team_progress" ON team_progress FOR SELECT USING (true);
CREATE POLICY "Allow public insert team_progress" ON team_progress FOR INSERT WITH CHECK (true);
