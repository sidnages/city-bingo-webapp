import type { Challenge, Team, Game } from '../types/game';

export const MOCK_GAMES: Game[] = [
  {
    id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    game_code: 'CITY26',
    name: 'Downtown Explorer',
    duration_seconds: 7200,
    created_at: new Date().toISOString()
  }
];

export const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Find a Blue Door', description: 'Locate and take a picture of a bright blue residential door.', position: 0, is_free_space: false, isCompleted: false },
  { id: '2', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Street Performer', description: 'Watch a street performer for at least 2 minutes.', position: 1, is_free_space: false, isCompleted: false },
  { id: '3', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Local Coffee', description: 'Buy a drink from a non-chain coffee shop.', position: 2, is_free_space: false, isCompleted: false },
  { id: '4', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Historic Plaque', description: 'Find a blue or green historic plaque and read it.', position: 3, is_free_space: false, isCompleted: false },
  { id: '5', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Statue Selfie', description: 'Take a selfie with a public statue.', position: 4, is_free_space: false, isCompleted: false },
  { id: '6', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Red Mailbox', description: 'Find a classic red pillar box or mailbox.', position: 5, is_free_space: false, isCompleted: false },
  { id: '7', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Flower Bed', description: 'Find a well-maintained public flower bed.', position: 6, is_free_space: false, isCompleted: false },
  { id: '8', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Street Art', description: 'Find a piece of mural or street art.', position: 7, is_free_space: false, isCompleted: false },
  { id: '9', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Park Bench', description: 'Sit on a park bench for 1 minute.', position: 8, is_free_space: false, isCompleted: false },
  { id: '10', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Bicycle Rack', description: 'Find a full bicycle rack.', position: 9, is_free_space: false, isCompleted: false },
  { id: '11', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Library', description: 'Visit the local public library.', position: 10, is_free_space: false, isCompleted: false },
  { id: '12', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Clock Tower', description: 'Find a clock on a building.', position: 11, is_free_space: false, isCompleted: false },
  { id: 'free', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'FREE SPACE', description: 'Enjoy the game!', position: 12, is_free_space: true, isCompleted: true },
  { id: '14', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Fountain', description: 'Find a water fountain.', position: 13, is_free_space: false, isCompleted: false },
  { id: '15', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Bridge', description: 'Cross a bridge (even a small one).', position: 14, is_free_space: false, isCompleted: false },
  { id: '16', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Market Stall', description: 'Buy something from a market stall.', position: 15, is_free_space: false, isCompleted: false },
  { id: '17', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Green Space', description: 'Walk through a park.', position: 16, is_free_space: false, isCompleted: false },
  { id: '18', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Public Map', description: 'Find a "You are here" map.', position: 17, is_free_space: false, isCompleted: false },
  { id: '19', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Bus Stop', description: 'Find a bus stop with a digital display.', position: 18, is_free_space: false, isCompleted: false },
  { id: '20', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Old Tree', description: 'Find a particularly large or old tree.', position: 19, is_free_space: false, isCompleted: false },
  { id: '21', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Church', description: 'Find a church or place of worship.', position: 20, is_free_space: false, isCompleted: false },
  { id: '22', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Post Office', description: 'Find a local post office.', position: 21, is_free_space: false, isCompleted: false },
  { id: '23', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Cobbled Street', description: 'Walk on a cobbled street.', position: 22, is_free_space: false, isCompleted: false },
  { id: '24', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Modern Building', description: 'Find a building with lots of glass.', position: 23, is_free_space: false, isCompleted: false },
  { id: '25', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', title: 'Public Phone', description: 'Find a public telephone box.', position: 24, is_free_space: false, isCompleted: false },
];

export const MOCK_TEAMS: Team[] = [
  { id: 'team-1', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', name: 'The Explorers', score: 5 },
  { id: 'team-2', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', name: 'Urban Racers', score: 8 },
  { id: 'team-3', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', name: 'City Sleuths', score: 3 },
  { id: 'team-4', game_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', name: 'Street Walkers', score: 6 },
];

// Re-order to ensure FREE SPACE is at index 12 for 5x5 grid
const challenges = [...MOCK_CHALLENGES];
const freeSpace = challenges.find(c => c.id === 'free')!;
const otherChallenges = challenges.filter(c => c.id !== 'free');
export const BINGO_CHALLENGES = [
  ...otherChallenges.slice(0, 12),
  freeSpace,
  ...otherChallenges.slice(12)
];
