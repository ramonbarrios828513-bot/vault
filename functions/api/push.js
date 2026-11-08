// Baúl · aviso «Tenés un mensaje» aunque la app esté cerrada (Web Push sin contenido: el texto nunca pasa por acá)
const OK_HOSTS = [/\.googleapis\.com$/, /\.mozilla\.com$/, /\.notify\.windows\.com$/, /\.push\.apple\.com$/, /^push\.services\.mozilla\.com$/];
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const b64u = (u8) => btoa(String.fromCharCode(...new Uint8Array(u8))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function key(env) { const j = JSON.parse(env.VAPID_JWK || '{}'); if (!j.d) throw new Error('falta VAPID_JWK'); const k = await crypto.subtle.importKey('jwk', j, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']); const pub = new Uint8Array(65); pub[0] = 4; const ub = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0)); pub.set(ub(j.x), 1); pub.set(ub(j.y), 33); return { k, pub: b64u(pub) }; }
export async function onRequestOptions() { return new Response(null, { headers: cors }); }
export async function onRequestGet({ env }) { try { const { pub } = await key(env); return new Response(JSON.stringify({ pub }), { headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); } catch (e) { return new Response(JSON.stringify({ err: String(e.message || e) }), { status: 500, headers: cors }); } }
export async function onRequestPost({ request, env }) {
  try { const { endpoint } = await request.json(); const u = new URL(endpoint); if (u.protocol !== 'https:' || !OK_HOSTS.some((r) => r.test(u.hostname))) return new Response('bad endpoint', { status: 400, headers: cors });
    const { k, pub } = await key(env), enc = (o) => b64u(new TextEncoder().encode(JSON.stringify(o))), head = enc({ typ: 'JWT', alg: 'ES256' }), body = enc({ aud: u.origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: 'https://baul-nissi.pages.dev' }), sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k, new TextEncoder().encode(head + '.' + body));
    const r = await fetch(endpoint, { method: 'POST', headers: { TTL: '86400', Urgency: 'high', Authorization: 'vapid t=' + head + '.' + body + '.' + b64u(sig) + ', k=' + pub, 'Content-Length': '0' } });
    return new Response(JSON.stringify({ status: r.status }), { status: r.ok ? 200 : 502, headers: { ...cors, 'Content-Type': 'application/json' } }); }
  catch (e) { return new Response(JSON.stringify({ err: String(e.message || e) }), { status: 500, headers: cors }); } }
