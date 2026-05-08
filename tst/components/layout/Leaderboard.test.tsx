import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Leaderboard from '../../../src/components/layout/Leaderboard';

const mockTeams = [
  { id: '1', name: 'Team A', score: 10, started_at: new Date('2024-01-01T12:00:00Z').toISOString() },
  { id: '2', name: 'Team B', score: 20, started_at: null },
  { id: '3', name: 'Team C', score: 15, started_at: new Date('2024-01-01T12:00:00Z').toISOString() }
];

describe('Leaderboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders teams in order of score', () => {
    render(
      <Leaderboard 
        teams={mockTeams as any} 
        currentTeamId="1" 
        gameDurationSeconds={3600} 
        gameStoppedAt={null} 
      />
    );
    
    const teamNames = screen.getAllByText(/Team [A-C]/).map(el => el.textContent);
    expect(teamNames).toEqual(['Team B', 'Team C', 'Team A']); // Sorted by score: 20, 15, 10
  });

  it('highlights current team', () => {
    render(
      <Leaderboard 
        teams={mockTeams as any} 
        currentTeamId="1" 
        gameDurationSeconds={3600} 
        gameStoppedAt={null} 
      />
    );
    
    // Team A is current team (id: "1")
    const teamNameElement = screen.getByText('Team A');
    const container = teamNameElement.parentElement?.parentElement?.parentElement;
    
    // Check background color which is also unique to the current team
    expect(container).toHaveStyle({ backgroundColor: 'rgba(255, 140, 66, 0.1)' });
  });

  it('shows "Final Leaderboard" when isPublished is true', () => {
    render(
      <Leaderboard 
        teams={mockTeams as any} 
        currentTeamId="1" 
        gameDurationSeconds={3600} 
        gameStoppedAt={null} 
        isPublished={true}
      />
    );
    expect(screen.getByText('Final Leaderboard')).toBeInTheDocument();
  });

  it('updates timers correctly', () => {
    render(
      <Leaderboard 
        teams={mockTeams as any} 
        currentTeamId="1" 
        gameDurationSeconds={3600} 
        gameStoppedAt={null} 
      />
    );
    
    expect(screen.getAllByText('1:00:00')).toHaveLength(2); // Team A and Team C

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getAllByText('59:59')).toHaveLength(2);
  });
});
