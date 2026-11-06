<?php
// Nissifarma Ruta — servidor chico para los celulares de la empresa.
// Recibe ubicaciones, marcaciones (entrada / salida con selfie), permisos de salida y tareas.
// Base de datos: SQLite (un archivo en la carpeta data/, protegida). No necesita MySQL.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Token, X-Admin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
require __DIR__ . '/config.php';
date_default_timezone_set(defined('ZONA') ? ZONA : 'America/Asuncion');

function out($x, int $code = 200): void { http_response_code($code); echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $m, int $code = 400): void { out(['ok' => false, 'error' => $m], $code); }
function now(): int { return (int) round(microtime(true) * 1000); }

$dir = __DIR__ . '/data';
if (!is_dir($dir)) { mkdir($dir, 0755, true); }
if (!file_exists($dir . '/.htaccess')) { file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n"); }
if (!is_dir($dir . '/fotos')) { mkdir($dir . '/fotos', 0755, true); }
$db = new PDO('sqlite:' . $dir . '/ruta.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$db->exec('PRAGMA journal_mode=WAL');
$db->exec('CREATE TABLE IF NOT EXISTS dev (id INTEGER PRIMARY KEY, token TEXT UNIQUE, nombre TEXT, suc TEXT, rol TEXT, activo INTEGER DEFAULT 1, creado INTEGER)');
$db->exec('CREATE TABLE IF NOT EXISTS pos (id INTEGER PRIMARY KEY, dev INTEGER, t INTEGER, lat REAL, lon REAL, acc REAL, spd REAL, sim INTEGER, bat REAL)');
$db->exec('CREATE INDEX IF NOT EXISTS pos_dev_t ON pos(dev, t)');
$db->exec('CREATE TABLE IF NOT EXISTS ev (id INTEGER PRIMARY KEY, dev INTEGER, t INTEGER, tipo TEXT, lat REAL, lon REAL, nota TEXT, foto TEXT, ref INTEGER, estado TEXT)');
$db->exec('CREATE INDEX IF NOT EXISTS ev_dev_t ON ev(dev, t)');
$db->exec('CREATE TABLE IF NOT EXISTS cmd (id INTEGER PRIMARY KEY, dev INTEGER, t INTEGER, tipo TEXT, dato TEXT, estado TEXT, resp_t INTEGER)');
$db->exec('CREATE TABLE IF NOT EXISTS tarea (id INTEGER PRIMARY KEY, dev INTEGER, t INTEGER, tipo TEXT, titulo TEXT, desde TEXT, hacia TEXT, detalle TEXT, estado TEXT, upd INTEGER)');
$db->exec('CREATE TABLE IF NOT EXISTS cfg (k TEXT PRIMARY KEY, v TEXT)');
$db->exec('CREATE TABLE IF NOT EXISTS msg (id INTEGER PRIMARY KEY, dev INTEGER, t INTEGER, de TEXT, txt TEXT, leido INTEGER DEFAULT 0)');
// ---- Marcación de asistencia (celular fijo de la sucursal y celular propio) ----
$db->exec('CREATE TABLE IF NOT EXISTS func (id INTEGER PRIMARY KEY, cod TEXT UNIQUE, nombre TEXT, suc TEXT, pin TEXT, activo INTEGER DEFAULT 1, upd INTEGER)');
$db->exec('CREATE TABLE IF NOT EXISTS marca (id INTEGER PRIMARY KEY, cod TEXT, dev INTEGER, t INTEGER, recibido INTEGER, tipo TEXT, lat REAL, lon REAL, acc REAL, sim INTEGER, foto TEXT, nota TEXT, motivo TEXT, monto REAL, quien TEXT, suc_gps TEXT, modo TEXT, estado TEXT)');
$db->exec('CREATE INDEX IF NOT EXISTS marca_t ON marca(t)');
$db->exec('CREATE TABLE IF NOT EXISTS intento (dev INTEGER, t INTEGER)');
try { $db->exec('ALTER TABLE dev ADD COLUMN func TEXT'); } catch (Throwable $e) { }
function marcCfg(PDO $db): array { return cfg($db, 'marc', ['tipos' => [
  ['id' => 'entrada', 'n' => 'Entrada', 'ic' => '🟢', 'campo' => 'e'],
  ['id' => 'desc', 'n' => 'Salgo a descansar', 'ic' => '☕', 'campo' => 'sd'],
  ['id' => 'vuelve', 'n' => 'Vuelvo del descanso', 'ic' => '↩️', 'campo' => 'vd'],
  ['id' => 'salida', 'n' => 'Salida', 'ic' => '🔴', 'campo' => 's'],
  ['id' => 'extra_ini', 'n' => 'Empiezo horas extra', 'ic' => '⏱️', 'aprob' => 1, 'nota' => 1],
  ['id' => 'extra_fin', 'n' => 'Termino horas extra', 'ic' => '⏹️'],
  ['id' => 'ausencia', 'n' => 'Aviso que voy a faltar', 'ic' => '🤒', 'motivo' => 1, 'aprob' => 1, 'sinFoto' => 1, 'fecha' => 1],
  ['id' => 'cobertura', 'n' => 'Pido que me cubran', 'ic' => '🔄', 'quien' => 1, 'nota' => 1, 'aprob' => 1, 'sinFoto' => 1, 'fecha' => 1],
], 'motivos' => ['Enfermedad / reposo', 'Permiso', 'Vacaciones', 'Trámite personal', 'Otro motivo'], 'selfie' => 1]); }
function sucGps(PDO $db, $lat, $lon): ?string { if ($lat === null || $lon === null) return null; foreach (cfg($db, 'sucs', []) as $sc) { if (isset($sc['lat'], $sc['lon']) && dist((float) $lat, (float) $lon, (float) $sc['lat'], (float) $sc['lon']) <= (float) ($sc['r'] ?? 80)) return (string) $sc['n']; } return ''; }

function cfg(PDO $db, string $k, $def = null) { $s = $db->prepare('SELECT v FROM cfg WHERE k=?'); $s->execute([$k]); $v = $s->fetchColumn(); return $v === false ? $def : json_decode($v, true); }
function setcfg(PDO $db, string $k, $v): void { $s = $db->prepare('INSERT INTO cfg(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v'); $s->execute([$k, json_encode($v, JSON_UNESCAPED_UNICODE)]); }
function dist(float $a, float $b, float $c, float $d): float { $r = 6371000; $p1 = deg2rad($a); $p2 = deg2rad($c); $dp = deg2rad($c - $a); $dl = deg2rad($d - $b); $x = sin($dp / 2) ** 2 + cos($p1) * cos($p2) * sin($dl / 2) ** 2; return 2 * $r * atan2(sqrt($x), sqrt(1 - $x)); }
function savePhoto(?string $b64): ?string { if (!$b64) return null; if (preg_match('/^data:image\/\w+;base64,/', $b64)) $b64 = substr($b64, strpos($b64, ',') + 1); $bin = base64_decode($b64, true); if ($bin === false || strlen($bin) > 3000000) return null; $name = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.jpg'; file_put_contents(__DIR__ . '/data/fotos/' . $name, $bin); return $name; }

$a = $_GET['a'] ?? '';
$in = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];

// ---------- foto (solo administrador) ----------
if ($a === 'foto') { if (($_GET['k'] ?? '') !== ADMIN_KEY) fail('clave', 403); $f = basename((string) ($_GET['f'] ?? '')); $p = __DIR__ . '/data/fotos/' . $f; if (!$f || !is_file($p)) fail('no existe', 404); header('Content-Type: image/jpeg'); readfile($p); exit; }

// ---------- celulares ----------
$devActions = ['hola', 'ping', 'ev', 'tareas', 'tarea', 'cmd_ok', 'msgs', 'msg', 'm_hola', 'm_marca', 'm_hoy'];
if (in_array($a, $devActions, true)) {
  $tok = $_SERVER['HTTP_X_TOKEN'] ?? ($in['token'] ?? '');
  $s = $db->prepare('SELECT * FROM dev WHERE token=? AND activo=1'); $s->execute([$tok]); $D = $s->fetch();
  if (!$D) fail('Código no válido o desactivado', 403);
  $id = (int) $D['id'];
  $pend = function () use ($db, $id) { $s = $db->prepare("SELECT id,tipo,dato,t FROM cmd WHERE dev=? AND estado='pend' ORDER BY t"); $s->execute([$id]); return $s->fetchAll(); };
  if ($a === 'hola') out(['ok' => true, 'nombre' => $D['nombre'], 'suc' => $D['suc'], 'rol' => $D['rol'], 'sucs' => cfg($db, 'sucs', []), 'cfg' => cfg($db, 'app', ['selfieMin' => 3]), 'cmds' => $pend()]);
  if ($a === 'ping') {
    $pts = isset($in['pts']) && is_array($in['pts']) ? $in['pts'] : [$in];
    $q = $db->prepare('INSERT INTO pos(dev,t,lat,lon,acc,spd,sim,bat) VALUES(?,?,?,?,?,?,?,?)');
    foreach (array_slice($pts, 0, 500) as $p) { if (!isset($p['lat'], $p['lon'])) continue; $q->execute([$id, (int) ($p['t'] ?? now()), (float) $p['lat'], (float) $p['lon'], (float) ($p['acc'] ?? 0), isset($p['spd']) ? (float) $p['spd'] : null, !empty($p['sim']) ? 1 : 0, isset($p['bat']) ? (float) $p['bat'] : null]); }
    $s = $db->prepare("SELECT COALESCE(MAX(id),0) FROM msg WHERE (dev=? OR dev=0) AND de='dir'"); $s->execute([$id]);
    out(['ok' => true, 'cmds' => $pend(), 'srv' => now(), 'msgMax' => (int) $s->fetchColumn()]);
  }
  if ($a === 'ev') {
    $tipo = preg_replace('/[^a-z_]/', '', (string) ($in['tipo'] ?? '')); if (!$tipo) fail('tipo');
    $foto = savePhoto($in['foto'] ?? null);
    $estado = $tipo === 'permiso' ? 'pend' : 'ok';
    $q = $db->prepare('INSERT INTO ev(dev,t,tipo,lat,lon,nota,foto,ref,estado) VALUES(?,?,?,?,?,?,?,?,?)');
    $q->execute([$id, (int) ($in['t'] ?? now()), $tipo, $in['lat'] ?? null, $in['lon'] ?? null, mb_substr((string) ($in['nota'] ?? ''), 0, 500), $foto, isset($in['ref']) ? (int) $in['ref'] : null, $estado]);
    $evId = (int) $db->lastInsertId();
    // el delivery marca con la app de ruta: su entrada y salida van también a la marcación de asistencia (misma planilla)
    if (!empty($D['func']) && in_array($tipo, ['entrada', 'salida'], true)) { $lat = isset($in['lat']) ? (float) $in['lat'] : null; $lon = isset($in['lon']) ? (float) $in['lon'] : null;
      $q = $db->prepare('INSERT INTO marca(cod,dev,t,recibido,tipo,lat,lon,acc,sim,foto,nota,motivo,monto,quien,suc_gps,modo,estado) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
      $q->execute([$D['func'], $id, (int) ($in['t'] ?? now()), now(), $tipo, $lat, $lon, isset($in['acc']) ? (float) $in['acc'] : null, !empty($in['sim']) ? 1 : 0, $foto, mb_substr((string) ($in['nota'] ?? ''), 0, 500), '', null, '', sucGps($db, $lat, $lon), 'ruta', 'ok']); }
    out(['ok' => true, 'id' => $evId, 'cmds' => $pend()]);
  }
  if ($a === 'cmd_ok') { $foto = savePhoto($in['foto'] ?? null); $s = $db->prepare("UPDATE cmd SET estado='ok', resp_t=?, dato=COALESCE(?,dato) WHERE id=? AND dev=?"); $s->execute([now(), $foto, (int) ($in['id'] ?? 0), $id]);
    if ($foto) { $q = $db->prepare("INSERT INTO ev(dev,t,tipo,lat,lon,nota,foto,ref,estado) VALUES(?,?,'selfie',?,?,?,?,?,'ok')"); $q->execute([$id, now(), $in['lat'] ?? null, $in['lon'] ?? null, 'Selfie pedida', $foto, (int) ($in['id'] ?? 0)]); }
    out(['ok' => true]); }
  if ($a === 'msgs') { $s = $db->prepare('SELECT id,t,de,txt FROM msg WHERE (dev=? OR dev=0) AND id>? ORDER BY id LIMIT 200'); $s->execute([$id, (int) ($in['desde'] ?? 0)]); out(['ok' => true, 'msgs' => $s->fetchAll()]); }
  if ($a === 'msg') { $txt = trim(mb_substr((string) ($in['txt'] ?? ''), 0, 1000)); if ($txt === '') fail('vacío'); $s = $db->prepare("INSERT INTO msg(dev,t,de,txt) VALUES(?,?,'cel',?)"); $s->execute([$id, now(), $txt]); out(['ok' => true, 'id' => (int) $db->lastInsertId()]); }
  if ($a === 'm_hola') { $M = marcCfg($db); $own = $D['func'] ?? ''; if ($own) { $s = $db->prepare('SELECT cod,nombre,suc FROM func WHERE cod=? AND activo=1'); $s->execute([$own]); } else { $s = $db->query('SELECT cod,nombre,suc FROM func WHERE activo=1 ORDER BY nombre'); }
    out(['ok' => true, 'disp' => $D['nombre'], 'suc' => $D['suc'], 'modo' => $own ? 'propio' : 'kiosco', 'funcs' => $s->fetchAll(), 'tipos' => $M['tipos'], 'motivos' => $M['motivos'], 'selfie' => (int) ($M['selfie'] ?? 1), 'srv' => now()]); }
  if ($a === 'm_marca' || $a === 'm_hoy') {
    $s = $db->prepare('SELECT COUNT(*) FROM intento WHERE dev=? AND t>?'); $s->execute([$id, now() - 600000]); if ((int) $s->fetchColumn() >= 6) fail('Demasiados PIN equivocados. Esperá 10 minutos.', 429);
    $cod = (string) ($in['cod'] ?? ''); if (!empty($D['func'])) $cod = $D['func'];
    $s = $db->prepare('SELECT * FROM func WHERE cod=? AND activo=1'); $s->execute([$cod]); $F = $s->fetch();
    if (!$F || !$F['pin'] || !password_verify((string) ($in['pin'] ?? ''), $F['pin'])) { $db->prepare('INSERT INTO intento(dev,t) VALUES(?,?)')->execute([$id, now()]); fail('PIN incorrecto', 403); }
    $t0 = strtotime('today') * 1000;
    if ($a === 'm_hoy') { $s = $db->prepare('SELECT tipo,t,estado,nota,motivo FROM marca WHERE cod=? AND t>=? ORDER BY t'); $s->execute([$cod, $t0]); out(['ok' => true, 'nombre' => $F['nombre'], 'hoy' => $s->fetchAll()]); }
    $tipo = preg_replace('/[^a-z0-9_]/', '', (string) ($in['tipo'] ?? '')); $T = null; foreach (marcCfg($db)['tipos'] as $x) if (($x['id'] ?? '') === $tipo) $T = $x; if (!$T) fail('Tipo de marca desconocido');
    $foto = savePhoto($in['foto'] ?? null); if (!$foto && empty($T['sinFoto']) && (int) (marcCfg($db)['selfie'] ?? 1)) fail('Falta la selfie');
    $lat = isset($in['lat']) ? (float) $in['lat'] : null; $lon = isset($in['lon']) ? (float) $in['lon'] : null; $t = (int) ($in['t'] ?? now()); if ($t > now() + 120000 || $t < now() - 3 * 86400e3) $t = now();
    $q = $db->prepare('INSERT INTO marca(cod,dev,t,recibido,tipo,lat,lon,acc,sim,foto,nota,motivo,monto,quien,suc_gps,modo,estado) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $q->execute([$cod, $id, $t, now(), $tipo, $lat, $lon, isset($in['acc']) ? (float) $in['acc'] : null, !empty($in['sim']) ? 1 : 0, $foto, mb_substr((string) ($in['nota'] ?? ''), 0, 500), mb_substr((string) ($in['motivo'] ?? ''), 0, 120), isset($in['monto']) && $in['monto'] !== '' ? (float) $in['monto'] : null, mb_substr((string) ($in['quien'] ?? ''), 0, 120), ($lat === null && empty($D['func']) && $D['suc']) ? (string) $D['suc'] : sucGps($db, $lat, $lon), !empty($D['func']) ? 'propio' : 'kiosco', !empty($T['aprob']) ? 'pend' : 'ok']);
    out(['ok' => true, 'id' => (int) $db->lastInsertId(), 'nombre' => $F['nombre'], 'pend' => !empty($T['aprob'])]);
  }
  if ($a === 'tareas') { $s = $db->prepare("SELECT * FROM tarea WHERE dev=? AND estado NOT IN ('hecha','anulada') ORDER BY t"); $s->execute([$id]); out(['ok' => true, 'tareas' => $s->fetchAll()]); }
  if ($a === 'tarea') { $est = preg_replace('/[^a-z_]/', '', (string) ($in['estado'] ?? '')); $s = $db->prepare('UPDATE tarea SET estado=?, upd=? WHERE id=? AND dev=?'); $s->execute([$est, now(), (int) ($in['id'] ?? 0), $id]);
    $q = $db->prepare("INSERT INTO ev(dev,t,tipo,lat,lon,nota,foto,ref,estado) VALUES(?,?,?,?,?,?,?,?,'ok')"); $q->execute([$id, now(), 'tarea_' . $est, $in['lat'] ?? null, $in['lon'] ?? null, (string) ($in['nota'] ?? ''), savePhoto($in['foto'] ?? null), (int) ($in['id'] ?? 0)]);
    out(['ok' => true]); }
}

// ---------- administrador (director) ----------
if (($_SERVER['HTTP_X_ADMIN'] ?? ($in['admin'] ?? '')) !== ADMIN_KEY || ADMIN_KEY === 'CAMBIAR-ESTA-CLAVE') fail('Clave de administrador incorrecta (o todavía no la cambiaste en config.php)', 403);

if ($a === 'estado') {
  $t = now(); $sucs = cfg($db, 'sucs', []); $app = cfg($db, 'app', ['selfieMin' => 3, 'sinSenalMin' => 10]);
  $devs = $db->query('SELECT id,nombre,suc,rol,activo,token,func FROM dev ORDER BY nombre')->fetchAll(); $out = [];
  foreach ($devs as $d) {
    $id = (int) $d['id'];
    $s = $db->prepare('SELECT t,lat,lon,acc,spd,sim,bat FROM pos WHERE dev=? ORDER BY t DESC LIMIT 1'); $s->execute([$id]); $p = $s->fetch() ?: null;
    $s = $db->prepare("SELECT id,t,tipo,nota,foto,estado FROM ev WHERE dev=? ORDER BY t DESC LIMIT 15"); $s->execute([$id]); $evs = $s->fetchAll();
    $s = $db->prepare("SELECT t,tipo FROM ev WHERE dev=? AND tipo IN ('entrada','salida') ORDER BY t DESC LIMIT 1"); $s->execute([$id]); $j = $s->fetch();
    $enJ = $j && $j['tipo'] === 'entrada';
    $s = $db->prepare("SELECT id,t,nota FROM ev WHERE dev=? AND tipo='permiso' ORDER BY t DESC LIMIT 1"); $s->execute([$id]); $perm = $s->fetch();
    $s = $db->prepare("SELECT estado FROM ev WHERE id=?"); $permOk = false; $permPend = false; if ($perm) { $s->execute([$perm['id']]); $st = $s->fetchColumn(); $permOk = $st === 'aprob' && $t - (int) $perm['t'] < 4 * 3600e3; $permPend = $st === 'pend'; }
    $s = $db->prepare("SELECT id,t FROM cmd WHERE dev=? AND tipo='selfie' AND estado='pend' ORDER BY t LIMIT 1"); $s->execute([$id]); $sp = $s->fetch();
    $s = $db->prepare("SELECT COUNT(*) FROM tarea WHERE dev=? AND estado IN ('en_camino','salio')"); $s->execute([$id]); $tAct = (int) $s->fetchColumn();
    $al = []; $donde = null;
    if ($p) { foreach ($sucs as $sc) { if (isset($sc['lat'], $sc['lon']) && dist((float) $p['lat'], (float) $p['lon'], (float) $sc['lat'], (float) $sc['lon']) <= (float) ($sc['r'] ?? 80)) { $donde = $sc['n']; break; } } }
    if ($enJ) {
      $min = $p ? ($t - (int) $p['t']) / 60000 : 999;
      if ($min > (float) ($app['sinSenalMin'] ?? 10)) $al[] = ['n' => 3, 'm' => $p ? 'Sin ubicación hace ' . (int) $min . ' min (celular apagado, sin señal o app cerrada)' : 'Marcó entrada pero todavía no mandó ubicación'];
      if ($p && (int) $p['sim']) $al[] = ['n' => 3, 'm' => 'Ubicación FALSA (GPS simulado)'];
      if ($sp && ($t - (int) $sp['t']) / 60000 > (float) ($app['selfieMin'] ?? 3)) $al[] = ['n' => 3, 'm' => 'No respondió la selfie pedida hace ' . (int) (($t - (int) $sp['t']) / 60000) . ' min'];
      if ($p && !$donde && !$permOk && !$tAct && $sucs) $al[] = ['n' => 2, 'm' => 'Fuera de las sucursales sin permiso ni tarea'];
      if ($p && $donde && $d['suc'] && strcasecmp($donde, $d['suc']) !== 0 && !$tAct && !$permOk) $al[] = ['n' => 1, 'm' => 'Está en ' . $donde . ' (su sucursal es ' . $d['suc'] . ')'];
      if ($p && $p['bat'] !== null && (float) $p['bat'] < 0.15) $al[] = ['n' => 1, 'm' => 'Batería baja (' . (int) ((float) $p['bat'] * 100) . '%)'];
    }
    $s = $db->prepare("SELECT t FROM ev WHERE dev=? AND tipo='selfie_no' AND t>? ORDER BY t DESC LIMIT 1"); $s->execute([$id, $t - 3600e3]); $sn = $s->fetchColumn(); if ($sn) $al[] = ['n' => 3, 'm' => 'No respondió la selfie al azar de las ' . date('H:i', (int) ($sn / 1000))];
    $s = $db->prepare("SELECT COUNT(*) FROM msg WHERE dev=? AND de='cel' AND leido=0"); $s->execute([$id]); $nm = (int) $s->fetchColumn();
    if ($permPend) $al[] = ['n' => 2, 'm' => 'Pide permiso de salida: ' . ($perm['nota'] ?? '')];
    $out[] = ['id' => $id, 'nombre' => $d['nombre'], 'suc' => $d['suc'], 'rol' => $d['rol'], 'activo' => (int) $d['activo'], 'pos' => $p, 'donde' => $donde, 'jornada' => $enJ, 'jt' => $j ? (int) $j['t'] : null, 'permiso' => $perm, 'permOk' => $permOk, 'permPend' => $permPend, 'selfiePend' => $sp ?: null, 'alertas' => $al, 'ev' => $evs, 'msgNuevos' => $nm];
  }
  out(['ok' => true, 't' => $t, 'devs' => $out, 'sucs' => $sucs, 'app' => $app]);
}
if ($a === 'dev_add') { $tok = strtoupper(substr(bin2hex(random_bytes(6)), 0, 10)); $s = $db->prepare('INSERT INTO dev(token,nombre,suc,rol,activo,creado,func) VALUES(?,?,?,?,1,?,?)'); $s->execute([$tok, trim((string) ($in['nombre'] ?? 'Celular')), trim((string) ($in['suc'] ?? '')), trim((string) ($in['rol'] ?? 'delivery')), now(), trim((string) ($in['func'] ?? '')) ?: null]); out(['ok' => true, 'token' => $tok]); }
if ($a === 'dev_upd') { $s = $db->prepare('UPDATE dev SET nombre=COALESCE(?,nombre), suc=COALESCE(?,suc), rol=COALESCE(?,rol), activo=COALESCE(?,activo), func=COALESCE(?,func) WHERE id=?'); $s->execute([$in['nombre'] ?? null, $in['suc'] ?? null, $in['rol'] ?? null, isset($in['activo']) ? (int) $in['activo'] : null, isset($in['func']) ? (trim((string) $in['func']) ?: '') : null, (int) ($in['id'] ?? 0)]); out(['ok' => true]); }
if ($a === 'dev_token') { $s = $db->prepare('SELECT token FROM dev WHERE id=?'); $s->execute([(int) ($in['id'] ?? 0)]); out(['ok' => true, 'token' => $s->fetchColumn()]); }
if ($a === 'cmd_add') { $tipo = preg_replace('/[^a-z_]/', '', (string) ($in['tipo'] ?? 'selfie')); $s = $db->prepare("INSERT INTO cmd(dev,t,tipo,dato,estado) VALUES(?,?,?,?,'pend')"); $s->execute([(int) ($in['dev'] ?? 0), now(), $tipo, (string) ($in['dato'] ?? '')]); out(['ok' => true, 'id' => (int) $db->lastInsertId()]); }
if ($a === 'permiso') { $ok = !empty($in['ok']); $s = $db->prepare("UPDATE ev SET estado=? WHERE id=? AND tipo='permiso'"); $s->execute([$ok ? 'aprob' : 'rech', (int) ($in['id'] ?? 0)]); $s = $db->prepare('SELECT dev,nota FROM ev WHERE id=?'); $s->execute([(int) ($in['id'] ?? 0)]); $e = $s->fetch();
  if ($e) { $q = $db->prepare("INSERT INTO cmd(dev,t,tipo,dato,estado) VALUES(?,?,?,?,'pend')"); $q->execute([(int) $e['dev'], now(), $ok ? 'permiso_ok' : 'permiso_no', (string) ($in['nota'] ?? $e['nota'])]); } out(['ok' => true]); }
if ($a === 'hist') { $d0 = (int) ($in['desde'] ?? (now() - 12 * 3600e3)); $d1 = (int) ($in['hasta'] ?? now()); $s = $db->prepare('SELECT t,lat,lon,acc,spd,sim FROM pos WHERE dev=? AND t BETWEEN ? AND ? ORDER BY t LIMIT 20000'); $s->execute([(int) ($in['dev'] ?? 0), $d0, $d1]); $pts = $s->fetchAll(); $km = 0; for ($i = 1; $i < count($pts); $i++) { $dd = dist((float) $pts[$i - 1]['lat'], (float) $pts[$i - 1]['lon'], (float) $pts[$i]['lat'], (float) $pts[$i]['lon']); if ($dd < 2000) $km += $dd; }
  $s = $db->prepare('SELECT id,t,tipo,lat,lon,nota,foto,estado FROM ev WHERE dev=? AND t BETWEEN ? AND ? ORDER BY t'); $s->execute([(int) ($in['dev'] ?? 0), $d0, $d1]); out(['ok' => true, 'pts' => $pts, 'km' => round($km / 1000, 2), 'ev' => $s->fetchAll()]); }
if ($a === 'tarea_add') { $s = $db->prepare("INSERT INTO tarea(dev,t,tipo,titulo,desde,hacia,detalle,estado,upd) VALUES(?,?,?,?,?,?,?,'pend',?)"); $s->execute([(int) ($in['dev'] ?? 0), now(), (string) ($in['tipo'] ?? 'delivery'), (string) ($in['titulo'] ?? ''), (string) ($in['desde'] ?? ''), (string) ($in['hacia'] ?? ''), (string) ($in['detalle'] ?? ''), now()]); $q = $db->prepare("INSERT INTO cmd(dev,t,tipo,dato,estado) VALUES(?,?,'tarea',?,'pend')"); $q->execute([(int) ($in['dev'] ?? 0), now(), (string) ($in['titulo'] ?? '')]); out(['ok' => true, 'id' => (int) $db->lastInsertId()]); }
if ($a === 'tareas_all') { out(['ok' => true, 'tareas' => $db->query("SELECT tarea.*, dev.nombre FROM tarea LEFT JOIN dev ON dev.id=tarea.dev WHERE tarea.t > " . (now() - 3 * 86400e3) . " ORDER BY tarea.t DESC")->fetchAll()]); }
if ($a === 'tarea_upd') { $s = $db->prepare('UPDATE tarea SET estado=?, upd=? WHERE id=?'); $s->execute([(string) ($in['estado'] ?? 'anulada'), now(), (int) ($in['id'] ?? 0)]); out(['ok' => true]); }
if ($a === 'msgs_dir') { $dv = (int) ($in['dev'] ?? 0); $s = $db->prepare('SELECT id,dev,t,de,txt FROM msg WHERE dev=? OR dev=0 ORDER BY id DESC LIMIT 200'); $s->execute([$dv]); $r = array_reverse($s->fetchAll()); $u = $db->prepare("UPDATE msg SET leido=1 WHERE dev=? AND de='cel'"); $u->execute([$dv]); out(['ok' => true, 'msgs' => $r]); }
if ($a === 'msg_dir') { $txt = trim(mb_substr((string) ($in['txt'] ?? ''), 0, 1000)); if ($txt === '') fail('vacío'); $dv = (int) ($in['dev'] ?? 0); $s = $db->prepare("INSERT INTO msg(dev,t,de,txt) VALUES(?,?,'dir',?)"); $s->execute([$dv, now(), $txt]); out(['ok' => true]); }
if ($a === 'cfg_get') out(['ok' => true, 'sucs' => cfg($db, 'sucs', []), 'app' => cfg($db, 'app', ['selfieMin' => 3, 'sinSenalMin' => 10])]);
if ($a === 'cfg_set') { if (isset($in['sucs'])) setcfg($db, 'sucs', $in['sucs']); if (isset($in['app'])) setcfg($db, 'app', $in['app']); out(['ok' => true]); }
// ---- marcación: administrador ----
if ($a === 'f_sync') { $n = 0; $q = $db->prepare('INSERT INTO func(cod,nombre,suc,activo,upd) VALUES(?,?,?,?,?) ON CONFLICT(cod) DO UPDATE SET nombre=excluded.nombre, suc=excluded.suc, activo=excluded.activo, upd=excluded.upd'); $qp = $db->prepare('UPDATE func SET pin=? WHERE cod=?');
  foreach (($in['funcs'] ?? []) as $f) { $cod = trim((string) ($f['cod'] ?? '')); if ($cod === '') continue; $q->execute([$cod, trim((string) ($f['nombre'] ?? '')), trim((string) ($f['suc'] ?? '')), isset($f['activo']) ? (int) $f['activo'] : 1, now()]); if (!empty($f['pin']) && preg_match('/^\d{4,8}$/', (string) $f['pin'])) $qp->execute([password_hash((string) $f['pin'], PASSWORD_DEFAULT), $cod]); $n++; }
  if (!empty($in['soloEstos'])) { $cods = array_map(fn($f) => (string) ($f['cod'] ?? ''), $in['funcs'] ?? []); if ($cods) { $ph = implode(',', array_fill(0, count($cods), '?')); $db->prepare("UPDATE func SET activo=0 WHERE cod NOT IN ($ph)")->execute($cods); } }
  if (isset($in['marc']) && is_array($in['marc'])) setcfg($db, 'marc', $in['marc']);
  out(['ok' => true, 'n' => $n]); }
if ($a === 'f_list') out(['ok' => true, 'funcs' => $db->query('SELECT cod,nombre,suc,activo,(pin IS NOT NULL) AS conPin FROM func ORDER BY nombre')->fetchAll(), 'marc' => marcCfg($db)]);
if ($a === 'm_list') { $d0 = (int) ($in['desde'] ?? (now() - 86400e3)); $d1 = (int) ($in['hasta'] ?? now() + 60000); $s = $db->prepare('SELECT marca.*, func.nombre FROM marca LEFT JOIN func ON func.cod=marca.cod WHERE marca.t BETWEEN ? AND ? ORDER BY marca.t LIMIT 50000'); $s->execute([$d0, $d1]); out(['ok' => true, 'marcas' => $s->fetchAll()]); }
if ($a === 'm_estado') { $s = $db->prepare('UPDATE marca SET estado=? WHERE id=?'); $s->execute([!empty($in['ok']) ? 'aprob' : 'rech', (int) ($in['id'] ?? 0)]); out(['ok' => true]); }
if ($a === 'marc_cfg') { if (isset($in['marc']) && is_array($in['marc'])) setcfg($db, 'marc', $in['marc']); out(['ok' => true, 'marc' => marcCfg($db)]); }
fail('acción desconocida');
