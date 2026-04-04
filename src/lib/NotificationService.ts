import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Utility function to convert base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
      let permission = Notification.permission;
      if (permission !== "granted" && permission !== "denied") {
          permission = await Notification.requestPermission();
      }
      
      if (permission === "granted") {
        console.log("Notification permission granted.");
        
        if ("serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.register("/sw.js");
            console.log("[NotificationService] Service Worker registered");

            // Check if VAPID key exists
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            
            if (!vapidPublicKey) {
               console.warn("VITE_VAPID_PUBLIC_KEY not found in env, skipping push subscription.");
               return true;
            }

            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey
            });

            console.log("Push subscription complete");

            const authKey = subscription.getKey("auth");
            const p256dhKey = subscription.getKey("p256dh");

            if (!authKey || !p256dhKey) {
                console.error("Missing keys in subscription object");
                return true;
            }

            // Save the push subscription to the DB
            // Need to convert ArrayBuffer to Base64 in a cross-browser way.
            const btoaSafe = (buf: ArrayBuffer) => 
               window.btoa(
                 new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), '')
               );

            const auth = btoaSafe(authKey);
            const p256dh = btoaSafe(p256dhKey);
            const endpoint = subscription.endpoint;

            const { error: insertError } = await supabase.from("push_subscriptions").upsert({
               profile_id: profileId,
               endpoint: endpoint,
               auth_key: auth,
               p256dh_key: p256dh
            }, { onConflict: "profile_id, endpoint" });

            if (insertError) {
              console.error("Error saving push subscription to Supabase:", insertError);
            } else {
              console.log("Push subscription saved successfully to database.");
            }
          } catch (err) {
            console.error("[NotificationService] Service Worker registration or subscription failed", err);
          }
        }
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
   * Request Push Notification Permissions context-free.
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    let permission = Notification.permission;
    if (permission === 'granted') return true;
    if (permission !== 'denied') {
        permission = await Notification.requestPermission();
    }
    return permission === 'granted';
  }

  static async showLocalTestNotification(title: string, body: string, data?: any) {
    const granted = await this.requestPermission();
    if (granted && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: data,
        actions: [
          { action: 'snooze', title: 'Snooze (1h)' },
          { action: 'open', title: 'Open App' }
        ],
        vibrate: [200, 100, 200]
      });
    } else if (granted) {
      new Notification(title, {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png"
      });
    }
  }

  static async schedulePushNotification(params: {
    title: string;
    body: string;
    scheduledFor: Date;
    tag?: string; 
    data?: Record<string, unknown>;
  }) {
    console.log("[NotificationService] Scheduled internal push for:", params.scheduledFor, params.title);
  }

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
          onSuccess: () => resolve(),
          onError: (err: any) => {
            console.error("Failed to schedule task:", err);
            reject(err);
          }
        }
      );
    });
  }
}
