# Arma la versión web del Baúl (GitHub Pages) a partir del archivo del artefacto.
# Uso: python3 tools/build.py /home/claude/work.html
import sys, re, json, os
src = sys.argv[1]; root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
w = open(src, encoding='utf-8').read()
# 1) los libros (Biblias, leyes, diccionarios) salen de la carpeta blob/ del repositorio
w = re.sub(r'/_blob/([0-9a-f]{32})', r'blob/\1.json', w)
# 1b) PRIVACIDAD: la versión pública no lleva los nombres de la familia (cada aparato los pone con «✏️ Cambiar los nombres»)
IDS = ['ramon', 'gisele', 'joshua', 'paloma', 'naomi', 'luna']
NEW = {k: 'pf%d' % (i + 1) for i, k in enumerate(IDS)}
SHOW = {'Ramón': 'Papá', 'Gisele': 'Mamá', 'Joshua': 'Hijo', 'Paloma': 'Hija 1', 'Naomi': 'Hija 2', 'Luna': 'Hija 3'}
def h(t):
    x = 5381
    for ch in t: x = ((x * 33) ^ ord(ch)) & 0xffffffff
    return x
mig = ('<script>(function () { try { if (window.claude || localStorage.getItem("iv-mig-pf")) return; var M = %s;'
  ' var H = function (s) { var x = 5381; for (var i = 0; i < s.length; i++) x = (Math.imul(x, 33) ^ s.charCodeAt(i)) >>> 0; return x; };'
  ' var fx = function (s) { return String(s).replace(/[a-z]+/g, function (t) { return M[H(t)] || t; }); }, ks = [], i;'
  ' for (i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i));'
  ' ks.forEach(function (k) { var n = fx(k); if (n !== k && localStorage.getItem(n) === null) { localStorage.setItem(n, localStorage.getItem(k)); localStorage.removeItem(k); } });'
  ' var pr = localStorage.getItem("iv-profile"); if (pr) localStorage.setItem("iv-profile", fx(pr));'
  ' try { var L = JSON.parse(localStorage.getItem("iv-profiles") || "null"); if (Array.isArray(L)) localStorage.setItem("iv-profiles", JSON.stringify(L.map(function (p) { p[0] = fx(p[0]); return p; }))); } catch (e) {}'
  ' localStorage.setItem("iv-mig-pf", "1"); } catch (e) {} })();</script>') % json.dumps({str(h(k)): v for k, v in NEW.items()})
anchor = "<script>\n(function () { try {\n  var P = localStorage.getItem('iv-profile')"
assert w.count(anchor) == 1; w = w.replace(anchor, mig + anchor)
w = w.replace("['🕊️', 'Paloma']", "['🕊️', '\\u0050aloma']")  # la tarjeta de la paloma (el ave) no es un nombre
for a, b in [("'🕊️', '#a21caf'", "'👧', '#a21caf'"), ("'🌙', '#7c3aed', 'm']", "'🧒', '#7c3aed', 'm']"), ("['luna', 'Luna',", "['pf6', 'Luna',"),
             ("ramon|ramón|", ""), ("ramon@", "nombre@"), ("'Yóshua'", "'Hijo'"), ('«Yóshua»', '«Yésica»'), ("'Yisél'", "'Mamá'"), ("'Naomí'", "'Hija 2'")]:
    w = w.replace(a, b)
w = re.sub(r'/\^\(([a-z|]+)\)\$/', lambda m: '/^(' + '|'.join(NEW.get(t, t) for t in m.group(1).split('|')) + ')$/' if all(t in NEW for t in m.group(1).split('|')) else m.group(0), w)
w = w.replace('gisele', 'pf2')
w = re.sub(r"""(['"])(ramon|joshua|naomi|paloma)\1""", lambda m: m.group(1) + NEW[m.group(2)] + m.group(1), w)
w = re.sub(r'(?<=[{,] )(ramon|joshua|naomi|paloma|luna)(?=: )', lambda m: NEW[m.group(1)], w)
w = re.sub(r'\b(%s)\b' % '|'.join(SHOW), lambda m: SHOW[m.group(1)], w)
w = re.sub(r'\b(%s)\b' % '|'.join(k.upper() for k in SHOW), lambda m: {k.upper(): v.upper() for k, v in SHOW.items()}[m.group(1)], w)
m = re.search(r'var VBUILD = (\d+)', w); build = int(m.group(1)) if m else 0
# 2) instalable en el celular + funciona sin internet + se actualiza solo desde GitHub
head = ('<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#7c3aed">'
        '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><meta name="mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Baúl">')
w = w.replace('<meta name=viewport', head + '<meta name=viewport', 1)
tail = '''<script>
(function () { if (window.claude) return; window.__WEB_BUILD = %d;
  try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js'); } catch (e) {}
  function check() { fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (v) { if (v && v.build > window.__WEB_BUILD && !document.getElementById('webUpd')) { var d = document.createElement('div'); d.id = 'webUpd'; d.style.cssText = 'position:fixed;left:50%%;top:12px;transform:translateX(-50%%);z-index:2147483647;background:#7c3aed;color:#fff;padding:10px 16px;border-radius:14px;font:700 14px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35)'; var n = 8; d.textContent = '⬆️ Versión nueva v' + v.build + ' — se actualiza en ' + n + ' s'; document.body.appendChild(d); var t = setInterval(function () { n--; d.textContent = '⬆️ Versión nueva v' + v.build + ' — se actualiza en ' + n + ' s'; if (n <= 0) { clearInterval(t); try { if (typeof window.__arqSaveNow === 'function') window.__arqSaveNow(); } catch (e) {} setTimeout(function () { location.reload(); }, 600); } }, 1000); } }).catch(function () {}); }
  var dip = null; window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dip = e; show(); });
  function show() { if (document.getElementById('webInst') || window.matchMedia('(display-mode: standalone)').matches) return; var b = document.createElement('button'); b.id = 'webInst'; b.textContent = '📲 Instalar el Baúl como app'; b.style.cssText = 'position:fixed;right:12px;bottom:14px;z-index:2147483646;border:0;border-radius:999px;padding:12px 18px;background:#7c3aed;color:#fff;font:800 15px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.35)'; b.onclick = function () { if (dip) { dip.prompt(); dip.userChoice.then(function (c) { if (c.outcome === 'accepted') b.remove(); }); dip = null; } else alert('Tocá los tres puntitos ⋮ de Chrome (arriba a la derecha) y elegí «Instalar app» o «Agregar a la pantalla principal» → «Instalar».'); }; document.body.appendChild(b); }
  window.addEventListener('appinstalled', function () { var b = document.getElementById('webInst'); if (b) b.remove(); });
  setTimeout(function () { if (/Android|iPhone|iPad/i.test(navigator.userAgent)) show(); }, 6000);
  setTimeout(check, 4000); setInterval(check, 60000); document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
})();
</script>''' % build
i = w.rfind('</body>'); w = w[:i] + tail + w[i:]
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(w)
json.dump({'build': build}, open(os.path.join(root, 'version.json'), 'w'))
print('ok build', build, len(w))
