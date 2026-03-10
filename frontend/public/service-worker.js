self.addEventListener('push', function (event) {
    if (event.data) {
        let payload = {};
        try {
            payload = event.data.json();
        } catch (e) {
            payload = { body: event.data.text() };
        }

        const notificationTitle = payload.title || 'Habit Reminder ✨';
        const notificationOptions = {
            body: payload.body || 'You have pending actions!',
            icon: payload.icon || '/logo.svg',
            badge: '/logo.svg',
            vibrate: [200, 100, 200, 100, 200],
            data: {
                url: (payload.data && payload.data.url) ? payload.data.url : '/dashboard'
            }
        };

        event.waitUntil(
            self.registration.showNotification(notificationTitle, notificationOptions)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const TARGET_URL = event.notification.data.url || '/dashboard';
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(TARGET_URL) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(TARGET_URL);
            }
        })
    );
});
