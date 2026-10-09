#!/usr/bin/env python3
"""Transcribe videos largos (llamadas de Zoom, lives, entrevistas) en español, con tiempos por palabra.

Uso (con el Python del skill, que ya trae faster-whisper):
  ~/.claude/skills/video-edit/.venv/bin/python scripts/transcribir.py <video o carpeta> [más videos...] \
      [--salida transcripciones] [--modelo small] [--idioma es]

Por cada video escribe en la carpeta de salida:
  <nombre>.json      segmentos con palabras: [inicio, fin, palabra, confianza]
  <nombre>.json.txt  texto legible con tiempos "[ 123.4- 130.2] frase", que se va llenando mientras trabaja
Si un video ya tiene su .json, lo salta (puedes cortar y volver a correrlo).
Empieza por los videos más cortos para tener resultados rápido.
Tiempo aproximado en CPU con 'small': 1 hora de video = 15-30 min. 'medium' es más exacto pero ~3x más lento.
"""
import argparse
import glob
import json
import os
import sys

VIDEO_EXT = ('.mp4', '.mov', '.m4v', '.mkv', '.webm', '.m4a', '.mp3', '.wav')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('entradas', nargs='+', help='videos o carpetas con videos')
    ap.add_argument('--salida', default='transcripciones', help='carpeta donde guardar (por defecto: transcripciones)')
    ap.add_argument('--modelo', default='small', help='tiny | base | small | medium | large-v3 (multilingües)')
    ap.add_argument('--idioma', default='es')
    a = ap.parse_args()

    files = []
    for e in a.entradas:
        if os.path.isdir(e):
            files += [f for f in glob.glob(os.path.join(e, '*')) if f.lower().endswith(VIDEO_EXT)]
        elif os.path.isfile(e):
            files.append(e)
        else:
            print(f'no existe: {e}', file=sys.stderr)
    if not files:
        sys.exit('No encontré videos.')
    files.sort(key=os.path.getsize)
    os.makedirs(a.salida, exist_ok=True)

    from faster_whisper import WhisperModel
    m = WhisperModel(a.modelo, compute_type='int8', cpu_threads=os.cpu_count() or 4)
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]
        out = os.path.join(a.salida, f'{name}.json')
        if os.path.exists(out):
            print('ya estaba:', name)
            continue
        segs, _ = m.transcribe(f, language=a.idioma, word_timestamps=True, vad_filter=True)
        res = []
        with open(out + '.txt', 'w', encoding='utf-8') as t:
            for s in segs:
                res.append({'start': s.start, 'end': s.end, 'text': s.text,
                            'words': [[w.start, w.end, w.word, round(w.probability, 2)] for w in (s.words or [])]})
                t.write(f'[{s.start:7.1f}-{s.end:7.1f}] {s.text}\n')
                t.flush()
        with open(out, 'w', encoding='utf-8') as fh:
            json.dump(res, fh, ensure_ascii=False)
        print('listo:', name, flush=True)


if __name__ == '__main__':
    main()
