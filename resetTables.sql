-- Reset tables
DELETE FROM team_progress;
DELETE FROM teams;
DELETE FROM challenges;
DELETE FROM games;
DELETE FROM bonus_challenges;
DELETE FROM bonus_team_progress;
DELETE FROM push_subscriptions;

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