self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Brickhouse Mindset";
  
  const options = {
    body: data.body || "It's time to build your foundation.",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: data,
    actions: [
      {
        action: 'snooze',
        title: 'Snooze (1h)',
        // could add icon here
      },
      {
        action: 'open',
        title: 'Open App',
      }
    ],
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'snooze') {
    // Handle the snooze action
    console.log('[Service Worker] Snooze action clicked');
    // In a fully developed app, we would send a message to the open clients or schedule another push 
    // from here using a SyncEvent or fetch to an API.
    // For Phase 1, we log and perhaps schedule a local notification if feasible or post a message to the client.
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if ('postMessage' in client) {
            client.postMessage({ type: 'SNOOZE_TASK', data: event.notification.data });
          }
        }
      })
    );
  } else {
    // Default action (or 'open'): open the app on the right page.
    // Reminders (including the wake-up / mid-day / evening rituals) should land
    // on Home. Notifications may override this via data.url for deep links.
    console.log('[Service Worker] Open app clicked');
    const targetUrl = (event.notification.data && event.notification.data.url) || '/dashboard';
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Reuse an existing window: navigate it to the target page, then focus.
        for (const client of clientList) {
          if ('focus' in client) {
            if ('navigate' in client) {
              return client.navigate(targetUrl).then((navigated) => (navigated || client).focus());
            }
            return client.focus();
          }
        }
        // No window open: open one on the target page.
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
    );
  }
});

// Add a minimal fetch event listener so it's recognized as a valid PWA by Safari
self.addEventListener('fetch', (event) => {
  // We don't intercept any requests right now, but this is required for PWA installation
});
