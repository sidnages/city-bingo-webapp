import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BonusChallenges from '../../../src/components/layout/BonusChallenges';
import type { BonusChallenge } from '../../../src/types/game';

const mockChallenges: BonusChallenge[] = [
  {
    id: 'bonus-1',
    game_id: 'game-1',
    title: 'Active Bonus',
    description: 'Do something cool',
    release_at_minutes: 0,
    duration_minutes: 10,
    points: 10,
    isCompleted: false
  },
  {
    id: 'bonus-2',
    game_id: 'game-1',
    title: 'Upcoming Bonus',
    description: 'Wait for it',
    release_at_minutes: 20,
    duration_minutes: 10,
    points: 20,
    isCompleted: false
  }
];

describe('BonusChallenges', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders nothing if no challenges are provided', () => {
    const { container } = render(
      <BonusChallenges 
        challenges={[]} 
        teamStartedAt={new Date().toISOString()} 
        isGameStopped={false}
        onChallengeClick={() => {}} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders "Start to unlock" state if team has not started', () => {
    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        teamStartedAt={null} 
        isGameStopped={false}
        onChallengeClick={() => {}} 
      />
    );
    expect(screen.getByText(/Start to unlock bonuses/i)).toBeInTheDocument();
  });

  it('renders active and locked challenges correctly', () => {
    // Team started 5 minutes ago
    const startedAt = new Date(Date.now() - 5 * 60000).toISOString();
    
    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        teamStartedAt={startedAt} 
        isGameStopped={false}
        onChallengeClick={() => {}} 
      />
    );

    // Active one (starts at 0m, ends at 10m. Current is 5m)
    expect(screen.getByText('Active Bonus')).toBeInTheDocument();
    expect(screen.getByText(/5:00 left/i)).toBeInTheDocument();

    // Locked one (starts at 20m. Current is 5m)
    expect(screen.getByText(/Locked/i)).toBeInTheDocument();
    expect(screen.getByText(/in 15:00/i)).toBeInTheDocument();
  });

  it('calls onChallengeClick when an active challenge is clicked', () => {
    const onChallengeClick = vi.fn();
    const startedAt = new Date(Date.now() - 5 * 60000).toISOString();

    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        teamStartedAt={startedAt} 
        isGameStopped={false}
        onChallengeClick={onChallengeClick} 
      />
    );

    fireEvent.click(screen.getByText('Active Bonus'));
    expect(onChallengeClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'bonus-1' }));
  });

  it('marks challenges as expired when time is up', () => {
    // Team started 15 minutes ago. Active Bonus (0-10m) should be expired.
    const startedAt = new Date(Date.now() - 15 * 60000).toISOString();

    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        teamStartedAt={startedAt}
        isGameStopped={false} 
        onChallengeClick={() => {}} 
      />
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('marks challenges as expired when game is done, even if time isnt up', () => {
    // Team started 15 minutes ago. Active Bonus (0-10m) should be expired.
    const startedAt = new Date(Date.now()).toISOString();

    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        teamStartedAt={startedAt}
        isGameStopped={true} 
        onChallengeClick={() => {}} 
      />
    );

    expect(screen.getAllByText('Expired')).toHaveLength(2);
  });

  it('displays completed state correctly even while active', () => {
    const completedChallenges = [
      { ...mockChallenges[0], isCompleted: true }
    ];
    const startedAt = new Date(Date.now() - 5 * 60000).toISOString();

    render(
      <BonusChallenges 
        challenges={completedChallenges} 
        teamStartedAt={startedAt}
        isGameStopped={false} 
        onChallengeClick={() => {}} 
      />
    );

    expect(screen.getByText('Done')).toBeInTheDocument();
    // It should still show time left if it's within the window
    expect(screen.getByText(/5:00 left/i)).toBeInTheDocument();
  });

  it('displays "Finished" when completed and time is up', () => {
    const completedChallenges = [
      { ...mockChallenges[0], isCompleted: true }
    ];
    // Started 15m ago, duration was 10m
    const startedAt = new Date(Date.now() - 15 * 60000).toISOString();

    render(
      <BonusChallenges 
        challenges={completedChallenges} 
        teamStartedAt={startedAt}
        isGameStopped={false} 
        onChallengeClick={() => {}} 
      />
    );

    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('renders Camera icon when instagramUrl is present', () => {
    const challengesWithInsta = [
      { ...mockChallenges[0], isCompleted: true, instagramUrl: 'https://instagram.com/p/123' }
    ];
    const startedAt = new Date(Date.now() - 5 * 60000).toISOString();

    const { container } = render(
      <BonusChallenges 
        challenges={challengesWithInsta} 
        teamStartedAt={startedAt}
        isGameStopped={false} 
        onChallengeClick={() => {}} 
      />
    );

    // Camera icon has lucide-camera class or we can find it by its svg structure/role if needed
    // But since we use lucide-react, it usually renders an svg with a specific data-lucide name or we can use container query
    const cameraIcon = container.querySelector('svg.lucide-camera');
    expect(cameraIcon).toBeInTheDocument();
  });
});
