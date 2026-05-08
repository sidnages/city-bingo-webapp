import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders correctly for existing game in read-only mode', () => {
    const mockGame = {
      id: '1',
      name: 'Existing Game',
      game_code: 'OLD123',
      duration_seconds: 3600,
      admin_passcode: '1234',
      points_per_square: 1,
      points_per_bingo: 2,
      points_per_unique: 3,
      require_instagram: true,
      started_at: new Date().toISOString()
    };
    render(<GameForm existingGame={mockGame as any} isReadOnly={true} onClose={() => {}} onSuccess={() => {}} />);
    
    expect(screen.getByText('View Game (Locked)')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Game')).toHaveAttribute('readOnly');
  });
});
