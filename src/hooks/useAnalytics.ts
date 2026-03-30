import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  const trackEvent = async (
    eventType: string,
    eventData?: Record<string, any>,
    brickId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await (supabase as any).from("analytics_events").insert({
        user_id: session?.user?.id || null,
        event_type: eventType,
        event_data: eventData || null,
        brick_id: brickId || null,
      });
    } catch (error) {
      console.error("Failed to track analytics event:", error);
    }
  };

  return { trackEvent };
};
