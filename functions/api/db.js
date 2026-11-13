// Baúl Nissi · NUBE PROPIA: guarda documentos (ya cifrados en el equipo) por "espacio".
// Necesita una base D1 conectada con el nombre DB (Cloudflare → Pages → baul-nissi → Settings → Bindings → D1 → DB).
// Seguridad: el espacio se identifica con un hash del código de nube; para escribir hace falta otra derivación del mismo código.
// Los datos llegan cifrados con la clave del Baúl: el servidor nunca ve el contenido.
const H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,X-Space,X-Key,X-App', 'Cache-Control': 'no-store' };
const J = (o, s) => new Response(JSON.stringify(o), { status: s || 200, headers: { ...H, 'Content-Type': 'application/json' } });
const HEX = /^[a-f0-9]{64}$/;
// v1205: versión mínima de la app que puede GUARDAR. Un aparato con versión vieja solo puede leer: así nunca pisa lo cargado en otro.
const MIN_APP = 1211;
const WRITE = { set: 1, upd: 1, del: 1, inc: 1, rset: 1 };
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
let ready = false;
async function init(db) {
  if (ready) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS docs (sp TEXT NOT NULL, p TEXT NOT NULL, d TEXT, t INTEGER, PRIMARY KEY (sp, p))').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS spaces (sp TEXT PRIMARY KEY, wk TEXT NOT NULL, t INTEGER)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS docs_sp_t ON docs (sp, t)').run(); // v1205: leer «lo nuevo desde» sin recorrer toda la base
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
    const app = parseInt(request.headers.get('X-App') || '0', 10) || 0;
    if (app < MIN_APP && ops.some((o) => o && WRITE[o.op])) return J({ err: 'old', min: MIN_APP }, 426);
    if (!row) {
      if (!ops.some((o) => o && (o.op === 'set' || o.op === 'upd'))) return J({ res: ops.map((o) => (o && o.op === 'list') ? [] : null), empty: true });
      await env.DB.prepare('INSERT OR IGNORE INTO spaces (sp, wk, t) VALUES (?, ?, ?)').bind(sp, wk, Date.now()).run();
    }
    const res = [];
    for (const o of ops) {
      if (o && o.op === 'ver') { res.push({ min: MIN_APP }); continue; } // v1205: qué versión pide la central
      if (!o || !okPath(o.p)) { res.push(null); continue; }
      if (o.op === 'get') { const r = await env.DB.prepare('SELECT d FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).first(); res.push(r ? r.d : null); }
      else if (o.op === 'set') { const d = JSON.stringify(o.d == null ? {} : o.d); if (d.length > 1900000) { res.push({ err: 'big' }); continue; } await env.DB.prepare('INSERT OR REPLACE INTO docs (sp, p, d, t) VALUES (?, ?, ?, ?)').bind(sp, o.p, d, Date.now()).run(); res.push(true); }
      else if (o.op === 'upd') { const r = await env.DB.prepare('SELECT d FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).first(); const cur = r ? JSON.parse(r.d || '{}') : {}; const d = JSON.stringify(Object.assign(cur, o.d || {})); await env.DB.prepare('INSERT OR REPLACE INTO docs (sp, p, d, t) VALUES (?, ?, ?, ?)').bind(sp, o.p, d, Date.now()).run(); res.push(true); }
      else if (o.op === 'del') { await env.DB.prepare('DELETE FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).run(); res.push(true); }
      else if (o.op === 'inc') { // numerador atómico: entrega el siguiente número una sola vez (códigos internos al grabar)
        const r = await env.DB.prepare('INSERT INTO docs (sp, p, d, t) VALUES (?, ?, ?, ?) ON CONFLICT(sp, p) DO UPDATE SET d = CAST(CAST(docs.d AS INTEGER) + 1 AS TEXT), t = excluded.t RETURNING d').bind(sp, o.p, String(+o.from || 1), Date.now()).first(); res.push(r ? +r.d : null); }
      else if (o.op === 'rset') { // v1205: registro con versión puesta por la CENTRAL (su reloj). Si el aparato escribe sobre una versión vieja → conflicto: gana la central. Una sola consulta.
        const d = JSON.stringify(o.d == null ? {} : o.d); if (d.length > 1900000) { res.push({ err: 'big' }); continue; } const base = o.base == null ? null : +o.base;
        const w = await env.DB.prepare('INSERT INTO docs (sp, p, d, t) VALUES (?, ?, ?, ?) ON CONFLICT(sp, p) DO UPDATE SET d = excluded.d, t = MAX(excluded.t, docs.t + 1) WHERE ? IS NOT NULL AND docs.t <= ? RETURNING t').bind(sp, o.p, d, Date.now(), base, base).first();
        if (w) { res.push({ t: +w.t }); continue; } const r = await env.DB.prepare('SELECT d, t FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).first(); res.push(r ? { c: 1, t: +r.t, d: r.d } : { err: 'retry' }); }
      else if (o.op === 'rget') { const r = await env.DB.prepare('SELECT d, t FROM docs WHERE sp = ? AND p = ?').bind(sp, o.p).first(); res.push(r ? [r.d, +r.t] : null); } // v1205: un registro con su versión (para revisar antes de subir)
      else if (o.op === 'rlist') { // v1205: lo que cambió en la central desde (since, ap), en páginas de 3000, ordenado por versión
        const pre = o.p + '/', since = +o.since || 0, ap = typeof o.ap === 'string' ? o.ap : '';
        const q = await env.DB.prepare('SELECT p, d, t FROM docs WHERE sp = ? AND (t > ? OR (t = ? AND p > ?)) AND substr(p, 1, ?) = ? ORDER BY t, p LIMIT 3000').bind(sp, since, since, ap, pre.length, pre).all(); res.push((q.results || []).map((x) => [x.p, x.d, +x.t])); }
      else if (o.op === 'list') { const pre = o.p + '/'; const q = await env.DB.prepare('SELECT p, d FROM docs WHERE sp = ? AND substr(p, 1, ?) = ? AND instr(substr(p, ?), \'/\') = 0').bind(sp, pre.length, pre, pre.length + 1).all(); res.push((q.results || []).map((x) => [x.p, x.d])); }
      else res.push(null);
    }
    return J({ res });
  } catch (e) { return J({ err: 'server', msg: String(e && e.message || e) }, 500); }
}
