import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (eventType: string, eventData: Record<string, any> = {}) => {
    try {
      const { error } = await supabase.from('analytics_events').insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_data: eventData,
      });

      if (error) {
        console.error('Failed to log analytics event synchronously:', error);
      }

      // If the event warrants behavioral analysis, trigger the insight engine
      if (['ritual_abandoned', 'streak_broken', 'brick_completed'].includes(eventType)) {
        // Fire and forget edge function invocation so we don't block the UI thread
         supabase.functions.invoke('behavioral-insight', {
            body: { user_id: user?.id, event_type: eventType, event_data: eventData }
         }).catch(console.error);
      }

    } catch (e) {
      console.error('Analytics tracking failed:', e);
    }
  };

  return { trackEvent };
};
