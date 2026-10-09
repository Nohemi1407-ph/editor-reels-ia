#!/usr/bin/env python3
"""Follow the speaker: a smooth moving crop that keeps the main person inside the frame -> an mp4 window.

Usage:  PY track_crop.py <project_dir> <out.mp4> [--w 900] [--h 810] [--out-w 1080] [--out-h 972]
                         [--focus .38] [--smooth 1.2] [--audio <file>]
Needs <project>/assets/aroll.mp4 (1080x1920, 30fps CFR) and <project>/assets/subject.webm (cutout.py).

How: every 0.1s it reads the cutout alpha, keeps the LARGEST connected blob (the main person; people further
back are smaller and get ignored), aims at the blob's centre x and at `focus` of its height from the top (upper
back / head-and-shoulders), smooths that path with a moving average of `smooth` seconds plus a speed limit, then
crops a w x h box around it (clamped to the frame) and scales it to out-w x out-h. The camera glides, never jumps.
Use it for the "Video viral" letterbox window, or for any reel where the subject wanders out of frame
(handheld, gym, sports). w/h smaller than the frame = some zoom, which is what gives room to follow sideways.
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import skillenv  # noqa: E402

FF = skillenv.tool('ffmpeg')
STEP = 0.1
SW, SH = 54, 96   # analysis grid (1080x1920 / 20)


def arg(name, default):
    return type(default)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


def largest_blob(mask):
    h, w = mask.shape
    seen = np.zeros_like(mask, bool)
    best = None
    for y0 in range(h):
        for x0 in range(w):
            if not mask[y0, x0] or seen[y0, x0]:
                continue
            stack, pts = [(y0, x0)], []
            seen[y0, x0] = True
            while stack:
                y, x = stack.pop()
                pts.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            if best is None or len(pts) > len(best):
                best = pts
    return best


def main():
    skillenv.utf8_stdio()
    proj = skillenv.path_arg(sys.argv[1])
    out = sys.argv[2]
    cw, ch = arg('--w', 900), arg('--h', 810)
    ow, oh = arg('--out-w', 1080), arg('--out-h', 972)
    focus, smooth = arg('--focus', .38), arg('--smooth', 1.2)
    audio = arg('--audio', '')
    aroll = os.path.join(proj, 'assets', 'aroll.mp4')
    subject = os.path.join(proj, 'assets', 'subject.webm')
    raw = subprocess.run([FF, '-loglevel', 'error', '-c:v', 'libvpx-vp9', '-i', subject, '-vf',
                          f'fps={1 / STEP},alphaextract,scale={SW}:{SH}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, SH, SW)
    cx, cy, last = [], [], (540.0, 900.0)
    for f in frames:
        blob = largest_blob(f > 128)
        if blob and len(blob) > 20:
            ys, xs = np.array(blob).T
            top, bot = ys.min(), ys.max()
            last = ((xs.mean() + .5) * 1080 / SW, (top + focus * (bot - top) + .5) * 1920 / SH)
        cx.append(last[0]); cy.append(last[1])   # no person found: hold the last aim
    k = max(1, int(smooth / STEP))
    pad = lambda a: np.convolve(np.pad(a, (k // 2, k - 1 - k // 2), mode='edge'), np.ones(k) / k, mode='valid')
    cx, cy = pad(np.array(cx)), pad(np.array(cy))
    vmax = 260 * STEP   # px per step: a calm operator, never a whip pan
    for a in (cx, cy):
        for i in range(1, len(a)):
            a[i] = a[i - 1] + np.clip(a[i] - a[i - 1], -vmax, vmax)
    xs = np.clip(cx - cw / 2, 0, 1080 - cw)
    ys = np.clip(cy - ch / 2, 0, 1920 - ch)

    KEY = 0.5   # keyframe spacing for the ffmpeg expression (the path is already smoothed; keeps nesting shallow)

    def lerp_expr(vals):
        # piecewise-linear expression over t, evaluated per frame by ffmpeg's crop filter
        v = vals[::int(round(KEY / STEP))]
        e = f'{v[-1]:.1f}'
        for i in range(len(v) - 2, -1, -1):
            t0 = i * KEY
            e = f'if(lt(t,{t0 + KEY:.2f}),{v[i]:.1f}+({v[i + 1]:.1f}-{v[i]:.1f})*(t-{t0:.2f})/{KEY},{e})'
        return e
    exprs = os.path.join(proj, 'work', 'track_crop.txt')
    os.makedirs(os.path.dirname(exprs), exist_ok=True)
    vf = f"crop={cw}:{ch}:'{lerp_expr(xs)}':'{lerp_expr(ys)}',scale={ow}:{oh}:flags=lanczos,unsharp=5:5:0.5:5:5:0,setsar=1"
    with open(exprs, 'w', encoding='utf-8') as fh:
        fh.write(vf)
    cmd = [FF, '-loglevel', 'error', '-y', '-i', aroll]
    if audio:
        cmd += ['-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-b:a', '192k', '-shortest']
    cmd += ['-/filter:v', exprs, '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', '-pix_fmt', 'yuv420p', out]
    subprocess.run(cmd, check=True)
    print(f'{out}: crop {cw}x{ch} -> {ow}x{oh}, aim x {xs.min():.0f}-{xs.max():.0f}, y {ys.min():.0f}-{ys.max():.0f}, {len(xs)} keys')


if __name__ == '__main__':
    main()
