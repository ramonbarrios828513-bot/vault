// Baúl · funciona sin internet: guarda la app y los libros que ya abriste; la app se actualiza cuando hay conexión
var V = 'baul-v2', BOOKS = 'baul-libros-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V && k !== BOOKS && k.indexOf('baul-') === 0; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) { var u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.indexOf('/blob/') >= 0) { e.respondWith(caches.open(BOOKS).then(function (c) { return c.match(e.request).then(function (hit) { return hit || fetch(e.request).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; }); }); })); return; }
  if (u.pathname.endsWith('version.json')) return;
  e.respondWith(fetch(e.request).then(function (r) { if (r.ok && (u.pathname.endsWith('/') || u.pathname.endsWith('.html') || u.pathname.endsWith('.png') || u.pathname.endsWith('.webmanifest'))) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); } return r; }).catch(function () { return caches.match(e.request).then(function (h) { return h || caches.match('./index.html'); }); })); });
