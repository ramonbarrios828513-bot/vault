#!/bin/bash
# Publicar SOLO si el verificador da todo bien. Uso: tools/publish.sh /ruta/work.html "mensaje"
set -e; HTML="$1"; MSG="$2"; R="$(cd "$(dirname "$0")/.." && pwd)"
"$R/tools/verify/run.sh" "$HTML" || { echo "⛔ No se publica: el verificador encontró fallas."; exit 1; }
cd "$R" && python3 tools/build.py "$HTML" >/dev/null && git add -A && git commit -qm "$MSG" && git push -q origin main && git log -1 --format=%h
