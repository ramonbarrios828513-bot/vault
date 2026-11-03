// Arquitecto Barrios · funciona sin internet: guarda la app en el aparato y la actualiza cuando hay conexión
var V = 'arquitecto-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './lib/three.min.js', './lib/OrbitControls.js', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) { var req = e.request; if (req.method !== 'GET') return; var url = new URL(req.url);
  var isPage = req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/arquitecto/');
  if (isPage) { e.respondWith(fetch(req).then(function (r) { var cp = r.clone(); caches.open(V).then(function (c) { c.put('./index.html', cp); }); return r; }).catch(function () { return caches.match('./index.html'); })); return; }
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { e.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req).then(function (r) { if (r && r.status === 200 && (r.type === 'basic' || r.type === 'cors')) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(req, cp); }); } return r; }); })); } });
