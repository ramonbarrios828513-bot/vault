// Baúl Nissi · NUBE PROPIA: guarda documentos (ya cifrados en el equipo) por "espacio".
// Necesita una base D1 conectada con el nombre DB (Cloudflare → Pages → baul-nissi → Settings → Bindings → D1 → DB).
// Seguridad: el espacio se identifica con un hash del código de nube; para escribir hace falta otra derivación del mismo código.
// Los datos llegan cifrados con la clave del Baúl: el servidor nunca ve el contenido.
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Space,X-Key', 'Cache-Control': 'no-store' };
const J = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { ...H, 'Content-Type': 'application/json' } });
const HEX = /^[a-f0-9]{64}$/;
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
let ready = false;
async function init(db) {
  if (ready) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS docs (sp TEXT NOT NULL, p TEXT NOT NULL, d TEXT, t INTEGER, PRIMARY KEY (sp, p))').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS spaces (sp TEXT PRIMARY KEY, wk TEXT NOT NULL, t INTEGER)').run();
  ready = true;
}
const okPath = (p) => typeof p === 'string' && p.length > 0 && p.length < 400 && !/[%_\\]/.test(p.replace(/_/g, '')) && !p.includes('..');
export async function onRequestOptions() { return new Response(null, { headers: H }); }
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return J({ err: 'nodb', msg: 'Falta conectar la base D1 «DB» en Cloudflare.' }, 503);
    const sp = request.headers.get('X-Space') || '', key = request.headers.get('X-Key') || '';
    if (!HEX.test(sp) || !HEX.test(key)) return J({ err: 'auth' }, 401);
    await init(env.DB);
    const wk = await sha('w:' + key);
    const row = await env.DB.prepare('SELECT wk FROM spaces WHERE sp = ?').bind(sp).first();
    if (row && row.wk !== wk) return J({ err: 'forbidden' }, 403);
    const body = await request.json();
    const ops = Array.isArray(body.ops) ? body.ops.slice(0, 300) : [];
    if (!row) {
      if (!ops.some((o) => o && (o.op === 'set' || o.op === 'upd'))) return J({ res: ops.map((o) => (o && o.op === 'list') ? [] : null), empty: true });
      await env.DB.prepare('INSERT OR IGNORE INTO spaces (sp, wk, t) VALUES (?, ?, ?)').bind(sp, wk, Date.now()).run();
    }
    const res = [];
    for (const o of ops) {
      if (!o || !okPath(o.p)) { res.push(null); continue; }
      if (o.op === 'get') { const r = await env.DB.prepare('SELECT d FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).first(); res.push(r ? r.d : null); }
      else if (o.op === 'set') { const d = JSON.stringify(o.d == null ? {} : o.d); if (d.length > 1900000) { res.push({ err: 'big' }); continue; } await env.DB.prepare('INSERT OR REPLACE INTO docs (sp, p, d, t) VALUES (?, ?, ?, ?)').bind(sp, o.p, d, Date.now()).run(); res.push(true); }
      else if (o.op === 'upd') { const r = await env.DB.prepare('SELECT d FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).first(); const cur = r ? JSON.parse(r.d || '{}') : {}; const d = JSON.stringify(Object.assign(cur, o.d || {})); await env.DB.prepare('INSERT OR REPLACE INTO docs (sp, p, d, t) VALUES (?, ?, ?, ?)').bind(sp, o.p, d, Date.now()).run(); res.push(true); }
      else if (o.op === 'del') { await env.DB.prepare('DELETE FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).run(); res.push(true); }
      else if (o.op === 'list') { const pre = o.p + '/'; const q = await env.DB.prepare('SELECT p, d FROM docs WHERE sp = ? AND substr(p, 1, ?) = ? AND instr(substr(p, ?), \'/\') = 0').bind(sp, pre.length, pre, pre.length + 1).all(); res.push((q.results || []).map((x) => [x.p, x.d])); }
      else res.push(null);
    }
    return J({ res });
  } catch (e) { return J({ err: 'server', msg: String(e && e.message || e) }, 500); }
}
