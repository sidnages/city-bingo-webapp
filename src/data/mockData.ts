import type { Challenge, Team } from '../types/game';

export const MOCK_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Find a Blue Door', description: 'Locate and take a picture of a bright blue residential door.', isCompleted: false },
  { id: '2', title: 'Street Performer', description: 'Watch a street performer for at least 2 minutes.', isCompleted: false },
  { id: '3', title: 'Local Coffee', description: 'Buy a drink from a non-chain coffee shop.', isCompleted: false },
  { id: '4', title: 'Historic Plaque', description: 'Find a blue or green historic plaque and read it.', isCompleted: false },
  { id: '5', title: 'Statue Selfie', description: 'Take a selfie with a public statue.', isCompleted: false },
  { id: '6', title: 'Red Mailbox', description: 'Find a classic red pillar box or mailbox.', isCompleted: false },
  { id: '7', title: 'Flower Bed', description: 'Find a well-maintained public flower bed.', isCompleted: false },
  { id: '8', title: 'Street Art', description: 'Find a piece of mural or street art.', isCompleted: false },
  { id: '9', title: 'Park Bench', description: 'Sit on a park bench for 1 minute.', isCompleted: false },
  { id: '10', title: 'Bicycle Rack', description: 'Find a full bicycle rack.', isCompleted: false },
  { id: '11', title: 'Library', description: 'Visit the local public library.', isCompleted: false },
  { id: '12', title: 'Clock Tower', description: 'Find a clock on a building.', isCompleted: false },
  // Free space will be inserted at index 12 (center)
  { id: 'free', title: 'FREE SPACE', description: 'Enjoy the game!', isCompleted: true, isFreeSpace: true },
  { id: '14', title: 'Fountain', description: 'Find a water fountain.', isCompleted: false },
  { id: '15', title: 'Bridge', description: 'Cross a bridge (even a small one).', isCompleted: false },
  { id: '16', title: 'Market Stall', description: 'Buy something from a market stall.', isCompleted: false },
  { id: '17', title: 'Green Space', description: 'Walk through a park.', isCompleted: false },
  { id: '18', title: 'Public Map', description: 'Find a "You are here" map.', isCompleted: false },
  { id: '19', title: 'Bus Stop', description: 'Find a bus stop with a digital display.', isCompleted: false },
  { id: '20', title: 'Old Tree', description: 'Find a particularly large or old tree.', isCompleted: false },
  { id: '21', title: 'Church', description: 'Find a church or place of worship.', isCompleted: false },
  { id: '22', title: 'Post Office', description: 'Find a local post office.', isCompleted: false },
  { id: '23', title: 'Cobbled Street', description: 'Walk on a cobbled street.', isCompleted: false },
  { id: '24', title: 'Modern Building', description: 'Find a building with lots of glass.', isCompleted: false },
  { id: '25', title: 'Public Phone', description: 'Find a public telephone box.', isCompleted: false },
];

export const MOCK_TEAMS: Team[] = [
  { id: 'team-1', name: 'The Explorers', score: 5 },
  { id: 'team-2', name: 'Urban Racers', score: 8 },
  { id: 'team-3', name: 'City Sleuths', score: 3 },
  { id: 'team-4', name: 'Street Walkers', score: 6 },
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
