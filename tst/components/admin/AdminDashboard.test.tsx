import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboard } from '../../../src/components/admin/AdminDashboard';
import { supabase } from '../../../src/lib/supabase';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      update: vi.fn(() => ({
        eq: vi.fn().mockReturnThis()
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockReturnThis()
      })),
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
  name: 'Admin Game',
  game_code: 'ADMIN1',
  duration_seconds: 3600,
  admin_passcode: '1234',
  started_at: null,
  stopped_at: null,
  published_at: null,
  points_per_square: 10,
  points_per_bingo: 50,
  points_per_unique: 20
};

const createMockSupabaseResponse = (data: any = [], error: any = null) => {
  const mockQuery: any = {
    data,
    error,
  };
  
  const methods = ['select', 'eq', 'order', 'single', 'update', 'delete', 'insert', 'limit', 'range'];
  
  methods.forEach(method => {
    mockQuery[method] = vi.fn().mockReturnValue(mockQuery);
  });

  // Override single to return the first item or the data itself
  mockQuery.single = vi.fn().mockImplementation(() => {
    return Promise.resolve({ 
      data: Array.isArray(data) ? data[0] : data, 
      error 
    });
  });

  // Supabase queries are thenable
  mockQuery.then = vi.fn().mockImplementation((onFulfilled) => {
    return Promise.resolve({ data, error }).then(onFulfilled);
  });

  return mockQuery;
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for fetching data
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(mockGame);
      if (table === 'teams') return createMockSupabaseResponse([]);
      if (table === 'challenges') return createMockSupabaseResponse([]);
      if (table === 'team_progress') return createMockSupabaseResponse([]);
      return createMockSupabaseResponse([]);
    });
  });

  it('renders correctly in Not Started state', async () => {
    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('START GAME')).toBeInTheDocument();
      expect(screen.getByText('Edit Config')).toBeInTheDocument();
    });
  });

  it('handles starting the game', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    
    // Use a fresh mock response for games table to capture the update
    const updateResponse = createMockSupabaseResponse(mockGame);
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return updateResponse;
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    const startButton = await screen.findByText('START GAME');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(updateResponse.update).toHaveBeenCalledWith(expect.objectContaining({
        started_at: expect.any(String)
      }));
    });
  });

  it('renders correctly in Started state', async () => {
    const startedGame = { ...mockGame, started_at: new Date().toISOString() };
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(startedGame);
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('STOP GAME')).toBeInTheDocument();
      expect(screen.getByText('View Config')).toBeInTheDocument();
      expect(screen.getByText('Game in Progress:')).toBeInTheDocument();
    });
  });

  it('renders correctly in Stopped state', async () => {
    const stoppedGame = { 
      ...mockGame, 
      started_at: new Date().toISOString(),
      stopped_at: new Date().toISOString()
    };
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(stoppedGame);
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('PUBLISH SCORES')).toBeInTheDocument();
    });
  });

  it('renders correctly in Published state', async () => {
    const publishedGame = { 
      ...mockGame, 
      started_at: new Date().toISOString(),
      stopped_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    };
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(publishedGame);
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('SCORES PUBLISHED')).toBeInTheDocument();
    });
  });

  it('handles removing a team', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    const mockTeam = { id: 'team-1', name: 'Team One', score: 0, started_at: null };
    const teamsResponse = createMockSupabaseResponse([mockTeam]);

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(mockGame);
      if (table === 'teams') return teamsResponse;
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    // Select the team
    const teamButton = await screen.findByText('Team One');
    fireEvent.click(teamButton);
    
    // Remove the team
    const removeButton = await screen.findByText('Remove Team');
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(teamsResponse.delete).toHaveBeenCalled();
      expect(teamsResponse.eq).toHaveBeenCalledWith('id', 'team-1');
    });
  });

  it('disables "Edit Config" and shows "View Config" when game has started', async () => {
    const startedGame = { ...mockGame, started_at: new Date().toISOString() };
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(startedGame);
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('View Config')).toBeInTheDocument();
      expect(screen.queryByText('Edit Config')).not.toBeInTheDocument();
    });
  });

  it('opens ChallengeModal with correct permissions based on game state', async () => {
    const mockTeam = { id: 'team-1', name: 'Team One', score: 0, started_at: null };
    const mockChallenge = { id: 'chal-1', title: 'Task 1', is_free_space: false, position: 0 };
    
    const stoppedGame = { 
      ...mockGame, 
      started_at: new Date().toISOString(),
      stopped_at: new Date().toISOString()
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(stoppedGame);
      if (table === 'teams') return createMockSupabaseResponse([mockTeam]);
      if (table === 'challenges') return createMockSupabaseResponse([mockChallenge]);
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    // Select team
    const teamButton = await screen.findByText('Team One');
    fireEvent.click(teamButton);
    
    // Click challenge square
    const square = await screen.findByText('Task 1');
    fireEvent.click(square);
    
    // Check if modal is open and button is ENABLED (since game is stopped)
    await screen.findByText('Mark as Complete');
    expect(screen.getByText('Mark as Complete')).not.toBeDisabled();
  });

  it('shows ChallengeModal as disabled when game is still in progress', async () => {
    const mockTeam = { id: 'team-1', name: 'Team One', score: 0, started_at: null };
    const mockChallenge = { id: 'chal-1', title: 'Task 1', is_free_space: false, position: 0 };
    
    const startedGame = { 
      ...mockGame, 
      started_at: new Date().toISOString()
    };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') return createMockSupabaseResponse(startedGame);
      if (table === 'teams') return createMockSupabaseResponse([mockTeam]);
      if (table === 'challenges') return createMockSupabaseResponse([mockChallenge]);
      return createMockSupabaseResponse([]);
    });

    render(<AdminDashboard gameId="game-1" onSignOut={() => {}} />);
    
    // Select team
    const teamButton = await screen.findByText('Team One');
    fireEvent.click(teamButton);
    
    // Click challenge square
    const square = await screen.findByText('Task 1');
    fireEvent.click(square);
    
    // Check if button is DISABLED and reason is shown
    await screen.findByText('Mark as Complete');
    expect(screen.getByText('Mark as Complete')).toBeDisabled();
    expect(screen.getByText('Game is still in progress.')).toBeInTheDocument();
  });
});
