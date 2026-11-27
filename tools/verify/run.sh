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
cp "$HTML" "$SRV/work.html"; mkdir -p "$SRV/proveedor"; cp "$R/proveedor/index.html" "$SRV/proveedor/index.html"; echo "{\"build\": $VB}" > "$SRV/version.json"
[ -f "${MIGJSON:-/tmp/claude-0/s132/mig.json}" ] && cp "${MIGJSON:-/tmp/claude-0/s132/mig.json}" "$SRV/mig.json"
(cd "$SRV" && python3 -m http.server 8100 >/dev/null 2>&1 & echo $! > "$SRV/h.pid"); sleep 1
run(){ local t=$1 env=$2; pkill -f "central-mock.js" 2>/dev/null; sleep 0.5; (env $env node "$D/central-mock.js" "$SRV" 8105 >/dev/null 2>&1 &); sleep 1; local out; out=$(cd "$D" && env $env timeout 500 node "$t" 2>&1); if echo "$out" | grep -q "✘\|Error\|fallas [1-9]"; then bad "$t"; echo "$out" | grep "✘\|Error" | head -5; else say "✔ $t"; fi; }
for t in t376.js t377.js; do run $t "NPORT=8105 SRV=$SRV VB=$VB"; done
run t379.js "NPORT=8105 SRV=$SRV VB=$VB BIGLIM=60000"
run t384.js "NPORT=8105 SRV=$SRV VB=$VB"
run t386.js "NPORT=8105 SRV=$SRV VB=$VB"
run t391.js "NPORT=8105 SRV=$SRV VB=$VB"
run t473.js "NPORT=8105 SRV=$SRV VB=$VB"
run t623.js "HTML=$HTML"
for t in t380.js t381.js t382.js t383.js t385.js t387.js t388.js t389.js t390.js t392.js t393.js t394.js t395.js t396.js t397.js t398.js t399.js t400.js t401.js t402.js t403.js t404.js t405.js t406.js t407.js t408.js t409.js t410.js t411.js t412.js t413.js t414.js t415.js t416.js t417.js t418.js t419.js t420.js t421.js t422.js t423.js t424.js t425.js t426.js t427.js t428.js t429.js t430.js t431.js t432.js t433.js t434.js t436.js t437.js t438.js t439.js t440.js t441.js t442.js t443.js t444.js t445.js t446.js t447.js t448.js t449.js t450.js t451.js t452.js t453.js t454.js t455.js t456.js t457.js t458.js t459.js t460.js t461.js t462.js t463.js t464.js t465.js t466.js t467.js t468.js t469.js t470.js t471.js t472.js t474.js t475.js t476.js t477.js t478.js t479.js t480.js t481.js t482.js t483.js t484.js t485.js t486.js t487.js t488.js t489.js t490.js t491.js t492.js t493.js t494.js t495.js t496.js t497.js t498.js t499.js t500.js t501.js t502.js t503.js t504.js t505.js t506.js t507.js t508.js t509.js t510.js t511.js t512.js t513.js t514.js t515.js t516.js t517.js t518.js t519.js t520.js t521.js t522.js t523.js t524.js t525.js t526.js t527.js t528.js t529.js t530.js t531.js t532.js t533.js t534.js t535.js t536.js t537.js t538.js t539.js t540.js t541.js t542.js t543.js t544.js t545.js t546.js t547.js t548.js t549.js t550.js t551.js t552.js t553.js t554.js t555.js t556.js t557.js t558.js t559.js t560.js t561.js t562.js t563.js t564.js t565.js t566.js t567.js t568.js t569.js t570.js t571.js t572.js t573.js t574.js t575.js t576.js t577.js t578.js t579.js t580.js t581.js t582.js t583.js t584.js t585.js t586.js t587.js t588.js t589.js t590.js t591.js t592.js t593.js t594.js t595.js t596.js t597.js t598.js t599.js t600.js t601.js t602.js t603.js t604.js t605.js t606.js t607.js t608.js t609.js t610.js t611.js t612.js t613.js t614.js t615.js t616.js t617.js t618.js t619.js t620.js t621.js t622.js t624.js t625.js t626.js t627.js t378.js t371.js t372.js t373.js t366.js t368.js t344.js t351.js; do run $t "PORT=8100"; done
kill $(cat "$SRV/h.pid") 2>/dev/null; pkill -f "central-mock.js" 2>/dev/null; rm -rf "$SRV"
[ $FAIL = 0 ] && say "✅ VERIFICADO: se puede publicar" || say "⛔ NO PUBLICAR: hay fallas"; exit $FAIL
