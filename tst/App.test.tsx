import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../src/App';
import { supabase } from '../src/lib/supabase';

// Mock Supabase
vi.mock('../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  }
}));

const mockGame = {
  id: 'game-1',
  name: 'App Game',
  game_code: 'APP123',
  duration_seconds: 3600,
  started_at: null,
  stopped_at: null,
  points_per_square: 1,
  points_per_bingo: 2,
  points_per_unique: 3
};

const mockTeam = {
  id: 'team-1',
  game_id: 'game-1',
  name: 'My Team',
  started_at: null
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders Auth component when no session exists', () => {
    render(<App />);
    expect(screen.getByText('Bingo Login')).toBeInTheDocument();
  });

  it('loads game data when teamId is in localStorage', async () => {
    localStorage.setItem('teamId', 'team-1');
    
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockTeam, error: null })
        };
      }
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
        };
      }
      if (table === 'challenges' || table === 'team_progress') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
    });

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('My Team')).toBeInTheDocument();
      expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    });
  });

  it('handles sign out', async () => {
    localStorage.setItem('teamId', 'team-1');
    
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockTeam, error: null })
        };
      }
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: [], error: null })
      };
    });

    render(<App />);
    
    const signOutButton = await screen.findByText('Sign Out');
    fireEvent.click(signOutButton);
    
    expect(localStorage.getItem('teamId')).toBeNull();
    expect(screen.getByText('Bingo Login')).toBeInTheDocument();
  });
});
