import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameForm } from '../../../src/components/admin/GameForm';
import { supabase } from '../../../src/lib/supabase';

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null
        }))
      }))
    }))
  }
}));

describe('GameForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('prompt', vi.fn());
    vi.stubGlobal('alert', vi.fn());
  });

  it('renders correctly for new game', () => {
    render(<GameForm onClose={() => {}} onSuccess={() => {}} />);
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Downtown Dash')).toBeInTheDocument();
  });

  it('handles basic game configuration', async () => {
    const onSuccess = vi.fn();
    const mockGame = { id: 'game-1', game_code: 'NEW123' };

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'games') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null })
        };
      }
      if (table === 'challenges') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null })
        };
      }
    });

    render(<GameForm onClose={() => {}} onSuccess={onSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Downtown Dash'), { target: { value: 'My Bingo' } });
    fireEvent.change(screen.getByPlaceholderText('1234'), { target: { value: '5555' } });
    
    // Fill first challenge title (since non-free squares need titles)
    fireEvent.click(screen.getByText('Square 1'));
    fireEvent.change(screen.getByPlaceholderText('Short & punchy title'), { target: { value: 'Challenge 1' } });
    fireEvent.click(screen.getByText('Done'));
  });

  it('prompts for secret when creating new game and fails if incorrect', async () => {
    vi.mocked(prompt).mockReturnValue('wrong-secret');
    vi.stubEnv('VITE_GAME_CREATION_SECRET', 'secret123');

    render(<GameForm onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Downtown Dash'), { target: { value: 'New Game' } });
    fireEvent.change(screen.getByPlaceholderText('1234'), { target: { value: '5555' } });

    // Fill all squares (1-25) to avoid validation error
    for (let i = 1; i <= 25; i++) {
        if (i === 13) continue; // Skip free space
        fireEvent.click(screen.getByText(`Square ${i}`));
        fireEvent.change(screen.getByPlaceholderText('Short & punchy title'), { target: { value: `Task ${i}` } });
        fireEvent.click(screen.getByText('Done'));
    }

    fireEvent.click(screen.getByText('Launch Game'));

    expect(window.prompt).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Invalid game creation secret.');
  });

  it('allows game creation when secret is correct', async () => {
    vi.mocked(prompt).mockReturnValue('secret123');
    vi.stubEnv('VITE_GAME_CREATION_SECRET', 'secret123');
    const onSuccess = vi.fn();
    const mockGame = { id: 'game-1', game_code: 'NEW123' };

    (supabase.from as any).mockImplementation((_: string) => {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockGame, error: null }),
          upsert: vi.fn().mockResolvedValue({ error: null })
        };
    });

    render(<GameForm onClose={() => {}} onSuccess={onSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Downtown Dash'), { target: { value: 'New Game' } });
    fireEvent.change(screen.getByPlaceholderText('1234'), { target: { value: '5555' } });

    // Fill all squares to avoid validation error
    for (let i = 1; i <= 25; i++) {
        if (i === 13) continue; // Skip free space
        fireEvent.click(screen.getByText(`Square ${i}`));
        fireEvent.change(screen.getByPlaceholderText('Short & punchy title'), { target: { value: `Task ${i}` } });
        fireEvent.click(screen.getByText('Done'));
    }

    fireEvent.click(screen.getByText('Launch Game'));
    
    await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('does not prompt for secret when editing an existing game', async () => {
    const mockGame = {
      id: '1',
      name: 'Existing Game',
      game_code: 'OLD123',
      duration_seconds: 3600,
      admin_passcode: '1234'
    };
    (supabase.from as any).mockImplementation((_: string) => {
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
          delete: vi.fn().mockReturnThis(),
          upsert: vi.fn().mockResolvedValue({ error: null })
        };
    });

    render(<GameForm existingGame={mockGame as any} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(window.prompt).not.toHaveBeenCalled();
  });
});
