import { supabase } from "@/integrations/supabase/client";

export type EventType = 
  | 'lesson_completed' 
  | 'ritual_completed' 
  | 'ritual_skipped' 
  | 'affirmation_recorded' 
  | 'passion_pick_activated'
  | 'task_completed'
  | 'task_abandoned'
  | 'subscription_started'
  | 'cta_clicked';

export const trackEvent = async (
  eventType: EventType, 
  eventData: Record<string, any> = {}, 
  brickId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // We can still log anonymous events or waitlist events if user is null
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id || null,
        event_type: eventType,
        event_data: eventData,
        brick_id: brickId || null,
      });

    if (error) {
      console.error('Analytics track error:', error);
    }
  } catch (err) {
    console.error('Failed to track event:', err);
  }
};
