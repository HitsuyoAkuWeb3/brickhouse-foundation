import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class NotificationService {
  /**
   * Requests permission for Web Push Notifications from the browser.
   * If granted, and service workers are supported, registers the service worker.
   */
  static async requestPermissionAndSubscribe(profileId: string): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      toast.error("Your browser doesn't support notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        console.log("Notification permission granted.");
        
        // In Phase 2, this is where we would:
        // 1. Register ServiceWorker
        // 2. Perform subscribe() using applicationServerKey (VAPID key)
        // 3. Save the PushSubscription object to Supabase push_subscriptions table
        
        // For Phase 1 Beta: We just verify permissions. Supabase reminder-escalation 
        // currently uses DB polling and analytics_events.
        
        return true;
      } else {
        console.log("Notification permission denied or dismissed.");
        toast.error("Enable notifications in browser settings to receive reminders.");
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Schedules a task notification.
   * Currently delegates directly to the 'scheduler_tasks' table which represents the 
   * unified truth for reminders in the system. The 'reminder-escalation' edge function
   * processes these entries autonomously.
   */
  static async scheduleTask(
    addTaskMutation: any, 
    payload: {
      title: string;
      category?: string;
      task_type: string;
      scheduled_for: string;
      parent_goal_id?: string;
      brick_id?: string;
      affirmation_id?: string;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      addTaskMutation.mutate(
        {
          ...payload,
          is_active: true,
          reminder_type: "one_off"
        },
        {
          onSuccess: () => {
            // If the time is very soon, we might want a local fallback,
            // but for now Supabase takes care of long-term scheduling.
            resolve();
          },
          onError: (err: any) => {
            console.error("Failed to schedule task:", err);
            reject(err);
          }
        }
      );
    });
  }
}
