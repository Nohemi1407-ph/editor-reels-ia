#!/usr/bin/env python3
"""Hace una "hoja de contacto": una sola imagen con muchos cuadros del video y su tiempo. Sirve para que Claude
(y tú) vean un reel completo de un vistazo: estudiar un estilo de referencia o revisar un render.

Uso:  python3 scripts/hoja_contacto.py <video> [--cada 0.67] [--columnas 6] [--ancho 240] [--salida hoja.jpg]
Solo necesita ffmpeg.
"""
import argparse
import os
import shutil
import subprocess


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    ap.add_argument('--cada', type=float, default=0.67, help='segundos entre cuadros')
    ap.add_argument('--columnas', type=int, default=6)
    ap.add_argument('--ancho', type=int, default=240, help='ancho de cada cuadro en px')
    ap.add_argument('--salida', default=None)
    a = ap.parse_args()
    ff = shutil.which('ffmpeg') or 'ffmpeg'
    fp = shutil.which('ffprobe') or 'ffprobe'
    dur = float(subprocess.run([fp, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.video],
                               capture_output=True, text=True).stdout.strip() or 0)
    n = max(1, int(dur / a.cada))
    rows = (n + a.columnas - 1) // a.columnas
    out = a.salida or os.path.splitext(a.video)[0] + '_hoja.jpg'
    label = "drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,"
    tile = f"tile={a.columnas}x{rows}:padding=4:color=black"
    base = f"fps=1/{a.cada},scale={a.ancho}:-2,"
    cmd = [ff, '-v', 'error', '-y', '-i', a.video, '-frames:v', '1', '-q:v', '3', out]
    r = subprocess.run(cmd[:6] + ['-vf', base + label + tile] + cmd[6:], capture_output=True, text=True)
    if r.returncode != 0:   # algunos ffmpeg no traen drawtext (sin freetype): sin etiquetas de tiempo
        subprocess.run(cmd[:6] + ['-vf', base + tile] + cmd[6:], check=True)
        print(f'(sin etiquetas de tiempo: cuadro k = segundo k*{a.cada}, de izquierda a derecha y de arriba abajo)')
    print(f'listo: {out}  ({n} cuadros, uno cada {a.cada}s)')


if __name__ == '__main__':
    main()
