import { supabase } from './supabase';
import type { AnalyticsEvent } from '../types';

export async function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  userId: string,
  metadata: Record<string, any> = {}
) {
  try {
    const { error } = await supabase
      .from('analytics')
      .insert({
        event_type: eventType,
        user_id: userId,
        metadata
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export function subscribeToAnalytics(callback: (payload: any) => void) {
  return supabase
    .channel('analytics_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'analytics'
      },
      callback
    )
    .subscribe();
}

export function subscribeToUserPoints(callback: (payload: any) => void) {
  return supabase
    .channel('points_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_points'
      },
      callback
    )
    .subscribe();
}