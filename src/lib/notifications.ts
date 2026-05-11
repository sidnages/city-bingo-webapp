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
    const registration = await navigator.serviceWorker.ready;
    
    // Check if subscription already exists
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    // Save to Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        team_id: teamId,
        subscription: subscription.toJSON()
      }, { onConflict: 'team_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
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
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
