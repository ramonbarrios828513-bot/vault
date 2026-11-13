#!/bin/bash
# 🔒 VERIFICADOR ANTES DE PUBLICAR · si algo falla, NO se publica.
# Uso: tools/verify/run.sh /ruta/al/work.html
set -u; HTML="$1"; D="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$D/../.." && pwd)"; SRV=$(mktemp -d); export SRV; FAIL=0
say(){ echo "$@"; }; bad(){ say "✘ $*"; FAIL=1; }
# 1) versiones iguales en todos lados
VB=$(grep -o "VBUILD = [0-9]*" "$HTML" | head -1 | grep -o "[0-9]*"); AB=$(grep -o "window.__APPB = [0-9]*" "$HTML" | head -1 | grep -o "[0-9]*$"); LV=$(grep -o "LECTOR_VER = 'v[0-9]*" "$HTML" | head -1 | grep -o "[0-9]*$"); MA=$(grep -o "MIN_APP = [0-9]*" "$R/functions/api/db.js" | grep -o "[0-9]*$")
say "versiones: VBUILD=$VB APPB=$AB LECTOR=$LV central=$MA"; { [ "$VB" = "$AB" ] && [ "$VB" = "$LV" ] && [ "$VB" = "$MA" ]; } || bad "las versiones no coinciden"
# 2) el código se puede leer
node "$D/pc.js" "$HTML" | grep -q "errors: 0" || bad "error de sintaxis en la página"
# 3) pruebas: dos aparatos espejo, versión primero, extractos, cheques
pkill -f "http.server 8100" 2>/dev/null; pkill -f "server.js .* 8105" 2>/dev/null; pkill -f "central-mock.js" 2>/dev/null; sleep 1
cp "$HTML" "$SRV/work.html"; echo "{\"build\": $VB}" > "$SRV/version.json"
(cd "$SRV" && python3 -m http.server 8100 >/dev/null 2>&1 & echo $! > "$SRV/h.pid"); sleep 1
run(){ local t=$1 env=$2; pkill -f "central-mock.js" 2>/dev/null; sleep 0.5; (env $env node "$D/central-mock.js" "$SRV" 8105 >/dev/null 2>&1 &); sleep 1; local out; out=$(cd "$D" && env $env timeout 500 node "$t" 2>&1); if echo "$out" | grep -q "✘\|Error\|fallas [1-9]"; then bad "$t"; echo "$out" | grep "✘\|Error" | head -5; else say "✔ $t"; fi; }
for t in t376.js t377.js; do run $t "NPORT=8105 SRV=$SRV VB=$VB"; done
run t379.js "NPORT=8105 SRV=$SRV VB=$VB BIGLIM=60000"
run t384.js "NPORT=8105 SRV=$SRV VB=$VB"
for t in t380.js t381.js t382.js t383.js t385.js t378.js t371.js t372.js t373.js t366.js t368.js t344.js t351.js; do run $t "PORT=8100"; done
kill $(cat "$SRV/h.pid") 2>/dev/null; pkill -f "central-mock.js" 2>/dev/null; rm -rf "$SRV"
[ $FAIL = 0 ] && say "✅ VERIFICADO: se puede publicar" || say "⛔ NO PUBLICAR: hay fallas"; exit $FAIL
