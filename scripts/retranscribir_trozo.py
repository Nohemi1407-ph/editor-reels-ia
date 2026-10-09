#!/usr/bin/env python3
"""Vuelve a transcribir SOLO un trozo de un video con un modelo más exacto (para subtítulos de testimonios).

Uso:
  ~/.claude/skills/video-edit/.venv/bin/python scripts/retranscribir_trozo.py <video> <inicio_s> <fin_s> \
      [--nombre t1] [--modelo medium] [--salida trozos]

Escribe trozos/<nombre>.wav, trozos/<nombre>.mp4 (el clip cortado, listo para Remotion) y agrega las palabras
a trozos/words.json con tiempos RELATIVOS al inicio del trozo: {"t1": [[inicio, fin, "palabra", confianza], ...]}.
Imprime las palabras con su tiempo para que puedas corregir a mano lo que Whisper oyó mal.
"""
import argparse
import json
import os
import shutil
import subprocess


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    ap.add_argument('inicio', type=float)
    ap.add_argument('fin', type=float)
    ap.add_argument('--nombre', default=None)
    ap.add_argument('--modelo', default='medium')
    ap.add_argument('--idioma', default='es')
    ap.add_argument('--salida', default='trozos')
    a = ap.parse_args()
    name = a.nombre or f'trozo_{int(a.inicio)}'
    os.makedirs(a.salida, exist_ok=True)
    ff = shutil.which('ffmpeg') or 'ffmpeg'
    wav = os.path.join(a.salida, f'{name}.wav')
    mp4 = os.path.join(a.salida, f'{name}.mp4')
    subprocess.run([ff, '-v', 'error', '-y', '-ss', str(a.inicio), '-to', str(a.fin), '-i', a.video,
                    '-ac', '1', '-ar', '16000', wav], check=True)
    subprocess.run([ff, '-v', 'error', '-y', '-ss', str(a.inicio), '-to', str(a.fin), '-i', a.video,
                    '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30',
                    '-c:a', 'aac', '-b:a', '192k', mp4], check=True)

    from faster_whisper import WhisperModel
    m = WhisperModel(a.modelo, compute_type='int8')
    segs, _ = m.transcribe(wav, language=a.idioma, word_timestamps=True)
    words = [[round(w.start, 2), round(w.end, 2), w.word.strip(), round(w.probability, 2)] for s in segs for w in (s.words or [])]
    db = os.path.join(a.salida, 'words.json')
    data = json.load(open(db, encoding='utf-8')) if os.path.exists(db) else {}
    data[name] = words
    with open(db, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
    print(name, ' '.join(f'{w[2]}@{w[0]}' + ('*' if w[3] < 0.5 else '') for w in words))
    print('(* = palabra dudosa, revísala)')


if __name__ == '__main__':
    main()
