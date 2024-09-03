
self.addEventListener('push', function (event) {
    const data = event.data.json();
    var options = {
        body: data.body,
        icon: "/site_name.png",
        vibrate: [100, 50, 100],
        data: data.data,
        actions: data.actions
    }
    self.registration.showNotification(data.title, options);
});


self.addEventListener('notificationclick', function (event) {
    const data = event.notification.data;
    event.waitUntil(
        clients.openWindow(data.url)
    );
    event.notification.close();
});

