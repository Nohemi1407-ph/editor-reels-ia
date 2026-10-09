#!/usr/bin/env bash
# Recorta el cuadrito de UNA persona de una grabación de Zoom/Meet (vista de galería) para usarlo en una
# tarjeta de testimonio. Primero mira un cuadro del video (hoja_contacto.py) y anota x, y, ancho y alto del
# cuadrito de la persona (en píxeles del video original). Deja fuera la etiqueta con su nombre.
# Uso:  bash scripts/recortar_participante.sh video.mp4 inicio_s fin_s x y ancho alto salida.mp4
set -euo pipefail
[ $# -eq 8 ] || { echo "Uso: recortar_participante.sh video.mp4 inicio fin x y ancho alto salida.mp4"; exit 1; }
in=$1; a=$2; b=$3; x=$4; y=$5; w=$6; h=$7; out=$8
ffmpeg -hide_banner -loglevel error -y -ss "$a" -to "$b" -i "$in" \
  -vf "crop=${w}:${h}:${x}:${y},scale=trunc(iw*2/2):trunc(ih*2/2),setsar=1,fps=30" \
  -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k "$out"
echo "listo: $out"
