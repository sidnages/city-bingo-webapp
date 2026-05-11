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
    duration_minutes: 10,
    points: 10,
    isCompleted: false
  },
  {
    id: 'bonus-2',
    game_id: 'game-1',
    title: 'Upcoming Bonus',
    description: 'Wait for it',
    duration_minutes: 20,
    points: 20,
    isCompleted: false
  }
];

describe('BonusChallenges', () => {
  it('renders a placeholder if no challenges are provided', () => {
    render(
      <BonusChallenges 
        challenges={[]} 
        onChallengeClick={() => {}} 
      />
    );
    expect(screen.getByText(/No bonus challenges have been sent/i)).toBeInTheDocument();
  });

  it('renders challenges correctly', () => {
    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        onChallengeClick={() => {}} 
      />
    );

    expect(screen.getByText('Active Bonus')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Bonus')).toBeInTheDocument();
  });

  it('calls onChallengeClick when a challenge is clicked', () => {
    const onChallengeClick = vi.fn();
    render(
      <BonusChallenges 
        challenges={mockChallenges} 
        onChallengeClick={onChallengeClick} 
      />
    );

    fireEvent.click(screen.getByText('Active Bonus'));
    expect(onChallengeClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'bonus-1' }));
  });

  it('displays completed state correctly', () => {
    const completedChallenges = [
      { ...mockChallenges[0], isCompleted: true }
    ];

    render(
      <BonusChallenges 
        challenges={completedChallenges} 
        onChallengeClick={() => {}} 
      />
    );

    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders Camera icon when instagramUrl is present', () => {
    const challengesWithInsta = [
      { ...mockChallenges[0], isCompleted: true, instagramUrl: 'https://instagram.com/p/123' }
    ];

    const { container } = render(
      <BonusChallenges 
        challenges={challengesWithInsta} 
        onChallengeClick={() => {}} 
      />
    );

    const cameraIcon = container.querySelector('svg.lucide-camera');
    expect(cameraIcon).toBeInTheDocument();
  });
});
