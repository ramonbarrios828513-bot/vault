// genera una llave VAPID nueva (solo se usa si Cloudflare todavía no tiene VAPID_JWK)
const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const j = await crypto.subtle.exportKey('jwk', kp.privateKey); process.stdout.write(JSON.stringify({ kty: j.kty, crv: j.crv, x: j.x, y: j.y, d: j.d }));
