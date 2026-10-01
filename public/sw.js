// Service Worker do Entre Versos — cuida do recebimento de push notifications
// e de cliques nelas. Fica ativo mesmo com o site fechado.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Recebe o push enviado pelo backend e exibe a notificação do sistema
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: "Entre Versos", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Entre Versos";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/notification-icon.png",
    data: {
      url: data.url || "/",
    },
    tag: data.tag || undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ao clicar na notificação, foca uma aba já aberta ou abre uma nova na URL certa
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
  );
});