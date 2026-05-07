// Aspen Spas — Invoice Tracker · Service Worker
// Habilita notificaciones background y click handling
// Versión 1.0

self.addEventListener('install', (e) => {
  console.info('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.info('[SW] Activate');
  e.waitUntil(self.clients.claim());
});

// Cuando el usuario hace click en una notificación, abre/foca la app
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta, focusea esa pestaña
      for (const client of clientList) {
        if (client.url.includes('/invoice-tracker') && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre nueva ventana
      if (self.clients.openWindow) {
        return self.clients.openWindow('/invoice-tracker/');
      }
    })
  );
});

// Listen for messages from the main app (e.g., to schedule a notification)
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, e.data.options);
  }
});
