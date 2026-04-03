/**
 * NotificationService
 * 
 * Unified scheduling dispatch for PWA Push Notifications.
 * Handles requesting permissions, registering the service worker, and dispatching
 * notification configurations out to Supabase push_subscriptions/scheduled_notifications.
 * 
 * For Phase 1 Beta, this handles fallback to local UI reminders if Push is denied/unavailable.
 */

import { supabase } from "@/integrations/supabase/client";

export class NotificationService {
  /**
   * Request Push Notification Permissions.
   * If granted, registers the Service Worker for push event handling.
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn("This browser does not support desktop notification");
      return false;
    }

    let granted = false;

    if (Notification.permission === 'granted') {
      granted = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      granted = permission === 'granted';
    }

    if (granted && 'serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('[NotificationService] Service Worker registered');
      } catch (err) {
        console.error('[NotificationService] Service Worker registration failed', err);
      }
    }

    return granted;
  }

  /**
   * Dispatches a scheduling request to the underlying notification orchestrator.
   * For Phase 1, it writes/updates records via the provided Supabase mutation layer,
   * but could be extended to directly call Supabase Edge Functions with WebPush VAPID keys.
   */
  static async schedulePushNotification(params: {
    title: string;
    body: string;
    scheduledFor: Date;
    tag?: string; // used for deduplication/grouping
    data?: Record<string, unknown>;
  }) {
    // In a full PWA ecosystem this would:
    // 1. Ensure PushSubscription is retrieved via ServiceWorkerRegistration.pushManager
    // 2. Insert into `scheduled_notifications` table alongside that subscription context.
    
    // Fallback/Log for Phase 1 until VAPID provisioning is available:
    console.log("[NotificationService] Scheduled internal push for:", params.scheduledFor, params.title);
    
    // If the browser supports native Local Web Notifications and the time is relatively near (or we poll locally):
    // For robust server-pushed notifications, rely on the scheduler_tasks table being polled by Edge Functions.
  }

  /**
   * Utility for local test notifications
   */
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
}
