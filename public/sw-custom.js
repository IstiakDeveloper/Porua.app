// ========================================================
// PORUA PWA CUSTOM EXTENSIONS: PUSH, NOTIFICATIONS & SYNC
// ========================================================

// 1. Web Push Notification Listener
self.addEventListener('push', (event) => {
    let payload = {
        title: 'Porua School ERP',
        body: 'You have a new update from your school.',
        icon: '/pwa/icons/icon-192x192.png',
        badge: '/pwa/icons/badge-96x96.png',
        url: '/dashboard',
    };

    if (event.data) {
        try {
            const json = event.data.json();
            payload = { ...payload, ...json };
        } catch {
            payload.body = event.data.text();
        }
    }

    const options = {
        body: payload.body,
        icon: payload.icon || '/pwa/icons/icon-192x192.png',
        badge: payload.badge || '/pwa/icons/badge-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            url: payload.url || '/dashboard',
            timestamp: Date.now(),
        },
        actions: [
            { action: 'open', title: 'View Details' },
            { action: 'close', title: 'Dismiss' },
        ],
    };

    event.waitUntil(self.registration.showNotification(payload.title, options));
});

// 2. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const targetUrl = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// 3. Background Sync (Attendance Queue)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-attendance-queue') {
        event.waitUntil(
            // Broadcast message to open clients to trigger queue flush
            clients.matchAll({ type: 'window' }).then((clientList) => {
                clientList.forEach((client) => {
                    client.postMessage({ type: 'SYNC_ATTENDANCE_REQUESTED' });
                });
            })
        );
    }
});

