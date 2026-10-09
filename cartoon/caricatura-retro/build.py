#!/usr/bin/env python3
"""Builds index.html for the "Trabajas mas que nunca" explainer reel (HyperFrames, 1080x1920, 40.783 s)."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DUR = 40.783

# ------------------------------------------------------------------ talk segments from word timings
with open(os.path.join(HERE, 'words.json'), encoding='utf-8') as f:
    WORDS = json.load(f)
TALK = []
for w in WORDS:
    if TALK and w['s'] - TALK[-1][1] < 0.28:
        TALK[-1][1] = w['e']
    else:
        TALK.append([w['s'], w['e']])

# ------------------------------------------------------------------ on-screen text
# group: id, top y, out time (None = stays), lines, optional (x0, x1) column
# word: (text, time, colour w|p|y, size, serif?)
def W(t, at, c='w', s=80, serif=False):
    return (t, at, c, s, serif)


GROUPS = [
    ('t1a', 250, 0.95, [[W('Trabajas', 0.0, 'w', 136)], [W('MÁS', .5, 'p', 128), W('QUE', .62, 'p', 128), W('NUNCA', .78, 'p', 128)]]),
    ('t1b', 262, 2.66, [[W('y', .96, 'w', 92), W('ganas', 1.16, 'w', 92), W('lo', 1.36, 'w', 92)], [W('mismo.', 1.54, 'y', 230, True)]]),
    ('t1c', 604, 2.66, [[W('te', 1.9, 'w', 80), W('digo', 2.04, 'w', 80), W('por', 2.16, 'w', 80), W('qué', 2.38, 'p', 80)]]),
    ('t2a', 410, 4.12, [[W('contestas', 3.0, 'w', 84), W('mensajes', 3.36, 'w', 84)], [W('a', 3.7, 'w', 104), W('medianoche', 3.88, 'y', 178, True)]]),
    ('t3a', 250, 6.56, [[W('respondes', 4.44, 'w', 84)], [W('la', 4.82, 'w', 120), W('misma', 4.94, 'w', 120), W('pregunta', 5.18, 'w', 120)],
                        [W('×10', 5.52, 'p', 210), W('al', 6.0, 'w', 88), W('día', 6.22, 'w', 88)]]),
    ('t4a', 270, 7.74, [[W('persigues', 6.8, 'w', 128)], [W('pagos', 7.16, 'p', 240, True)]]),
    ('t5a', 250, 10.93, [[W('buscas', 7.96, 'w', 96), W('ese', 8.26, 'w', 96)], [W('archivo', 8.52, 'y', 214, True)]]),
    ('t5b', 590, 10.93, [[W('que', 8.98, 'w', 80), W('juras', 9.64, 'p', 80), W('que', 10.1, 'w', 80), W('guardaste', 10.32, 'w', 80)]]),
    ('t6a', 240, 13.84, [[W('y', 11.26, 'w', 80), W('al', 11.4, 'w', 80), W('final', 11.5, 'w', 80), W('del', 11.7, 'w', 80), W('día', 11.88, 'w', 80)],
                         [W('agotada', 12.12, 'p', 180)]]),
    ('t6c', 520, 13.84, [[W('pero', 12.56, 'w', 78), W('tu', 12.78, 'w', 78), W('negocio', 12.92, 'w', 78)], [W('no', 13.2, 'y', 110), W('creció', 13.4, 'y', 110)]]),
    ('t7a', 268, 15.8, [[W('No', 14.14, 'w', 134), W('es', 14.32, 'w', 134), W('falta', 14.6, 'w', 134)], [W('de', 14.84, 'w', 96), W('esfuerzo', 15.08, 'y', 206, True)]]),
    ('t7b', 250, 17.62, [[W('es', 15.88, 'w', 88), W('que', 16.02, 'w', 88), W('tu', 16.12, 'w', 88), W('negocio', 16.24, 'w', 88)],
                         [W('depende', 16.6, 'w', 120), W('de', 16.94, 'w', 120)]]),
    ('t7c', 238, 18.92, [[W('TI', 17.8, 'y', 220)], [W('para', 18.0, 'w', 90)], [W('TODO', 18.44, 'p', 160)]], (450, 1045)),
    ('t8a', 300, 20.05, [[W('mira', 19.22, 'y', 176, True), W('esto', 19.38, 'y', 176, True)]]),
    ('t8b', 250, 22.42, [[W('si', 20.06, 'w', 84), W('pierdes', 20.22, 'w', 84), W('solo', 20.58, 'w', 84)],
                         [W('2 h', 20.82, 'y', 184), W('al', 21.24, 'w', 120), W('día', 21.42, 'w', 120)],
                         [W('en', 21.52, 'w', 80), W('tareas', 21.66, 'w', 80), W('repetitivas', 21.94, 'w', 80)]]),
    ('t8c', 280, 24.06, [[W('y', 22.5, 'w', 90), W('tu', 22.64, 'w', 90), W('hora', 22.8, 'w', 90), W('vale', 22.92, 'w', 90)], [W('× $25', 23.12, 'p', 214)]]),
    ('t8d', 418, 26.0, [[W('al', 25.18, 'w', 120), W('año', 25.38, 'w', 120)]]),
    ('t8e', 418, 27.28, [[W('que', 26.76, 'w', 86), W('estás', 26.92, 'w', 86)], [W('regalando', 27.08, 'p', 200, True)]]),
    ('t9a', 250, 30.18, [[W('los', 27.58, 'w', 84), W('negocios', 28.18, 'w', 84), W('que', 28.54, 'w', 84), W('crecen', 28.76, 'w', 84)],
                         [W('NO', 28.98, 'p', 172), W('trabajan', 29.16, 'w', 120), W('más', 29.56, 'w', 120)]]),
    ('t9b', 280, 31.64, [[W('trabajan', 30.26, 'w', 120), W('con', 30.66, 'w', 120)], [W('sistemas', 30.94, 'y', 236, True)]]),
    ('t10a', 250, 33.42, [[W('si', 31.94, 'w', 112), W('esto', 32.08, 'w', 112), W('te', 32.24, 'w', 112), W('pasa', 32.46, 'w', 112)],
                          [W('comenta', 32.94, 'w', 110), W('YO', 33.08, 'p', 214)]]),
    ('t10b', 252, 34.84, [[W('y', 33.48, 'w', 88), W('etiqueta', 33.6, 'w', 88), W('esa', 33.9, 'w', 88)], [W('amiga', 34.08, 'y', 196, True)],
                          [W('emprendedora', 34.3, 'p', 110)]]),
    ('t10c', 262, 36.45, [[W('que', 34.86, 'w', 104), W('necesita', 35.08, 'w', 104)], [W('escuchar', 35.44, 'w', 104), W('esto', 36.0, 'y', 160)]]),
    ('t11a', 262, 38.43, [[W('sígueme', 36.82, 'y', 176)], [W('y', 37.1, 'w', 80), W('te', 37.6, 'w', 80), W('enseño', 37.82, 'w', 80), W('a', 38.04, 'w', 80), W('construir', 38.22, 'p', 80)]]),
    ('t11b', 250, None, [[W('un', 38.44, 'w', 84), W('negocio', 38.68, 'w', 84), W('que', 38.94, 'w', 84), W('trabaje', 39.14, 'w', 84)],
                         [W('para', 39.4, 'y', 200, True), W('ti', 39.62, 'y', 200, True)],
                         [W('y', 39.78, 'p', 88), W('no', 40.02, 'p', 88), W('al', 40.14, 'p', 88), W('revés', 40.38, 'p', 88)]]),
]


def text_html():
    out = []
    for g in GROUPS:
        gid, top, tout, lines = g[0], g[1], g[2], g[3]
        x0, x1 = g[4] if len(g) > 4 else (35, 1045)
        ls = []
        for line in lines:
            ws = []
            for (t, at, c, s, serif) in line:
                cls = 'w c-' + c + (' sf' if serif else '')
                ws.append(f'<span class="{cls}" data-t="{at:.3f}" data-s="{s}" style="font-size:{s}px">{t}</span>')
            ls.append('<div class="ln">' + ''.join(ws) + '</div>')
        out.append(f'<div class="tg" id="{gid}" data-out="{"" if tout is None else f"{tout:.3f}"}" '
                   f'style="top:{top}px;left:{x0}px;width:{x1 - x0}px">' + ''.join(ls) + '</div>')
    return '\n'.join(out)


# ------------------------------------------------------------------ sound design (<= 0.3)
SFX_LEN = {'whoosh-short': .575, 'pop': .72, 'sparkle': 1.8, 'click': .366, 'click-soft': .366, 'impact-bass-1': 2.116}
SFX = [
    # transitions
    ('whoosh-short', 2.70, .22), ('whoosh-short', 4.14, .22), ('whoosh-short', 6.50, .25), ('whoosh-short', 7.66, .2),
    ('whoosh-short', 10.95, .22), ('whoosh-short', 13.84, .25), ('whoosh-short', 18.95, .22), ('whoosh-short', 27.30, .22),
    ('whoosh-short', 31.66, .22), ('whoosh-short', 36.50, .22), ('whoosh-short', 6.86, .14),
    # key pops
    ('pop', 0.0, .2), ('pop', .5, .14), ('pop', 1.54, .2), ('pop', 3.88, .18), ('pop', 5.52, .22), ('pop', 7.16, .2),
    ('pop', 8.52, .2), ('pop', 12.12, .18), ('pop', 15.08, .16), ('pop', 16.77, .2), ('pop', 17.8, .22), ('pop', 18.44, .2),
    ('pop', 19.22, .16), ('pop', 20.82, .2), ('pop', 23.12, .2), ('pop', 24.16, .16), ('pop', 27.1, .2), ('pop', 33.08, .2),
    ('pop', 34.08, .18), ('pop', 38.3, .14), ('pop', 28.98, .16),
    # taps / notifications
    ('click', 3.05, .22), ('click', 3.36, .22), ('click', 3.7, .22), ('click-soft', 4.5, .14), ('click-soft', 4.9, .14),
    ('click-soft', 5.3, .14), ('click-soft', 5.74, .16), ('click', 9.64, .12), ('click-soft', 33.5, .22), ('click', 36.95, .3),
    ('click-soft', 21.0, .14),
    # wins / impacts
    ('sparkle', 30.94, .22), ('sparkle', 39.62, .25), ('impact-bass-1', 25.4, .3),
]


def audio_html():
    out, lanes = [], []
    for k, (name, t, vol) in enumerate(sorted(SFX, key=lambda x: x[1])):
        d = min(SFX_LEN[name], DUR - t)
        lane = next((i for i, end in enumerate(lanes) if end <= t), None)
        if lane is None:
            lanes.append(0)
            lane = len(lanes) - 1
        lanes[lane] = t + d + 0.02
        out.append(f'  <audio id="sfx{k}" src="assets/sfx/{name}.mp3" data-start="{t:.3f}" data-duration="{d:.3f}" '
                   f'data-track-index="{10 + lane}" data-volume="{vol:.3f}"></audio>')
    return '\n'.join(out)


CSS = '''
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:400 700;font-display:block;src:url('assets/fonts/InterTight-var-latin.woff2') format('woff2');}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:600;font-display:block;src:url('assets/fonts/InterTight-var-latin.woff2') format('woff2');}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:700;font-display:block;src:url('assets/fonts/InterTight-var-latin.woff2') format('woff2');}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:800;font-display:block;src:url('assets/fonts/InterTight-800-normal.woff2') format('woff2');}
@font-face{font-family:'Inter Tight';font-style:normal;font-weight:900;font-display:block;src:url('assets/fonts/InterTight-900-normal.woff2') format('woff2');}
@font-face{font-family:'DM Serif Display';font-style:normal;font-weight:400;font-display:block;src:url('assets/fonts/DMSerifDisplay-400-normal.woff2') format('woff2');}
@font-face{font-family:'DM Serif Display';font-style:italic;font-weight:400;font-display:block;src:url('assets/fonts/DMSerifDisplay-400-italic.woff2') format('woff2');}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#FBF3DC}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#FBF3DC}
#world{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:50% 55%}
#texts{position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none}
.tg{position:absolute;text-align:center}
.ln{display:flex;justify-content:center;align-items:baseline;white-space:nowrap;line-height:1.04;transform-origin:50% 50%}
.w{display:inline-block;font-family:'Inter Tight',sans-serif;font-weight:900;color:#fff;margin:0 .15em;
   -webkit-text-stroke:16px #1d1b2e;paint-order:stroke fill;text-shadow:0 8px 0 #1d1b2e;transform-origin:50% 60%;letter-spacing:-0.01em}
.sf{font-family:'DM Serif Display',serif;font-style:italic;font-weight:400;-webkit-text-stroke:13px #1d1b2e;padding:0 .05em;margin:0 .03em;letter-spacing:0}
.c-p{color:#FF2E93;text-shadow:0 8px 0 #1d1b2e,0 0 34px rgba(255,46,147,.75)}
.c-y{color:#FFE600;text-shadow:0 8px 0 #1d1b2e,0 0 34px rgba(255,230,0,.7)}
'''

SCENE_JS = r'''
(function () {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const INK = '#1d1b2e';
const tl = gsap.timeline({ paused: true });
const S = (t) => Math.max(0, t - 0.002);
const $ = (id) => document.getElementById(id);
function el(tag, a, p) {
  const n = document.createElementNS(NS, tag);
  if (a) for (const k in a) n.setAttribute(k, a[k]);
  if (p) p.appendChild(n);
  return n;
}
const G = (p, id) => el('g', id ? { id } : {}, p);
const L = { backs: $('backs'), wipes: $('wipes'), charL: $('charL'), fronts: $('fronts'), fx: $('fxL') };
const DUR = window.__DUR;

// --------------------------------------------------------------- generic motion helpers
// float: gentle idle (y + optional rotation), whole half-cycles so it ends where it began
function fl(node, t0, t1, amp, half, rot, ox, oy) {
  amp = amp == null ? 8 : amp; half = half || 0.8; rot = rot || 0;
  let n = Math.floor((t1 - t0) / half); if (n % 2) n -= 1; if (n < 2) return;
  if (ox != null) gsap.set(node, { svgOrigin: ox + ' ' + oy });
  tl.fromTo(node, { y: 0, rotation: 0 }, { y: -amp, rotation: rot, duration: half, ease: 'sine.inOut', repeat: n - 1, yoyo: true, immediateRender: false }, t0);
}
// oscillation of one property: 0 -> +a -> -a ... -> 0
function osc(node, prop, t0, t1, amp, half) {
  let prev = 0, i = 0;
  for (let t = t0; t + half <= t1 + 1e-6; t += half, i++) {
    const last = t + 2 * half > t1 + 1e-6;
    const v = last ? 0 : (i % 2 ? -amp : amp);
    tl.fromTo(node, { [prop]: prev }, { [prop]: v, duration: half, ease: 'sine.inOut', immediateRender: false }, t);
    prev = v;
  }
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c * k)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('');
}

// --------------------------------------------------------------- scenes (back + front groups)
const SCN = {
  1: { c: '#FBF3DC', a: 0, b: 2.98 }, 2: { c: '#1F2A5C', a: 2.98, b: 4.42 }, 3: { c: '#FFD3E4', a: 4.42, b: 6.80 },
  4: { c: '#FFE07A', a: 6.52, b: 7.94 }, 5: { c: '#CFE6FF', a: 7.94, b: 11.24 }, 6: { c: '#FF8A5C', a: 11.24, b: 14.0 },
  7: { c: '#FBF3DC', a: 14.0, b: 19.2 }, 8: { c: '#C6EFD8', a: 19.2, b: 27.56 }, 9: { c: '#57A0FF', a: 27.56, b: 31.92 },
  10: { c: '#FFB3D1', a: 31.92, b: 36.8 }, 11: { c: '#FBF3DC', a: 36.8, b: DUR + 1 }
};
const DECO_SPOTS = [[80, 860, 'ring'], [1000, 820, 'plus'], [70, 1330, 'star'], [1010, 1400, 'ring'], [150, 1620, 'plus'], [930, 1680, 'star'], [540, 1760, 'squig']];
Object.keys(SCN).forEach((k) => {
  const s = SCN[k];
  s.B = G(L.backs, 's' + k); s.F = G(L.fronts, 'f' + k);
  el('rect', { x: -10, y: -10, width: 1100, height: 1940, fill: s.c }, s.B);
  s.deco = G(s.B);
  if (+k !== 6) el('rect', { x: -10, y: 1462, width: 1100, height: 470, fill: shade(s.c, 0.9) }, s.B);
  s.props = G(s.B);
});
function deco(k, col, skip) {
  const s = SCN[+k], g = s.deco;
  DECO_SPOTS.forEach(([x, y, kind], i) => {
    if (skip && skip.indexOf(i) >= 0) return;
    const w = G(g), d = G(w);
    gsap.set(w, { x, y });
    const st = { fill: 'none', stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    if (kind === 'ring') el('circle', Object.assign({ cx: 0, cy: 0, r: 26 }, st), d);
    if (kind === 'plus') el('path', Object.assign({ d: 'M-22,0 H22 M0,-22 V22' }, st), d);
    if (kind === 'star') el('path', Object.assign({ d: 'M0,-30 C4,-8 8,-4 30,0 C8,4 4,8 0,30 C-4,8 -8,4 -30,0 C-8,-4 -4,-8 0,-30 Z' }, st, { 'stroke-width': 7 }), d);
    if (kind === 'squig') el('path', Object.assign({ d: 'M-70,0 Q-52,-18 -35,0 T0,0 T35,0 T70,0' }, st), d);
    const t0 = s.a, t1 = Math.min(s.b, DUR);
    tl.fromTo(d, { rotation: -20 }, { rotation: 20 + (i % 2 ? 40 : -10), duration: t1 - t0, ease: 'none', immediateRender: false }, t0);
    fl(d, t0, t1, 10 + (i % 3) * 4, 0.9 + (i % 3) * 0.15);
  });
}
deco(1, '#F2C9A0'); deco(2, '#34427E', [0, 1]); deco(3, '#FFAACB'); deco(4, '#F5C341'); deco(5, '#9FCBF5');
deco(7, '#F2C9A0'); deco(8, '#93D9B4'); deco(9, '#86BEFF'); deco(10, '#FF8DBA'); deco(11, '#F2C9A0');

// prop in a wrapper group (wrapper takes idle float / custom moves)
function P(k, layer, kind, opts) {
  const s = SCN[k];
  const w = G(layer === 'f' ? s.F : s.props);
  const api = Props[kind](w, opts);
  api.w = w; api.ox = opts.x; api.oy = opts.y;
  return api;
}
function idle(api, t0, t1, amp, half, rot) { fl(api.w, t0, t1, amp == null ? 7 : amp, half || 0.75, rot || 0, api.ox, api.oy); }

// --------------------------------------------------------------- Host (one rig through the whole reel)
const nw = G(L.charL, 'hostW');
const N = Girl.create(nw, { id: 'host', x: 430, y: 1500, scale: 1.0 });
const flipEl = N.root.querySelector('#host-flip');
let NP = { x: 430, y: 1500, scale: 1.0 };
function nMove(t, d, to, ease) {
  const from = {}, dst = {};
  Object.keys(to).forEach((k) => { from[k] = NP[k]; dst[k] = to[k]; NP[k] = to[k]; });
  tl.fromTo(N.root, from, Object.assign(dst, { duration: d, ease: ease || 'power2.inOut', immediateRender: false }), t);
}
let flipped = false;
function nFlip(t, on) { tl.set(flipEl, { attr: { transform: on ? 'scale(-1,1)' : 'scale(1,1)' } }, S(t)); flipped = on; }
const pose = (t, n, d) => N.pose(tl, t, n, d == null ? 0.25 : d);
const face = (t, n) => N.face(tl, t, n);
// opening state (applied outside the main timeline)
(function () { const t0 = gsap.timeline({ paused: true }); N.pose(t0, 0, 'typing', 0.01); N.face(t0, 0, 'tired'); t0.progress(1); t0.kill(); })();
window.__TALK.forEach(([a, b]) => N.talk(tl, a, b));
N.autoBlink(tl, 0.3, DUR - 0.2);
N.bob(tl, 0, 16.0, 5); N.bob(tl, 19.2, DUR - 0.1, 5);

// --------------------------------------------------------------- transitions
const WMAX = 2300;
function showScene(k) {
  const s = SCN[k];
  if (s.a > 0) { gsap.set([s.B, s.F], { opacity: 0 }); tl.set([s.B, s.F], { opacity: 1 }, S(s.a)); }
  if (s.b < DUR) tl.set([s.B, s.F], { opacity: 0 }, S(s.b));
}
Object.keys(SCN).forEach(showScene);
function iris(t0, d, cx, cy, col) {
  const g = G(L.wipes);
  const c = el('circle', { cx, cy, r: 0, fill: col, stroke: INK, 'stroke-width': 12 }, g);
  tl.fromTo(c, { attr: { r: 0 } }, { attr: { r: WMAX }, duration: d, ease: 'power2.in', immediateRender: false }, t0);
  tl.set(g, { opacity: 0 }, S(t0 + d + 0.03));
}
function wipeDown(t0, d, col) {
  const g = G(L.wipes);
  const r = el('rect', { x: -10, y: -1960, width: 1100, height: 1960, fill: col }, g);
  const edge = el('path', { d: 'M-10,0 Q135,60 270,0 T540,0 T810,0 T1090,0 V-40 H-10 Z', fill: col, stroke: INK, 'stroke-width': 10 }, g);
  gsap.set(edge, { y: -1960 });
  tl.fromTo([r], { y: 0 }, { y: 1960, duration: d, ease: 'power2.inOut', immediateRender: false }, t0);
  tl.fromTo(edge, { y: -1960 + 30 }, { y: 1960 + 40, duration: d, ease: 'power2.inOut', immediateRender: false }, t0);
  tl.set(g, { opacity: 0 }, S(t0 + d + 0.03));
}
function wipeUpBands(t0, d, bands) {
  const g = G(L.wipes);
  bands.forEach(([y0, col], i) => {
    const r = el('rect', { x: -10, y: y0, width: 1100, height: 1960 - y0, fill: col, stroke: INK, 'stroke-width': 10 }, g);
    gsap.set(r, { y: 1960 - y0 + 20 });
    tl.fromTo(r, { y: 1960 - y0 + 20 }, { y: 0, duration: d - i * 0.05, ease: 'power3.out', immediateRender: false }, t0 + i * 0.05);
  });
  tl.set(g, { opacity: 0 }, S(t0 + d + 0.03));
}
function diag(t0, d, col) {
  const g = G(L.wipes), rg = el('g', { transform: 'rotate(18 540 960)' }, g);
  const r = el('rect', { x: -3200, y: -900, width: 2600, height: 3800, fill: col, stroke: INK, 'stroke-width': 12 }, rg);
  tl.fromTo(r, { attr: { x: -3200 } }, { attr: { x: -400 }, duration: d, ease: 'power2.inOut', immediateRender: false }, t0);
  tl.set(g, { opacity: 0 }, S(t0 + d + 0.03));
}
function blinds(t0, d, col) {
  const g = G(L.wipes);
  for (let i = 0; i < 6; i++) {
    const r = el('rect', { x: i * 180 - 2, y: -1960, width: 184, height: 1960, fill: col, stroke: INK, 'stroke-width': 8 }, g);
    tl.fromTo(r, { attr: { y: -1960 } }, { attr: { y: 0 }, duration: d - 0.1, ease: 'power3.in', immediateRender: false }, t0 + (i % 2 ? 0.08 : 0) + i * 0.012);
  }
  tl.set(g, { opacity: 0 }, S(t0 + d + 0.03));
}
const flash = el('rect', { x: -10, y: -10, width: 1100, height: 1940, fill: '#FFFFFF', opacity: 0 }, L.fx);

// --------------------------------------------------------------- hook zoom
gsap.set('#world', { scale: 1.12 });
tl.fromTo('#world', { scale: 1.12 }, { scale: 1, duration: 0.7, ease: 'power3.out', immediateRender: false }, 0);

// ================================================================= SCENE 1  0.00-2.98  desk, typing
{
  const lc = P(1, 'b', 'lineChart', { id: 'lc1', x: 852, y: 905, scale: 0.6 });
  lc.pop(tl, 1.16, 0.45); lc.flat(tl, 1.36, 0.5); idle(lc, 1.7, 3.0, 6, 0.6, 2);
  const sw = P(1, 'b', 'sweatDrops', { id: 'sw1', x: 560, y: 790, scale: 0.8 });
  sw.drip(tl, 0.35, 1.85, 0.5);
  const desk = P(1, 'f', 'desk', { id: 'desk', x: 470, y: 1500, scale: 0.95 });
  [0.0, 0.5, 0.62, 0.78, 0.96, 1.16, 1.36, 1.54].forEach((t, i) => {
    tl.fromTo(desk.minis[i], { scale: 0, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.26, ease: 'back.out(2.6)', immediateRender: false }, t + 0.03);
  });
  desk.glow(tl, 0.78, 0.8); desk.bounce(tl, 1.54);
  // frantic typing jitter
  tl.fromTo(nw, { y: 0 }, { y: -4, duration: 0.08, repeat: 21, yoyo: true, ease: 'sine.inOut', immediateRender: false }, 0.02);
  // "te digo por qué": desk drops away, she turns to camera
  tl.fromTo(desk.w, { y: 0 }, { y: 1000, duration: 0.42, ease: 'back.in(1.3)', immediateRender: false }, 1.74);
  face(1.54, 'annoyed');
  pose(1.9, 'pointYou'); face(1.9, 'proud');
  nMove(1.86, 0.4, { x: 520, y: 1510, scale: 1.04 }, 'back.out(1.6)');
}
// T1 night falls
wipeDown(2.70, 0.30, SCN[2].c);
nMove(2.72, 0.3, { x: 330, y: 1500, scale: 1.0 });
pose(2.8, 'holdPhone'); face(2.98, 'tired');

// ================================================================= SCENE 2  2.98-4.42  midnight
{
  const ms = P(2, 'b', 'moonStars', { id: 'ms', x: 540, y: 330, sky: false });
  ms.pop(tl, 2.96, 0.45); ms.twinkle(tl, 3.0, 4.42, 0.6);
  const wc = P(2, 'b', 'wallClock', { id: 'wc', x: 800, y: 850, scale: 1.28, time: '11:25' });
  wc.pop(tl, 3.0, 0.45); wc.tick(tl, 3.1, 3.5); wc.setTime(tl, 3.5, '12:00', 0.42); wc.bounce(tl, 3.95);
  const ph = P(2, 'b', 'phone', { id: 'ph', x: 800, y: 1262, scale: 1.15 });
  ph.pop(tl, 2.98, 0.4);
  ph.notify(tl, 3.05, '¿Hola?'); ph.notify(tl, 3.36, '¿Precio?'); ph.notify(tl, 3.7, '¿Sigues ahí?'); ph.buzz(tl, 4.1);
  idle(ph, 3.4, 4.42, 6, 0.5, 2);
  face(3.88, 'surprised');
}
// T2 pink iris out of the phone
iris(4.14, 0.28, 800, 1262, SCN[3].c);
nMove(4.16, 0.28, { x: 270 });
pose(4.2, 'typing'); face(4.44, 'annoyed');

// ================================================================= SCENE 3  4.42-6.80  same question x10
{
  const cb = P(3, 'b', 'chatBubbles', { id: 'cb', x: 712, y: 1115, scale: 0.72 });
  cb.stack(tl, 4.5, 5.74, 10, '¿precio?');
  gsap.set(cb.badge, { opacity: 0 });
  gsap.set(cb.w, { svgOrigin: '712 1400' });
  osc(cb.w, 'rotation', 5.8, 6.8, 2.2, 0.12);
  face(5.52, 'shout');
  pose(6.0, 'handsOnHips'); face(6.0, 'annoyed');
}
// T3 whip push left
tl.fromTo(SCN[3].B, { x: 0 }, { x: -1080, duration: 0.28, ease: 'power3.in', immediateRender: false }, 6.52);
tl.fromTo(SCN[4].B, { x: 1080 }, { x: 0, duration: 0.28, ease: 'power3.in', immediateRender: false }, 6.52);
nMove(6.52, 0.3, { x: 140 }, 'power2.in');
pose(6.55, 'point'); nFlip(6.66, true); face(6.8, 'shout');

// ================================================================= SCENE 4  6.80-7.94  chasing payments
{
  const inv = P(4, 'b', 'invoice', { id: 'inv', x: 760, y: 870, scale: 0.72 });
  inv.pop(tl, 6.8, 0.4); inv.flap(tl, 6.85, 7.22); inv.stamp(tl, 7.16);
  inv.fly(tl, 7.2, 7.95, [[0, 0], [50, -70], [100, -20], [130, -100]]);
  const slw = G(SCN[4].props);
  const sl = Props.speedLines(slw, { id: 'sl4', x: -190, y: 1060, w: 250, h: 300, dir: 'left' });
  sl.show(tl, 6.85, 7.95, 0.24);
  tl.fromTo(slw, { x: 0 }, { x: 340, duration: 0.9, ease: 'sine.inOut', immediateRender: false }, 6.86);
  // run: travel + hops + lean
  nMove(6.86, 0.86, { x: 480 }, 'sine.inOut');
  nMove(7.72, 0.22, { x: 760 }, 'power2.out');
  tl.fromTo(N.root, { y: 1500 }, { y: 1467, duration: 0.13, repeat: 7, yoyo: true, ease: 'sine.out', immediateRender: false }, 6.86);
  tl.fromTo(N.root, { rotation: 0 }, { rotation: 7, duration: 0.18, ease: 'power2.out', immediateRender: false }, 6.86);
  tl.fromTo(N.root, { rotation: 7 }, { rotation: 0, duration: 0.2, ease: 'power2.inOut', immediateRender: false }, 7.75);
  face(7.5, 'worried');
}
// T4 light-blue iris from where the invoice escaped
iris(7.66, 0.28, 860, 760, SCN[5].c);
nFlip(7.8, false);

// ================================================================= SCENE 5  7.94-11.24  the lost file
{
  const fo = P(5, 'b', 'folders', { id: 'fo', x: 330, y: 1440, scale: 0.85 });
  fo.pop(tl, 7.96, 0.45); fo.bounce(tl, 8.26); fo.burst(tl, 8.52, 0.9); fo.search(tl, 8.75, 10.95);
  pose(7.96, 'point'); face(7.96, 'worried');
  face(8.52, 'surprised');
  pose(9.64, 'facepalm'); face(9.64, 'tired');
  pose(10.32, 'shrug'); face(10.32, 'worried');
  // floating question marks
  [[905, 790, 9.0, -14], [628, 742, 10.32, 12]].forEach(([x, y, t, r], i) => {
    const w0 = G(SCN[5].props), w = G(w0), q = G(w);
    gsap.set(w0, { x, y });
    const tx = el('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Inter Tight', 'font-weight': 900, 'font-size': 120,
      fill: '#FF2E93', stroke: INK, 'stroke-width': 14, 'paint-order': 'stroke fill', 'stroke-linejoin': 'round' }, q);
    tx.textContent = '?';
    gsap.set(q, { scale: 0, rotation: r });
    tl.fromTo(q, { scale: 0, rotation: r - 40 }, { scale: 1, rotation: r, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, t);
    fl(w, t + 0.35, 11.24, 12, 0.5, 6);
  });
}
// T5 sunset bands rise
const SUN = [[0, '#FF8A5C'], [760, '#FFA463'], [1180, '#FFBE73'], [1462, '#E58A55']];
wipeUpBands(10.95, 0.3, SUN);
nMove(10.97, 0.3, { x: 320 });
pose(11.0, 'idle', 0.3); face(11.26, 'neutral');

// ================================================================= SCENE 6  11.24-14.00  exhausted
{
  const B = SCN[6].B, deco6 = SCN[6].deco;
  el('rect', { x: -10, y: 760, width: 1100, height: 1200, fill: SUN[1][1] }, deco6);
  const sunW = G(deco6);
  el('circle', { cx: 770, cy: 1170, r: 230, fill: '#FFE08A', stroke: INK, 'stroke-width': 8 }, sunW);
  el('rect', { x: -10, y: 1180, width: 1100, height: 800, fill: SUN[2][1] }, deco6);
  el('rect', { x: -10, y: 1462, width: 1100, height: 470, fill: SUN[3][1] }, deco6);
  el('path', { d: 'M-10,1180 H1090', stroke: INK, 'stroke-width': 8, fill: 'none' }, deco6);
  tl.fromTo(sunW, { y: -40 }, { y: 120, duration: 2.8, ease: 'none', immediateRender: false }, 11.24);
  // birds
  [[160, 560], [260, 610], [940, 520]].forEach(([x, y], i) => {
    const bw = G(deco6);
    el('path', { d: 'M-24,0 Q-12,-14 0,0 Q12,-14 24,0', fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, bw);
    tl.fromTo(bw, { x: x, y: y }, { x: x + 120, y: y - 30, duration: 2.8, ease: 'none', immediateRender: false }, 11.24);
  });
  const bat = P(6, 'b', 'battery', { id: 'bat', x: 800, y: 880, scale: 1.1 });
  bat.pop(tl, 11.28, 0.45); bat.drain(tl, 11.45, 12.3, 4); idle(bat, 12.4, 14.0, 6, 0.6, 2);
  const lc = P(6, 'b', 'lineChart', { id: 'lc6', x: 640, y: 1080, scale: 0.5 });
  lc.pop(tl, 12.56, 0.45); lc.flat(tl, 12.92, 0.5); idle(lc, 13.2, 14.0, 5, 0.4, 2);
  const pl = P(6, 'b', 'plant', { id: 'pl', x: 860, y: 1475, scale: 0.8 });
  pl.pop(tl, 11.4, 0.45); pl.wilt(tl, 13.4, 0.8);
  N.slump(tl, 12.12, true); face(12.12, 'tired');
  pose(13.3, 'shrug'); face(13.4, 'worried');
  N.slump(tl, 13.9, false);
}
// T6 zoom punch with flash
tl.fromTo(flash, { opacity: 0 }, { opacity: 0.9, duration: 0.12, ease: 'power1.in', immediateRender: false }, 13.88);
tl.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.22, ease: 'power1.out', immediateRender: false }, 14.0);
gsap.set(SCN[7].B, { svgOrigin: '540 1100' });
tl.fromTo(SCN[7].B, { scale: 1.22 }, { scale: 1, duration: 0.4, ease: 'power3.out', immediateRender: false }, 14.0);
nMove(13.9, 0.24, { x: 540 });
pose(13.95, 'handsOnHips', 0.3); face(14.14, 'proud');

// ================================================================= SCENE 7  14.00-19.20  carrying everything
{
  const sp1 = P(7, 'b', 'sparkle', { id: 'sp7a', x: 300, y: 860, scale: 0.8 }); sp1.burst(tl, 14.6);
  const sp2 = P(7, 'b', 'sparkle', { id: 'sp7b', x: 790, y: 820, scale: 1.0, color: '#FF5FA2' }); sp2.burst(tl, 15.08);
  const sp3 = P(7, 'b', 'sparkle', { id: 'sp7c', x: 470, y: 1180, scale: 0.8, color: '#8EC5F5' }); sp3.burst(tl, 16.1);
  const sl7w = G(SCN[7].props); const sl7 = Props.speedLines(sl7w, { id: 'sl7', x: 520, y: 1150, w: 200, h: 220, dir: 'right' }); sl7.show(tl, 15.9, 16.4, 0.2);
  pose(15.08, 'shrug'); face(15.08, 'happy');
  // walk to the left
  pose(15.86, 'idle', 0.25); face(15.88, 'neutral');
  nMove(15.88, 0.45, { x: 300 }, 'power2.inOut');
  tl.fromTo(N.root, { y: 1500 }, { y: 1477, duration: 0.11, repeat: 3, yoyo: true, ease: 'sine.out', immediateRender: false }, 15.88);
  pose(16.5, 'carryOverhead', 0.3); face(16.6, 'worried');
  face(18.44, 'scared');
  // the whole business on top of her
  const carry = G(SCN[7].F);
  const ws = (kind, opts, tDrop) => {
    const w = G(carry); const api = Props[kind](w, opts); api.w = w;
    gsap.set(w, { y: -1000 });
    tl.fromTo(w, { y: -1000 }, { y: 0, duration: 0.34, ease: 'power2.in', immediateRender: false }, tDrop - 0.34);
    api.bounce && api.bounce(tl, tDrop);
    return api;
  };
  const pile = ws('itemPile', { id: 'pile', x: 300, y: 760, scale: 0.75 }, 16.77);
  const store = ws('store', { id: 'st7', x: 296, y: 584, scale: 0.55 }, 17.8);
  const box = ws('box', { id: 'bx7', x: 205, y: 362, scale: 0.6 }, 18.12);
  const coins = ws('coins', { id: 'co7', x: 385, y: 364, scale: 0.8 }, 18.44);
  pile.wobble(tl, 16.9, 18.9);
  store.openSign(tl, 17.9);
  gsap.set(carry, { svgOrigin: '300 760' });
  osc(carry, 'rotation', 16.85, 18.44, 1.6, 0.26);
  osc(carry, 'rotation', 18.44, 19.0, 4.2, 0.14);
  tl.fromTo(carry, { opacity: 1, y: 0 }, { opacity: 0, y: -260, duration: 0.25, ease: 'power2.in', immediateRender: false }, 18.95);
  const sw = P(7, 'f', 'sweatDrops', { id: 'sw7', x: 405, y: 830, scale: 0.8 });
  sw.drip(tl, 17.0, 19.0, 0.5);
}
// T7 diagonal mint sweep
diag(18.95, 0.27, SCN[8].c);
pose(18.98, 'idle', 0.22);
nMove(18.98, 0.24, { x: 250 });
nFlip(19.1, true);

// ================================================================= SCENE 8  19.20-27.56  the math
{
  pose(19.22, 'pointSide'); face(19.22, 'proud');
  const sp8 = P(8, 'b', 'sparkle', { id: 'sp8', x: 560, y: 1000, scale: 0.9 }); sp8.burst(tl, 19.9);
  const c2 = P(8, 'b', 'clock2h', { id: 'c2', x: 760, y: 950, scale: 1.2 });
  c2.pop(tl, 20.82, 0.45); c2.sweep(tl, 20.95, 0.7); idle(c2, 21.7, 24.0, 6, 0.55, 3); c2.out(tl, 24.04, 0.25);
  face(20.82, 'surprised');
  pose(22.5, 'pointUp'); face(22.5, 'neutral'); face(23.12, 'surprised');
  const pt = P(8, 'b', 'priceTag', { id: 'pt', x: 775, y: 1272, scale: 1.26, text: '× $25' });
  pt.pop(tl, 23.12, 0.45); pt.swing(tl, 23.45, 24.0); pt.out(tl, 24.06, 0.25);
  const mc = P(8, 'b', 'moneyCounter', { id: 'mc', x: 540, y: 322, scale: 0.78 });
  mc.pop(tl, 24.16, 0.4); mc.countTo(tl, 24.2, 25.4, 13000, '$', ',', 26);
  tl.fromTo(mc.body, { scale: 1 }, { scale: 1.12, duration: 0.1, ease: 'power2.out', immediateRender: false }, 26.08);
  tl.fromTo(mc.body, { scale: 1.12 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1.1,0.4)', immediateRender: false }, 26.18);
  osc(mc.w, 'rotation', 25.5, 27.3, 1.5, 0.3);
  const rain = P(8, 'b', 'bills', { id: 'rain8', x: 540, y: 960 });
  rain.rain(tl, 24.25, 25.9, 9, { x: 0, y: -520, w: 520, h: 1020 }, 1.0);
  pose(24.16, 'idle', 0.3); face(24.16, 'surprised'); face(24.64, 'worried');
  face(25.38, 'scared'); N.jump(tl, 25.38, 38);
  const gb = P(8, 'b', 'giftBox', { id: 'gb', x: 780, y: 1468, scale: 0.75 });
  gb.pop(tl, 25.42, 0.45); idle(gb, 25.9, 26.7, 5, 0.4, 2); gb.bounce(tl, 26.08); gb.open(tl, 26.78);
  pose(27.08, 'facepalm'); face(27.08, 'tired');
}
// T8 bright-blue iris from the empty gift box
iris(27.3, 0.28, 780, 1340, SCN[9].c);
nMove(27.32, 0.26, { x: 230 });
pose(27.38, 'coffee'); face(27.58, 'happy');

// ================================================================= SCENE 9  27.56-31.92  systems
{
  const m = P(9, 'b', 'machine', { id: 'mach', x: 680, y: 1250, scale: 0.7 });
  m.pop(tl, 27.6, 0.5); m.spin(tl, 27.7, 31.92, 3); m.run(tl, 27.7, 31.92, 230);
  face(28.98, 'proud');
  pose(30.26, 'pointSide'); face(30.26, 'grin');
  const lc = P(9, 'b', 'lineChart', { id: 'lc9', x: 760, y: 905, scale: 0.62 });
  lc.pop(tl, 30.94, 0.4); lc.grow(tl, 31.02, 0.75);
  const sp = P(9, 'b', 'sparkle', { id: 'sp9', x: 880, y: 820, scale: 1.0 }); sp.burst(tl, 31.62);
  face(30.94, 'happy');
}
// T9 pink blinds drop
blinds(31.66, 0.3, SCN[10].c);
pose(31.7, 'wave'); face(31.94, 'happy');

// ================================================================= SCENE 10  31.92-36.80  comment + tag
{
  N.waveHand(tl, 31.98, 32.86);
  const cm = P(10, 'b', 'commentBubble', { id: 'cm', x: 712, y: 975, scale: 0.9, text: 'YO', user: 'tu_amiga' });
  cm.pop(tl, 32.24, 0.42); cm.type(tl, 33.08, 6); cm.like(tl, 33.5); idle(cm, 33.6, 36.8, 6, 0.6, 1.5);
  pose(33.08, 'pointSide'); face(33.08, 'grin');
  const tg = P(10, 'b', 'tagBubble', { id: 'tg', x: 650, y: 1200, scale: 0.88 });
  tg.pop(tl, 33.6, 0.45); tg.wiggle(tl, 34.3); tg.wiggle(tl, 35.44); idle(tg, 34.7, 36.8, 5, 0.5);
  const fr = P(10, 'b', 'friend', { id: 'fr', x: 850, y: 1380, scale: 0.88 });
  fr.pop(tl, 34.08, 0.45); fr.blink(tl, 34.9); fr.bounce(tl, 35.44); fr.blink(tl, 36.2); idle(fr, 34.6, 36.8, 8, 0.45, 4);
  pose(34.08, 'thumbsUp'); face(34.08, 'wink');
  pose(35.44, 'pointYou'); face(35.44, 'proud');
}
// T10 cream iris from the follow button
iris(36.5, 0.3, 540, 1395, SCN[11].c);
nMove(36.5, 0.34, { x: 540, y: 1334, scale: 0.85 }, 'power2.inOut');
N.jump(tl, 36.4, 60); nFlip(36.62, false);
pose(36.6, 'thumbsUp'); face(36.82, 'happy');

// ================================================================= SCENE 11  36.80-end  build a business that works for you
{
  const fbw = G(L.fx);
  const fb = Props.followButton(fbw, { id: 'fb', x: 540, y: 1395, scale: 0.95, text: 'Seguir', done: 'Siguiendo' });
  fb.pop(tl, 36.48, 0.42); fb.tap(tl, 36.95); fb.bounce(tl, 38.3); fb.bounce(tl, 40.1);
  const bk = P(11, 'b', 'blocks', { id: 'bk', x: 232, y: 1300, scale: 0.6, text: 'TIENDA' });
  bk.build(tl, 37.6, 39.42, 520); idle(bk, 39.5, DUR, 5, 0.5, 1.5);
  const sp = P(11, 'b', 'sparkle', { id: 'sp11', x: 232, y: 960, scale: 1.1 }); sp.burst(tl, 39.62);
  const sp2 = P(11, 'b', 'sparkle', { id: 'sp11b', x: 430, y: 1110, scale: 0.7, color: '#FF5FA2' }); sp2.burst(tl, 39.8);
  pose(38.22, 'point'); face(38.22, 'grin');
  pose(39.4, 'armsUp'); face(39.4, 'grin'); N.jump(tl, 39.62, 24);
  const sp3 = P(11, 'b', 'sparkle', { id: 'sp11c', x: 860, y: 1300, scale: 0.9 }); sp3.burst(tl, 37.02);
  face(40.38, 'wink');
}

// ================================================================= on-screen text
// start scale of a big pop: <= 1.25 and never past the frame edges
function clampS(w) {
  const r = w.getBoundingClientRect(), cx = (r.left + r.right) / 2, half = Math.max(1, r.width / 2);
  return Math.max(1, Math.min(1.25, Math.min(cx - 25, 1055 - cx) / half));
}
document.querySelectorAll('.tg').forEach((g) => {
  const out = g.dataset.out === '' ? null : +g.dataset.out;
  g.querySelectorAll('.w').forEach((w) => {
    const t = +w.dataset.t, s = +w.dataset.s, serif = w.classList.contains('sf');
    gsap.set(w, { opacity: 0 });
    if (s >= 150) {
      tl.fromTo(w, { opacity: 0, scale: () => clampS(w), rotation: serif ? 0 : -6, x: 0 }, { opacity: 1, scale: 1, rotation: 0, x: 0, duration: 0.24, ease: 'back.out(1.9)', immediateRender: false }, t);
      const end = out == null ? DUR : out;
      let n = Math.floor((end - t - 0.3) / 0.42); if (n % 2) n -= 1;
      if (n >= 2) tl.fromTo(w, { scale: 1 }, { scale: 1.035, duration: 0.42, ease: 'sine.inOut', repeat: n - 1, yoyo: true, immediateRender: false }, t + 0.26);
    } else if (serif) {
      tl.fromTo(w, { opacity: 0, x: -60, skewX: -14 }, { opacity: 1, x: 0, skewX: 0, duration: 0.22, ease: 'back.out(2.2)', immediateRender: false }, t);
    } else {
      tl.fromTo(w, { opacity: 0, y: 46, scale: 0.55 }, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'back.out(2.4)', immediateRender: false }, t);
    }
  });
  if (out != null) tl.fromTo(g, { opacity: 1, y: 0, scale: 1 }, { opacity: 0, y: -42, scale: 0.94, duration: 0.15, ease: 'power2.in', immediateRender: false }, out - 0.15);
});
// fit long lines to their column (static layout, after fonts load)
function fit() {
  document.querySelectorAll('.tg').forEach((g) => {
    const max = g.clientWidth - 8;
    g.querySelectorAll('.ln').forEach((ln) => {
      ln.style.transform = '';
      const ch = ln.children, a = ch[0], b = ch[ch.length - 1];
      const w = b.offsetLeft + b.offsetWidth - a.offsetLeft + 30;
      if (w > max) ln.style.transform = 'scale(' + (max / w).toFixed(4) + ')';
    });
  });
}
fit();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

tl.set({}, {}, DUR);
window.__timelines = window.__timelines || {};
window.__timelines['main'] = tl;
})();
'''

HTML = f'''<!doctype html>
<html lang="es" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="character.js"></script>
<script src="props.js"></script>
<style>{CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920">
  <audio id="vo" src="assets/vo.wav" data-start="0" data-duration="{DUR}" data-track-index="0" data-volume="1"></audio>
{audio_html()}
  <svg id="world" width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <g id="backs"></g><g id="wipes"></g><g id="charL"></g><g id="fronts"></g><g id="fxL"></g>
  </svg>
  <div id="texts">
{text_html()}
  </div>
</div>
<script>
window.__TALK = {json.dumps([[round(a, 3), round(b, 3)] for a, b in TALK])};
window.__DUR = {DUR};
{SCENE_JS}
</script>
</body>
</html>
'''

with open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
    f.write(HTML)
print('wrote index.html', len(HTML), 'bytes;', len(TALK), 'talk segments;', len(SFX), 'sfx')
