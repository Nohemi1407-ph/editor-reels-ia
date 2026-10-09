#!/usr/bin/env bash
# Para voces generadas (voz clonada): acorta SOLO las pausas largas (> 0.75 s las deja en 0.55 s) sin acelerar
# la voz, y deja el volumen listo para redes. Opcionalmente recorta el arranque ("Bueno escucha.").
# Uso:  bash scripts/acortar_pausas_voz.sh voz.wav [salida.wav] [segundos_a_recortar_al_inicio]
set -euo pipefail
in="${1:?Uso: acortar_pausas_voz.sh voz.wav [salida.wav] [recorte_inicio_s]}"
out="${2:-${in%.*}-lista.wav}"
trim="${3:-0}"
ffmpeg -hide_banner -loglevel error -y -ss "$trim" -i "$in" \
  -af "silenceremove=stop_periods=-1:stop_duration=0.75:stop_silence=0.55:stop_threshold=-42dB,acompressor=threshold=-24dB:ratio=3:attack=10:release=200,loudnorm=I=-14:TP=-1.5:LRA=9" \
  -ar 44100 "$out"
echo "listo: $out"
