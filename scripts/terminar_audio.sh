#!/usr/bin/env bash
# Deja la voz lista para Instagram/TikTok: quita graves (golpes, aire acondicionado), baja el ruido de fondo,
# empareja el volumen (compresor), normaliza a -14 LUFS (lo que usa Instagram) y pone un limitador.
# El video NO se vuelve a codificar (se copia tal cual), solo el audio.
#
# Uso:  bash scripts/terminar_audio.sh entrada.mp4 [salida.mp4] [--tiktok]
#   --tiktok  además acelera el video y el audio a 1.1x (ritmo típico de TikTok Shop; recodifica el video)
set -euo pipefail
in="${1:?Uso: terminar_audio.sh entrada.mp4 [salida.mp4] [--tiktok]}"
out="${2:-${in%.*}-final.mp4}"
[ "$out" = "--tiktok" ] && out="${in%.*}-final.mp4"
CHAIN="highpass=f=90,afftdn=nf=-30:nr=12,acompressor=threshold=-24dB:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=0.89"
if [[ " $* " == *" --tiktok "* ]]; then
  ffmpeg -hide_banner -loglevel error -y -i "$in" \
    -filter_complex "[0:v]setpts=PTS/1.1[v];[0:a]atempo=1.1,${CHAIN}[a]" -map "[v]" -map "[a]" \
    -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$out"
else
  ffmpeg -hide_banner -loglevel error -y -i "$in" -map 0:v:0 -map 0:a:0 -c:v copy \
    -af "$CHAIN" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$out"
fi
echo "listo: $out"
ffmpeg -hide_banner -i "$out" -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume" || true
