import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BonusAdminWidget } from '../../../src/components/admin/BonusAdminWidget';
import { supabase } from '../../../src/lib/supabase';
import { sendPushNotification } from '../../../src/lib/notifications';

// Mock dependencies
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: {}, error: null }))
        }))
      }))
    }))
  }
}));

vi.mock('../../../src/lib/notifications', () => ({
  sendPushNotification: vi.fn()
}));

describe('BonusAdminWidget', () => {
  it('renders form', () => {
    render(
      <BonusAdminWidget 
        gameId="game-1" 
        onSuccess={() => {}}
      />
    );
    expect(screen.getByPlaceholderText('Challenge Title')).toBeInTheDocument();
    expect(screen.getByText('SEND TO TEAMS')).toBeInTheDocument();
  });

  it('submits form and triggers push notification', async () => {
    const onSuccess = vi.fn();
    render(
      <BonusAdminWidget 
        gameId="game-1" 
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Challenge Title'), { target: { value: 'Test Bonus' } });
    fireEvent.change(screen.getByPlaceholderText('Challenge Description'), { target: { value: 'Description' } });
    fireEvent.click(screen.getByText('SEND TO TEAMS'));

    await waitFor(() => {
      expect(sendPushNotification).toHaveBeenCalledWith('game-1', 'bonus_release', { title: 'Test Bonus' });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles submission errors', async () => {
    // Mock Supabase to return an error
    (supabase.from as any).mockReturnValueOnce({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ error: { message: 'Database error' } }))
        }))
      }))
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <BonusAdminWidget 
        gameId="game-1" 
        onSuccess={() => {}}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Challenge Title'), { target: { value: 'Test Bonus' } });
    fireEvent.change(screen.getByPlaceholderText('Challenge Description'), { target: { value: 'Description' } });
    fireEvent.click(screen.getByText('SEND TO TEAMS'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Database error'));
    });
    
    alertSpy.mockRestore();
  });
});
