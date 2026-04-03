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
    // Default action (or 'open'): Open the app or focus the window
    console.log('[Service Worker] Open app clicked');
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Find existing open window and focus it
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open one
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
    );
  }
});
