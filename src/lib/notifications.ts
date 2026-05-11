import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeUserToPush(teamId: string) {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported by your browser.');
    }

    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VITE_VAPID_PUBLIC_KEY is not defined. Please check your environment variables.');
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) {
      throw new Error('Push messaging is not supported by your browser.');
    }
    
    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      } catch (err) {
        console.error('Push registration failed:', err);
        throw new Error('Failed to subscribe to push service. This might be due to an invalid VAPID key or browser restriction.');
      }
    }

    // Save to Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        team_id: teamId,
        subscription: subscription.toJSON()
      }, { onConflict: 'team_id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(`Failed to save subscription to database: ${error.message}`);
    }
    
    return true;
  } catch (error: any) {
    console.error('Detailed push subscription error:', error);
    alert(error.message || 'Failed to subscribe to push notifications.');
    return false;
  }
}

export async function unsubscribeUserFromPush(teamId: string) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('team_id', teamId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

export async function checkPushSubscription(teamId: string) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('team_id', teamId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking push subscription:', error);
  }
  
  return !!data;
}

export async function sendPushNotification(gameId: string, type: 'game_start' | 'game_end' | 'score_published' | 'bonus_release', details?: any) {
  try {
    const { data, error } = await supabase.functions.invoke('send-push', {
      body: { gameId, type, details }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to trigger push notification:', error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  try {
    const cleanString = base64String.replace(/["']/g, '').trim();
    const padding = '='.repeat((4 - cleanString.length % 4) % 4);
    const base64 = (cleanString + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('Failed to decode VAPID public key:', error);
    throw new Error('The VAPID public key is malformed. Please ensure it is a valid base64 string.');
  }
}
