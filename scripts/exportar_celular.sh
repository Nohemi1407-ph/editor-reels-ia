#!/usr/bin/env bash
# Copia liviana del video para mandarla por WhatsApp / AirDrop o subirla desde el celular (normalmente < 30 MB).
# Guarda siempre el render grande en la computadora: esta copia pierde un poco de calidad.
# Uso:  bash scripts/exportar_celular.sh render.mp4 [salida.mp4]
set -euo pipefail
in="${1:?Uso: exportar_celular.sh render.mp4 [salida.mp4]}"
out="${2:-${in%.*}-celular.mp4}"
ffmpeg -hide_banner -loglevel error -y -i "$in" -c:v libx264 -crf 26 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$out"
du -h "$out" | awk '{print "listo: " $2 " (" $1 ")"}'
