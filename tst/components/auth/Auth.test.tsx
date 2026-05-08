import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Auth } from '../../../src/components/auth/Auth';
import { supabase } from '../../../src/lib/supabase';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn(),
          order: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(),
            }))
          }))
        })),
        ilike: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login view by default', () => {
    render(<Auth onLogin={() => {}} onAdminLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Game ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Team ID')).toBeInTheDocument();
    expect(screen.getByText('New to the game? Register your team')).toBeInTheDocument();
  });

  it('switches to register view', () => {
    render(<Auth onLogin={() => {}} onAdminLogin={() => {}} />);
    fireEvent.click(screen.getByText('New to the game? Register your team'));
    expect(screen.getByPlaceholderText('Team Name')).toBeInTheDocument();
    expect(screen.getByText('Return to game login')).toBeInTheDocument();
  });

  it('handles team registration success', async () => {
    const mockGame = { id: 'game-1', game_code: 'GAME12', started_at: null, stopped_at: null };
    const mockTeam = { id: 'team-1', team_code: 'TEAM34', name: 'Cool Team' };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
        };
      }
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockTeam, error: null })
        };
      }
    });

    render(<Auth onLogin={() => {}} onAdminLogin={() => {}} />);
    fireEvent.click(screen.getByText('New to the game? Register your team'));
    
    fireEvent.change(screen.getByPlaceholderText('Game ID'), { target: { value: 'GAME12' } });
    fireEvent.change(screen.getByPlaceholderText('Team Name'), { target: { value: 'Cool Team' } });
    
    fireEvent.click(screen.getByText('Get Team ID'));

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/)).toBeInTheDocument();
      expect(screen.getByText('TEAM34')).toBeInTheDocument();
    });
  });

  it('handles login success', async () => {
    const onLogin = vi.fn();
    const mockGame = { id: 'game-1', game_code: 'GAME12' };
    const mockTeam = { id: 'team-1', team_code: 'TEAM34' };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
        };
      }
      if (table === 'teams') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockTeam, error: null })
        };
      }
    });

    render(<Auth onLogin={onLogin} onAdminLogin={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText('Game ID'), { target: { value: 'GAME12' } });
    fireEvent.change(screen.getByPlaceholderText('Team ID'), { target: { value: 'TEAM34' } });
    
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('team-1');
    });
  });

  it('handles admin login', async () => {
    const onAdminLogin = vi.fn();
    const mockGame = { id: 'game-1', game_code: 'GAME12', admin_passcode: '1234' };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
        };
      }
    });

    render(<Auth onLogin={() => {}} onAdminLogin={onAdminLogin} />);
    fireEvent.click(screen.getByText('Game Admin'));

    fireEvent.change(screen.getByPlaceholderText('Game ID'), { target: { value: 'GAME12' } });
    fireEvent.change(screen.getByPlaceholderText('Admin Passcode'), { target: { value: '1234' } });
    
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(onAdminLogin).toHaveBeenCalledWith('game-1');
    });
  });
});
