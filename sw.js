/* sw.js — ทำให้แอปใช้งานแบบออฟไลน์ได้ (PWA)
 * เมื่อเพิ่มไฟล์ใหม่ ให้เพิ่มชื่อไฟล์ใน FILES และเปลี่ยนเลข CACHE */
const CACHE = 'silpthai-v2';
const FILES = [
  './', 'index.html', 'manifest.json', 'css/style.css', 'assets/icon.svg',
  'js/config.js', 'js/core.js', 'js/app.js',
  ...['home', 'search', 'chatbot', 'arts', 'dance', 'music', 'festivals', 'regions', 'food', 'costume',
    'literature', 'idioms', 'etiquette', 'crafts', 'writing', 'coloring', 'quiz', 'events', 'favorites',
    'profile', 'settings', 'admin', 'about'].map((m) => `js/modules/${m}.js`)
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* network-first: ได้ไฟล์ล่าสุดเสมอเมื่อออนไลน์ และใช้ cache เมื่อออฟไลน์ */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((res) => {
    const copy = res.clone();
    if (res.ok && new URL(e.request.url).origin === location.origin) caches.open(CACHE).then((c) => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match(e.request)));
});
