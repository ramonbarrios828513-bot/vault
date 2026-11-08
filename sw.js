// Baúl · funciona sin internet: guarda la app y los libros que ya abriste; la app se actualiza cuando hay conexión
// v1047: caché nueva (borra copias viejas), la versión nueva se guarda para TODAS las entradas (/, /index.html, ?chz=…) y «?fresh=» baja sí o sí de internet
var V = 'baul-v4', BOOKS = 'baul-libros-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon3d-192.png', './icons/icon3d-512.png'];
var SCOPE = self.registration ? self.registration.scope : './';
function docKeys() { return [new URL('./', SCOPE).href, new URL('./index.html', SCOPE).href]; }
function saveDoc(res) { var cp = res.clone(); return caches.open(V).then(function (c) { return cp.blob().then(function (b) { return Promise.all(docKeys().map(function (k) { return c.put(k, new Response(b, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })); })); }); }); }
self.addEventListener('install', function (e) { e.waitUntil(caches.open(V).then(function (c) { return Promise.all(SHELL.map(function (s) { return fetch(s, { cache: 'reload' }).then(function (r) { if (r.ok) return c.put(s, r); }).catch(function () {}); })); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V && k !== BOOKS && k.indexOf('baul-') === 0; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) { var u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.indexOf('/blob/') >= 0) { e.respondWith(caches.open(BOOKS).then(function (c) { return c.match(e.request).then(function (hit) { return hit || fetch(e.request).then(function (r) { if (r.ok) c.put(e.request, r.clone()); return r; }); }); })); return; }
  if (u.pathname.endsWith('version.json')) return;
  var isApp = u.pathname === new URL('./', SCOPE).pathname || u.pathname === new URL('./index.html', SCOPE).pathname;
  // la app pidió la versión nueva: siempre de internet, y queda guardada para todas las entradas
  if (isApp && u.searchParams.has('fresh')) { e.respondWith(fetch(new URL('./', SCOPE).href, { cache: 'no-store' }).then(function (r) { if (!r.ok) return r; return saveDoc(r).then(function () { return r; }); })); return; }
  var isDoc = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  if (isDoc) { var net = fetch(e.request, { cache: 'no-store' }).then(function (r) { if (!r.ok) return r; var p = isApp ? saveDoc(r) : caches.open(V).then(function (c) { return c.put(e.request, r.clone()); }); e.waitUntil(p.catch(function () {})); return r; });
    e.respondWith(caches.match(isApp ? docKeys()[0] : e.request, { ignoreSearch: isApp }).then(function (hit) { if (!hit) return net.catch(function () { return caches.match(docKeys()[1]); }); var slow = new Promise(function (ok) { setTimeout(function () { ok(hit); }, 6000); }); e.waitUntil(net.catch(function () {})); return Promise.race([net.catch(function () { return hit; }), slow]); })); return; }
  e.respondWith(fetch(e.request).then(function (r) { if (r.ok && (u.pathname.endsWith('.png') || u.pathname.endsWith('.webmanifest'))) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cp); }); } return r; }).catch(function () { return caches.match(e.request).then(function (h) { return h || caches.match(docKeys()[1]); }); })); });
