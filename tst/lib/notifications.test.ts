import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestNotificationPermission, subscribeUserToPush, unsubscribeUserFromPush, checkPushSubscription, sendPushNotification } from '../../src/lib/notifications';
import { supabase } from '../../src/lib/supabase';

// Mock Supabase
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    })),
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Notification Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.Notification
    vi.stubGlobal('Notification', {
      requestPermission: vi.fn().mockResolvedValue('granted')
    });

    // Mock navigator.serviceWorker
    vi.stubGlobal('navigator', {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: vi.fn().mockResolvedValue({
              toJSON: () => ({ endpoint: 'test-endpoint' }),
              unsubscribe: vi.fn().mockResolvedValue(true)
            })
          }
        })
      }
    });
  });

  describe('requestNotificationPermission', () => {
    it('returns true when permission is granted', async () => {
      const result = await requestNotificationPermission();
      expect(result).toBe(true);
      expect(Notification.requestPermission).toHaveBeenCalled();
    });

    it('returns false when permission is denied', async () => {
      (Notification.requestPermission as any).mockResolvedValue('denied');
      const result = await requestNotificationPermission();
      expect(result).toBe(false);
    });
  });

  describe('subscribeUserToPush', () => {
    it('creates a new subscription and saves to Supabase', async () => {
      const teamId = 'team-123';
      const upsertSpy = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValue({ upsert: upsertSpy });

      // Mock subscription with endpoint
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue({
                endpoint: 'test-endpoint',
                toJSON: () => ({ endpoint: 'test-endpoint' })
              })
            }
          })
        }
      });

      const result = await subscribeUserToPush(teamId);
      
      expect(result).toBe(true);
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({ 
          team_id: teamId,
          endpoint: 'test-endpoint'
        }),
        expect.objectContaining({ onConflict: 'endpoint' })
      );
    });
  });

  describe('unsubscribeUserFromPush', () => {
    it('unsubscribes and deletes from Supabase', async () => {
      const mockSubscription = { 
        endpoint: 'test-endpoint',
        unsubscribe: vi.fn().mockResolvedValue(true) 
      };
      
      // Setup mock service worker with an existing subscription
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(mockSubscription)
            }
          })
        }
      });

      const deleteSpy = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      (supabase.from as any).mockReturnValue({ delete: deleteSpy });

      const result = await unsubscribeUserFromPush();
      
      expect(result).toBe(true);
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalled();
    });
  });

  describe('checkPushSubscription', () => {
    it('returns true if subscription exists in Supabase', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue({
                endpoint: 'test-endpoint'
              })
            }
          })
        }
      });

      const singleSpy = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
      (supabase.from as any).mockReturnValue({ 
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: singleSpy 
      });

      const result = await checkPushSubscription();
      expect(result).toBe(true);
      expect(singleSpy).toHaveBeenCalled();
    });

    it('returns false if no browser subscription exists', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve({
            pushManager: {
              getSubscription: vi.fn().mockResolvedValue(null)
            }
          })
        }
      });

      const result = await checkPushSubscription();
      expect(result).toBe(false);
    });
  });

  describe('sendPushNotification', () => {
    it('invokes the Supabase Edge Function', async () => {
      const gameId = 'game-123';
      (supabase.functions.invoke as any).mockResolvedValue({ data: { success: true }, error: null });

      const result = await sendPushNotification(gameId, 'game_start');
      
      expect(result).toEqual({ success: true });
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-push', expect.objectContaining({
        body: expect.objectContaining({ gameId, type: 'game_start' })
      }));
    });
  });
});
