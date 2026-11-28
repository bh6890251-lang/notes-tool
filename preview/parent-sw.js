/* service worker for the parent page only (scope: parent.html). Handles push notifications. */
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
const CN="hq-shell-v1",SH=["parent.html","../icon-192.png","../favicon.ico"];
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (!/parent\.html$|icon-192\.png$|favicon\.ico$/.test(u.pathname)) return;
  e.respondWith(caches.open(CN).then(c => c.match(r, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(x => { if (x && x.ok) c.put(u.origin + u.pathname, x.clone()); return x; }).catch(() => hit);
    return hit || net;
  })));
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  const icon = new URL("../icon-192.png", self.location.href).href;
  e.waitUntil(self.registration.showNotification(d.title || "تقرير الحلقة", {
    body: d.body || "", tag: d.tag || undefined, icon: icon, badge: icon,
    dir: "rtl", lang: "ar", requireInteraction: false,
    data: { url: self.registration.scope }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.indexOf("parent.html") >= 0 && "focus" in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
