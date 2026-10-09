/* props.js — animatable flat-vector cartoon props for HyperFrames (HTML + SVG + GSAP 3.14).
 *
 * Usage:  const desk = Props.desk(svgGroup, { id:'dk', x:540, y:900, scale:1 });
 *         desk.pop(tl, 0.2); desk.windows(tl, 0.6, 4); desk.glow(tl, 1.4); desk.out(tl, 3);
 *
 * Conventions
 *  - Every factory: Props.name(parentSvgGroup, { id, x, y, scale, ...options }) -> { root, ...parts, ...animators }.
 *  - opts.id is REQUIRED and must be unique in the document; every animated node id is `${id}-<part>`.
 *  - Animators take the MAIN timeline `tl` + absolute seconds. All randomness is seeded from opts.id (mulberry32).
 *  - Every rotating / scaling part is a pivot <g>: an outer <g transform="translate(px py)"> plus an inner <g id>
 *    whose local (0,0) is the pivot. Its GSAP transformOrigin is fixed once, at build time, to that local origin
 *    (computed from getBBox, no svgOrigin). If you tween a part's scale/rotation yourself, do NOT pass
 *    transformOrigin; the pivot is already set.
 *  - Initial states are applied with gsap.set at build / animator-call time (outside the timeline); timeline tweens
 *    are fromTo with immediateRender:false or tl.set, so seeking in any order is deterministic.
 *  - Anchor (x,y): "bottom-center" for props that stand on the floor (desk, folders, plant, store, giftBox, blocks,
 *    itemPile, box...), "center" for everything else (see each factory).
 *  - Sizes in comments are at scale 1 on a 1080x1920 canvas. Outline 5.5 px #1d1b2e.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#1d1b2e';
  const SW = 5.5;
  const C = {
    ink: INK, blue: '#2F4FC0', lblue: '#8EC5F5', pink: '#FF5FA2', yellow: '#FFD93B', cream: '#FBF3DC',
    white: '#FFFFFF', green: '#4CB27A', red: '#FF4D4D', skin: '#F08A6C'
  };
  const FONT = "'Inter Tight', sans-serif";
  const SERIF = "'DM Serif Display', serif";
  const S = (t) => Math.max(0, t - 0.002); // tl.set time nudge (see gotchas: sets on round times fire a frame late)

  // ---------------------------------------------------------------- low-level svg helpers
  function E(tag, a, p) {
    const n = document.createElementNS(NS, tag);
    if (a) for (const k in a) if (a[k] !== null && a[k] !== undefined) n.setAttribute(k, a[k]);
    if (p) p.appendChild(n);
    return n;
  }
  function st(fill, ex) {
    return Object.assign({ fill: fill || 'none', stroke: INK, 'stroke-width': SW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, ex || {});
  }
  const R = (p, x, y, w, h, r, fill, ex) => E('rect', Object.assign(st(fill, ex), { x, y, width: w, height: h, rx: r || 0 }), p);
  const Ci = (p, cx, cy, r, fill, ex) => E('circle', Object.assign(st(fill, ex), { cx, cy, r }), p);
  const El = (p, cx, cy, rx, ry, fill, ex) => E('ellipse', Object.assign(st(fill, ex), { cx, cy, rx, ry }), p);
  const P = (p, d, fill, ex) => E('path', Object.assign(st(fill, ex), { d }), p);
  const L = (p, x1, y1, x2, y2, ex) => E('line', Object.assign(st('none', ex), { x1, y1, x2, y2 }), p);
  const NOS = { stroke: 'none' };
  // white highlight stroke (small glossy dash)
  const HL = (p, d, w) => P(p, d, 'none', { stroke: C.white, 'stroke-width': w || 6 });
  // flat ground shadow
  const GS = (p, cx, cy, rx, ry) => El(p, cx, cy, rx, ry, INK, { stroke: 'none', opacity: 0.13 });
  // card with a flat offset shadow
  function card(p, x, y, w, h, r, fill, ex) {
    R(p, x + 7, y + 9, w, h, r, INK, { stroke: 'none', opacity: 0.16 });
    return R(p, x, y, w, h, r, fill, ex);
  }
  // outlined fat line: ink under, colour on top
  function fat(p, d, color, w) {
    P(p, d, 'none', { 'stroke-width': w + SW * 2 });
    return P(p, d, 'none', { stroke: color, 'stroke-width': w });
  }
  function T(p, x, y, str, o) {
    o = Object.assign({ size: 40, weight: 800, fill: INK, anchor: 'middle', serif: false, outline: 0, oc: INK, id: null }, o || {});
    const a = {
      x, y, id: o.id, 'font-family': o.serif ? SERIF : FONT, 'font-weight': o.serif ? 400 : o.weight, 'font-size': o.size,
      fill: o.fill, 'text-anchor': o.anchor, 'dominant-baseline': 'central'
    };
    if (o.outline) { a.stroke = o.oc; a['stroke-width'] = o.outline; a['stroke-linejoin'] = 'round'; a['paint-order'] = 'stroke fill'; }
    if (o.fit) { a.textLength = o.fit; a.lengthAdjust = 'spacingAndGlyphs'; }
    if (o.tnum) a.style = 'font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1';
    const t = E('text', a, p);
    t.textContent = str;
    return t;
  }
  // rough advance width for Inter Tight heavy weights (used only for caret placement / auto-fit)
  function textW(str, size) {
    let w = 0;
    for (const ch of str) {
      if (ch === ' ') w += 0.24;
      else if ('MWmw@'.includes(ch)) w += 0.86;
      else if ('il.,:;!|\'¡'.includes(ch)) w += 0.27;
      else if ('ftrjI'.includes(ch)) w += 0.36;
      else if (ch >= 'A' && ch <= 'Z') w += 0.68;
      else if (ch >= '0' && ch <= '9') w += 0.6;
      else w += 0.56;
    }
    return w * size;
  }

  // ---------------------------------------------------------------- determinism helpers
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  let clipN = 0;

  function fixOrigin(g) {
    let b = { x: 0, y: 0 };
    try { b = g.getBBox(); } catch (e) { /* not rendered */ }
    gsap.set(g, { transformOrigin: (-b.x) + 'px ' + (-b.y) + 'px' });
  }

  // ---------------------------------------------------------------- prop context
  function mk(parent, opts, def) {
    const o = Object.assign({ x: 0, y: 0, scale: 1 }, def || {}, opts || {});
    if (!o.id) throw new Error('Props: opts.id is required');
    if (String(o.id).indexOf("'") >= 0) throw new Error('Props: no apostrophes in ids');
    const id = o.id;
    const root = E('g', { id, transform: `translate(${o.x} ${o.y}) scale(${o.scale})` }, parent);
    const c = { o, id, root, pend: [], r: rng(hash(String(id))) };
    c.pv = (p, px, py, name, extra) => {
      const w = E('g', { transform: `translate(${px} ${py})` + (extra || '') }, p);
      const g = E('g', { id: id + '-' + name }, w);
      c.pend.push(g);
      return g;
    };
    c.g = (p, name, a) => E('g', Object.assign({ id: name ? id + '-' + name : null }, a || {}), p);
    c.clip = (p, shapeFn) => {
      const cid = id + '-clip' + (clipN++);
      const cp = E('clipPath', { id: cid }, p);
      shapeFn(cp);
      return 'url(#' + cid + ')';
    };
    c.fix = () => { c.pend.forEach(fixOrigin); c.pend = []; };
    c.pop = c.pv(root, 0, 0, 'pop');
    c.body = c.pv(c.pop, 0, 0, 'body');
    return c;
  }
  function finish(c, api, o) {
    o = o || {};
    const rot = o.popRot === undefined ? -6 : o.popRot;
    api.root = c.root; api.id = c.id; api.body = c.body; api.popGroup = c.pop;
    if (!api.pop) api.pop = function (tl, t, d) {
      d = d || 0.55;
      gsap.set(c.pop, { scale: 0, rotation: rot });
      tl.fromTo(c.pop, { scale: 0, rotation: rot }, { scale: 1, rotation: 0, duration: d, ease: 'back.out(2.2)', immediateRender: false }, t);
      return api;
    };
    if (!api.out) api.out = function (tl, t, d) {
      d = d || 0.3;
      tl.fromTo(c.pop, { scale: 1, rotation: 0 }, { scale: 0, rotation: -rot, duration: d, ease: 'back.in(1.8)', immediateRender: false }, t);
      return api;
    };
    // squash & stretch bump on the body pivot
    if (!api.bounce) api.bounce = function (tl, t) {
      tl.fromTo(c.body, { scaleX: 1.12, scaleY: 0.86 }, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.1,0.45)', immediateRender: false }, t);
      return api;
    };
    c.fix();
    return api;
  }
  // a quick rotational shake on a pivot (used for buzz / anticipation)
  function shake(tl, node, t, amp, n, step) {
    let prev = 0;
    for (let i = 0; i <= n; i++) {
      const v = i === n ? 0 : (i % 2 ? 1 : -1) * amp * (1 - i / (n + 1));
      tl.fromTo(node, { rotation: prev }, { rotation: v, duration: step, ease: 'sine.inOut', immediateRender: false }, t + i * step);
      prev = v;
    }
  }
  // stroke "draw-on" setup: returns length; path hidden
  function prepDraw(path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len + ' ' + (len + 40), strokeDashoffset: len + 14 });
    return len;
  }
  function draw(tl, path, len, t, d, ease) {
    tl.fromTo(path, { strokeDashoffset: len + 14 }, { strokeDashoffset: 0, duration: d, ease: ease || 'power1.inOut', immediateRender: false }, t);
  }

  // ---------------------------------------------------------------- shared drawings
  function appWindow(p, x, y, w, h, bar, rows) {
    const g = E('g', {}, p);
    R(g, x + 5, y + 6, w, h, 10, INK, { stroke: 'none', opacity: 0.25 });
    R(g, x, y, w, h, 10, C.white, { 'stroke-width': 4.5 });
    const bh = Math.max(16, h * 0.2);
    P(g, `M${x},${y + bh} V${y + 10} Q${x},${y} ${x + 10},${y} H${x + w - 10} Q${x + w},${y} ${x + w},${y + 10} V${y + bh} Z`, bar, { 'stroke-width': 4.5 });
    for (let i = 0; i < 3; i++) Ci(g, x + 12 + i * 12, y + bh / 2, 3.4, C.white, { 'stroke-width': 2.5 });
    const n = rows || 3;
    for (let i = 0; i < n; i++) {
      const ry = y + bh + 10 + i * ((h - bh - 16) / n);
      R(g, x + 10, ry, (w - 20) * [0.85, 0.6, 0.72, 0.5][i % 4], Math.max(5, (h - bh) / (n * 2.6)), 3, i === 0 ? bar : C.lblue, NOS);
    }
    return g;
  }
  function billArt(p) {
    R(p, -70, -35, 140, 70, 9, C.green);
    R(p, -58, -24, 116, 48, 6, 'none', { stroke: C.cream, 'stroke-width': 3, opacity: 0.85 });
    Ci(p, 0, 0, 19, C.cream, { 'stroke-width': 3.5 });
    T(p, 0, 1, '$', { size: 27, weight: 900, fill: C.green });
    [[-46, -14], [46, 14]].forEach(([x, y]) => Ci(p, x, y, 4.5, C.cream, NOS));
    HL(p, 'M-60,-27 H-34', 4);
  }
  function heartD(s) {
    s = s || 1;
    const k = (v) => (v * s).toFixed(1);
    return `M0,${k(24)} C${k(-30)},${k(4)} ${k(-44)},${k(-10)} ${k(-44)},${k(-26)} C${k(-44)},${k(-44)} ${k(-27)},${k(-52)} ${k(-15)},${k(-52)} C${k(-6)},${k(-52)} ${k(-2)},${k(-46)} 0,${k(-40)} C${k(2)},${k(-46)} ${k(6)},${k(-52)} ${k(15)},${k(-52)} C${k(27)},${k(-52)} ${k(44)},${k(-44)} ${k(44)},${k(-26)} C${k(44)},${k(-10)} ${k(30)},${k(4)} 0,${k(24)} Z`;
  }
  function starD(ro, ri, n) {
    n = n || 5; let d = '';
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : ro, a = -Math.PI / 2 + i * Math.PI / n;
      d += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ',' + (r * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  function sparkD(r) {
    const k = r * 0.22;
    return `M0,${-r} C${k * 0.5},${-k} ${k},${-k * 0.5} ${r},0 C${k},${k * 0.5} ${k * 0.5},${k} 0,${r} C${-k * 0.5},${k} ${-k},${k * 0.5} ${-r},0 C${-k},${-k * 0.5} ${-k * 0.5},${-k} 0,${-r}Z`;
  }
  // generic friendly face inside a circle of radius 90 (scaled with s)
  function faceArt(c, p, s, eyesName) {
    const g = E('g', { transform: `scale(${s})` }, p);
    const clip = c.clip(g, (cp) => E('circle', { cx: 0, cy: 0, r: 88 }, cp));
    Ci(g, 0, 0, 90, C.lblue);
    const inner = E('g', { 'clip-path': clip }, g);
    // hair back
    P(inner, 'M-62,10 C-74,-40 -52,-82 0,-84 C52,-82 74,-40 62,10 C64,40 50,60 40,64 L-40,64 C-50,60 -64,40 -62,10 Z', INK);
    // shirt
    P(inner, 'M-80,100 C-76,62 -44,52 0,52 C44,52 76,62 80,100 Z', C.pink);
    P(inner, 'M-22,54 L0,74 L22,54', 'none', { 'stroke-width': 4.5 });
    // neck
    R(inner, -13, 26, 26, 30, 8, C.skin);
    // face
    El(inner, 0, -6, 44, 48, C.skin);
    Ci(inner, -44, -2, 9, C.skin); Ci(inner, 44, -2, 9, C.skin);
    El(inner, 0, -6, 44, 48, C.skin, { stroke: 'none' });
    P(inner, 'M-44,-6 C-44,-34 -24,-54 0,-54 C24,-54 44,-34 44,-6 C44,24 24,42 0,42 C-24,42 -44,24 -44,-6 Z', 'none');
    // bangs
    P(inner, 'M-48,-14 C-50,-52 -22,-66 2,-64 C30,-62 50,-46 48,-14 C38,-26 30,-34 22,-42 C12,-30 -6,-26 -22,-30 C-28,-24 -38,-18 -48,-14 Z', INK);
    // little yellow bow
    const bow = E('g', { transform: 'translate(28,-60) rotate(18) scale(1.5)' }, inner);
    P(bow, 'M0,0 C-10,-14 -26,-10 -22,2 C-20,10 -8,6 0,0 Z', C.yellow, { 'stroke-width': 4 });
    P(bow, 'M0,0 C10,-14 26,-10 22,2 C20,10 8,6 0,0 Z', C.yellow, { 'stroke-width': 4 });
    Ci(bow, 0, 0, 5, C.yellow, { 'stroke-width': 4 });
    // eyes (pivot for blink)
    const eyes = c.pv(inner, 0, -8, eyesName || 'eyes');
    [-17, 17].forEach((x) => { El(eyes, x, 0, 9, 11, C.white, { 'stroke-width': 4 }); Ci(eyes, x + 2, 2, 4.6, INK, NOS); Ci(eyes, x + 3.6, 0, 1.6, C.white, NOS); });
    P(inner, 'M-27,-24 Q-17,-30 -8,-25', 'none', { 'stroke-width': 4.5 });
    P(inner, 'M27,-24 Q17,-30 8,-25', 'none', { 'stroke-width': 4.5 });
    // nose, blush, smile
    P(inner, 'M0,0 Q-4,8 2,10', 'none', { 'stroke-width': 3.5 });
    El(inner, -27, 12, 8, 5, C.pink, { stroke: 'none', opacity: 0.75 });
    El(inner, 27, 12, 8, 5, C.pink, { stroke: 'none', opacity: 0.75 });
    P(inner, 'M-15,18 Q0,32 15,18 Q0,24 -15,18 Z', C.white, { 'stroke-width': 4 });
    Ci(g, 0, 0, 90, 'none', { 'stroke-width': SW / s });
    return { eyes };
  }

  const Props = { C, INK, SW, rng, hash };

  // ================================================================ 1. DESK + LAPTOP  (~700x420, anchor bottom-center)
  // parts: desk, laptop, screen, glowHalo, minis[] ; animators: windows(tl,t0,n,gap=.14), glow(tl,t,d=.9), pop, out, bounce
  Props.desk = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    GS(b, 0, 2, 340, 16);
    // legs + drawer unit
    R(b, -322, -206, 32, 204, 8, C.blue);
    R(b, 148, -206, 168, 204, 12, C.blue);
    L(b, 148, -104, 316, -104);
    R(b, 210, -164, 44, 13, 6.5, C.yellow, { 'stroke-width': 4 });
    R(b, 210, -62, 44, 13, 6.5, C.yellow, { 'stroke-width': 4 });
    HL(b, 'M162,-190 V-176', 5);
    // top
    R(b, -352, -238, 704, 38, 14, C.blue);
    HL(b, 'M-330,-226 H-200', 6); HL(b, 'M-180,-226 H-160', 6);
    // mug
    const mug = c.g(b, null, { transform: 'translate(262,-238)' });
    P(mug, 'M22,-52 C46,-52 46,-18 22,-18', 'none', { 'stroke-width': 7 });
    R(mug, -26, -66, 50, 66, 10, C.pink);
    HL(mug, 'M-16,-56 V-30', 5);
    P(mug, 'M-8,-80 C-16,-92 0,-98 -8,-110', 'none', { 'stroke-width': 4.5, opacity: 0.6 });
    P(mug, 'M8,-82 C0,-94 16,-100 8,-112', 'none', { 'stroke-width': 4.5, opacity: 0.6 });
    // laptop (anchor: base centre on the desk top)
    const lap = c.pv(b, -40, -238, 'laptop');
    const glow = c.pv(lap, 0, -128, 'glow');
    R(glow, -224, -134, 448, 252, 40, C.yellow, { stroke: 'none', opacity: 0.55 });
    [[-250, -60, -290, -80], [-250, 0, -296, 0], [250, -60, 290, -80], [250, 0, 296, 0], [-120, -150, -140, -190], [0, -156, 0, -200], [120, -150, 140, -190]]
      .forEach((q) => fat(glow, `M${q[0]},${q[1]} L${q[2]},${q[3]}`, C.yellow, 8));
    gsap.set(glow, { opacity: 0 });
    R(lap, -192, -246, 384, 232, 20, C.white);
    R(lap, -174, -228, 348, 196, 9, C.blue, { 'stroke-width': 4.5 });
    Ci(lap, 0, -237, 3, INK, NOS);
    const clip = c.clip(lap, (cp) => E('rect', { x: -172, y: -226, width: 344, height: 192, rx: 8 }, cp));
    const scr = c.g(lap, 'screen', { 'clip-path': clip });
    // static stacked windows
    appWindow(scr, -152, -208, 176, 112, C.pink, 3);
    appWindow(scr, -60, -168, 196, 120, C.yellow, 4);
    appWindow(scr, 54, -214, 104, 70, C.green, 2);
    // minis (hidden until windows())
    const spots = [[-110, -170], [70, -100], [-20, -80], [110, -180], [-120, -86], [10, -172], [96, -80], [-60, -130]];
    const bars = [C.pink, C.green, C.yellow, C.lblue, C.red, C.pink, C.green, C.yellow];
    const minis = spots.map((s, i) => {
      const m = c.pv(scr, s[0], s[1], 'mini' + i);
      appWindow(m, -54, -36, 108, 72, bars[i], 2);
      return m;
    });
    const flash = R(lap, -172, -226, 344, 192, 8, C.white, { stroke: 'none', id: c.id + '-flash', opacity: 0 });
    HL(lap, 'M-160,-214 L-130,-214', 5);
    // base
    P(lap, 'M-236,-18 H236 Q240,-18 238,-12 L226,0 H-226 L-238,-12 Q-240,-18 -236,-18 Z', C.white);
    R(lap, -36, -18, 72, 7, 3.5, C.lblue, { 'stroke-width': 3 });
    const api = { desk: b, laptop: lap, screen: scr, glowHalo: glow, flash, minis };
    finish(c, api);
    minis.forEach((m) => gsap.set(m, { scale: 0 }));
    api.windows = function (tl, t0, n, gap) {
      gap = gap || 0.14; n = Math.min(n || 4, minis.length);
      for (let i = 0; i < n; i++) {
        tl.fromTo(minis[i], { scale: 0, rotation: -10 }, { scale: 1, rotation: 0, duration: 0.32, ease: 'back.out(2.6)', immediateRender: false }, t0 + i * gap);
      }
      return api;
    };
    api.glow = function (tl, t, d) {
      d = d || 0.9;
      tl.fromTo(glow, { opacity: 0, scale: 0.86 }, { opacity: 0.95, scale: 1.05, duration: d * 0.3, ease: 'power2.out', immediateRender: false }, t);
      tl.fromTo(glow, { opacity: 0.95, scale: 1.05 }, { opacity: 0, scale: 1.1, duration: d * 0.7, ease: 'power1.in', immediateRender: false }, t + d * 0.3);
      tl.fromTo(flash, { opacity: 0 }, { opacity: 0.55, duration: 0.08, ease: 'none', immediateRender: false }, t);
      tl.fromTo(flash, { opacity: 0.55 }, { opacity: 0, duration: 0.3, ease: 'power1.out', immediateRender: false }, t + 0.08);
      tl.fromTo(lap, { scale: 1 }, { scale: 1.05, duration: 0.12, ease: 'power2.out', immediateRender: false }, t);
      tl.fromTo(lap, { scale: 1.05 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)', immediateRender: false }, t + 0.12);
      return api;
    };
    return api;
  };

  // ================================================================ 2. LINE CHART  (~420x300, anchor center)
  // parts: card, flatLine, growLine, tip, dots[] ; animators: flat(tl,t,d=.6), grow(tl,t,d=.9), pop, out, bounce
  Props.lineChart = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    card(b, -210, -150, 420, 300, 30, C.white);
    [-80, -26, 28].forEach((y) => L(b, -150, y, 172, y, { stroke: C.lblue, 'stroke-width': 3.5, 'stroke-dasharray': '12 12' }));
    P(b, 'M-162,-118 V102 H180', 'none', { 'stroke-width': 7 });
    [-100, -40, 20, 80, 140].forEach((x) => L(b, x, 102, x, 112, { 'stroke-width': 4 }));
    const flatLine = P(b, 'M-146,44 C-100,40 -70,48 -30,44 S60,40 100,46 S150,44 164,44', 'none', { stroke: C.red, 'stroke-width': 10, id: c.id + '-flat' });
    const pts = [[-146, 80], [-92, 48], [-44, 62], [14, 10], [72, -14], [136, -76]];
    const growLine = P(b, 'M' + pts.map((q) => q.join(',')).join(' L'), 'none', { stroke: C.green, 'stroke-width': 11, id: c.id + '-grow' });
    const dots = pts.slice(1, 5).map((q, i) => { const d = c.pv(b, q[0], q[1], 'dot' + i); Ci(d, 0, 0, 8, C.white, { 'stroke-width': 4.5 }); return d; });
    const last = pts[5], prev = pts[4];
    const ang = Math.atan2(last[1] - prev[1], last[0] - prev[0]) * 180 / Math.PI;
    const tip = c.pv(b, last[0], last[1], 'tip', ` rotate(${ang.toFixed(2)})`);
    P(tip, 'M-8,-24 L30,0 L-8,24 Z', C.green, { 'stroke-width': 5 });
    const api = { card: b, flatLine, growLine, tip, dots };
    finish(c, api);
    const lf = prepDraw(flatLine), lg = prepDraw(growLine);
    gsap.set(dots.concat([tip]), { scale: 0 });
    // cumulative fractions for dot timing
    const segs = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(tot); }
    api.flat = function (tl, t, d) { draw(tl, flatLine, lf, t, d || 0.6, 'power1.inOut'); return api; };
    api.grow = function (tl, t, d) {
      d = d || 0.9;
      draw(tl, growLine, lg, t, d, 'none');
      dots.forEach((dot, i) => tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.22, ease: 'back.out(3)', immediateRender: false }, t + d * segs[i] / tot - 0.04));
      tl.fromTo(tip, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, t + d - 0.06);
      return api;
    };
    return api;
  };

  // ================================================================ 3. PHONE  (~220x420, anchor center)
  // parts: screen, pills[] ; animators: notify(tl,t,text) (max 4 stacked; extra calls only buzz), buzz(tl,t), pop, out, bounce
  Props.phone = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    R(b, -118, -110, 12, 40, 5, C.blue, { 'stroke-width': 4 });
    R(b, -118, -54, 12, 40, 5, C.blue, { 'stroke-width': 4 });
    R(b, -110, -210, 220, 420, 38, C.blue, { 'stroke-width': 6 });
    R(b, -95, -194, 190, 372, 24, C.lblue, { 'stroke-width': 4.5 });
    const clip = c.clip(b, (cp) => E('rect', { x: -93, y: -192, width: 186, height: 368, rx: 22 }, cp));
    const scr = c.g(b, 'screen', { 'clip-path': clip });
    P(scr, 'M-100,40 L100,-60 L100,-20 L-100,80 Z', C.white, { stroke: 'none', opacity: 0.35 });
    P(scr, 'M-100,100 L100,0 L100,12 L-100,112 Z', C.white, { stroke: 'none', opacity: 0.35 });
    // app grid hint
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) R(scr, -70 + j * 38 - 2, 64 + i * 36, 26, 26, 8, [C.pink, C.yellow, C.white, C.green][(i + j) % 4], { 'stroke-width': 3, opacity: 0.9 });
    R(b, -32, -186, 64, 18, 9, INK, NOS);
    R(b, -30, 192, 60, 7, 3.5, C.white, NOS);
    HL(b, 'M-98,-170 V-120', 5);
    const pillLayer = c.g(scr, 'pills');
    // buzz marks
    const buzz = c.g(b, 'buzzmarks', { opacity: 0 });
    [-1, 1].forEach((s) => {
      P(buzz, `M${s * 132},-40 Q${s * 146},-20 ${s * 132},0`, 'none', { 'stroke-width': 5 });
      P(buzz, `M${s * 150},-56 Q${s * 170},-20 ${s * 150},16`, 'none', { 'stroke-width': 5 });
    });
    const api = { screen: scr, pills: [], buzzMarks: buzz };
    finish(c, api);
    gsap.set(buzz, { opacity: 0 });
    const icons = [C.pink, C.green, C.yellow, C.blue];
    api.buzz = function (tl, t) {
      shake(tl, b, t, 7, 6, 0.045);
      tl.fromTo(buzz, { opacity: 0 }, { opacity: 1, duration: 0.05, immediateRender: false }, t);
      tl.fromTo(buzz, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, t + 0.25);
      return api;
    };
    api.notify = function (tl, t, text) {
      const k = api.pills.length;
      if (k < 4) {
        const pill = c.pv(pillLayer, 0, -150 + k * 62, 'pill' + k);
        R(pill, -86, -27, 172, 54, 18, C.white, { 'stroke-width': 4 });
        R(pill, -76, -16, 32, 32, 9, icons[k], { 'stroke-width': 3.5 });
        Ci(pill, -60, 0, 5, C.white, NOS);
        const avail = 112, size = 19;
        const tw = textW(String(text || ''), size);
        T(pill, -36, 1, String(text || ''), { size, weight: 700, anchor: 'start', fit: tw > avail ? avail : null });
        c.fix();
        gsap.set(pill, { scale: 0 });
        tl.fromTo(pill, { scale: 0, y: -24 }, { scale: 1, y: 0, duration: 0.34, ease: 'back.out(2.4)', immediateRender: false }, t);
        api.pills.push(pill);
      }
      api.buzz(tl, t);
      return api;
    };
    return api;
  };

  // ================================================================ 4. WALL CLOCK  (~220, anchor center)
  // opts.time='10:10'; parts: hourHand, minuteHand, secondHand ; animators: setTime(tl,t,'12:00',d=.9) (always forward), tick(tl,t0,t1,step=.25,deg=30), pop, out, bounce
  Props.wallClock = function (parent, opts) {
    const c = mk(parent, opts, { time: '10:10' }), b = c.body;
    Ci(b, 0, 0, 110, C.pink, { 'stroke-width': 6 });
    Ci(b, 0, 0, 86, C.white);
    HL(b, 'M-86,-48 A100,100 0 0 1 -48,-86', 6);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, big = i % 3 === 0;
      const r1 = big ? 60 : 68, r2 = 76;
      L(b, Math.sin(a) * r1, -Math.cos(a) * r1, Math.sin(a) * r2, -Math.cos(a) * r2, { 'stroke-width': big ? 7 : 4.5 });
    }
    const hour = c.pv(b, 0, 0, 'hour'); R(hour, -6.5, -48, 13, 60, 6.5, INK, NOS);
    const minute = c.pv(b, 0, 0, 'minute'); R(minute, -4.5, -72, 9, 84, 4.5, INK, NOS);
    const sec = c.pv(b, 0, 0, 'second'); L(sec, 0, 16, 0, -74, { stroke: C.red, 'stroke-width': 4 }); Ci(sec, 0, 16, 5, C.red, NOS);
    Ci(b, 0, 0, 10, C.yellow, { 'stroke-width': 4 });
    const api = { hourHand: hour, minuteHand: minute, secondHand: sec };
    finish(c, api);
    const parse = (s) => { const m = String(s).split(':'); return ((+m[0]) % 12) * 60 + (+m[1] || 0); };
    let cur = parse(c.o.time), hr = cur * 0.5, mr = (cur % 60) * 6, sr = 0;
    gsap.set(hour, { rotation: hr }); gsap.set(minute, { rotation: mr });
    api.setTime = function (tl, t, s, d) {
      d = d || 0.9;
      const tgt = parse(s); const delta = (((tgt - cur) % 720) + 720) % 720;
      if (!delta) return api;
      tl.fromTo(minute, { rotation: mr }, { rotation: mr + delta * 6, duration: d, ease: 'power3.inOut', immediateRender: false }, t);
      tl.fromTo(hour, { rotation: hr }, { rotation: hr + delta * 0.5, duration: d, ease: 'power3.inOut', immediateRender: false }, t);
      shake(tl, b, t + d - 0.05, 6, 4, 0.06);
      mr += delta * 6; hr += delta * 0.5; cur = tgt;
      return api;
    };
    api.tick = function (tl, t0, t1, step, deg) {
      step = step || 0.25; deg = deg || 30;
      for (let t = t0; t < t1 - 1e-6; t += step) {
        tl.fromTo(sec, { rotation: sr }, { rotation: sr + deg, duration: Math.min(0.12, step * 0.8), ease: 'back.out(3)', immediateRender: false }, t);
        sr += deg;
      }
      return api;
    };
    return api;
  };

  // ================================================================ 5. MOON + STARS  (~1080x500 band, anchor center)
  // opts.sky=true (blue band with clouds); parts: moon, stars[] ; animators: twinkle(tl,t0,t1,period=.7), pop, out
  Props.moonStars = function (parent, opts) {
    const c = mk(parent, opts, { sky: true }), b = c.body;
    if (c.o.sky) {
      R(b, -540, -250, 1080, 500, 46, C.blue, { 'stroke-width': 6 });
      const clip = c.clip(b, (cp) => E('rect', { x: -537, y: -247, width: 1074, height: 494, rx: 43 }, cp));
      const cl = E('g', { 'clip-path': clip }, b);
      for (let i = 0; i < 12; i++) Ci(cl, -560 + i * 100, 262 - (i % 2) * 18, 70 + (i % 3) * 8, C.lblue);
      R(cl, -560, 250, 1120, 40, 0, C.lblue, NOS);
      const r = rng(hash(c.id + 'dots'));
      for (let i = 0; i < 22; i++) Ci(cl, -520 + r() * 1040, -230 + r() * 360, 2.5 + r() * 2.5, C.white, { stroke: 'none', opacity: 0.8 });
    }
    // crescent moon
    const moon = c.pv(b, 270, -40, 'moon');
    const Rm = 112, d = 62, rc = 88, th = -0.6; // cut circle offset towards upper right
    const xi = (d * d + Rm * Rm - rc * rc) / (2 * d), yi = Math.sqrt(Rm * Rm - xi * xi);
    const large2 = xi > d ? 0 : 1;
    const g = E('g', { transform: `rotate(${(th * 180 / Math.PI).toFixed(1)})` }, moon);
    P(g, `M${xi.toFixed(1)},${(-yi).toFixed(1)} A${Rm},${Rm} 0 1 0 ${xi.toFixed(1)},${yi.toFixed(1)} A${rc},${rc} 0 ${large2} 1 ${xi.toFixed(1)},${(-yi).toFixed(1)} Z`, C.yellow, { 'stroke-width': 6 });
    HL(g, 'M-100,-20 A102,102 0 0 0 -84,50', 6);
    // sleepy face, upright, in the thick part of the crescent
    P(moon, 'M-84,22 Q-72,34 -60,22', 'none', { 'stroke-width': 5 });
    El(moon, -84, 46, 9, 5.5, C.pink, { stroke: 'none', opacity: 0.9 });
    P(moon, 'M-62,52 Q-52,60 -42,50', 'none', { 'stroke-width': 4.5 });
    const spots = [[-440, -150, 30, 0], [-300, -40, 20, 1], [-180, -170, 26, 0], [-60, -80, 18, 1], [-390, 70, 22, 1], [-130, 50, 30, 0], [40, -175, 22, 1], [80, 70, 18, 0], [440, -170, 22, 1], [470, 40, 17, 0], [-10, -10, 13, 1]];
    const stars = spots.map((s, i) => {
      const st_ = c.pv(b, s[0], s[1], 'star' + i);
      if (s[3]) P(st_, sparkD(s[2] * 1.2), C.white, { 'stroke-width': 4.5 });
      else P(st_, starD(s[2], s[2] * 0.48), C.yellow, { 'stroke-width': 5 });
      return st_;
    });
    const api = { moon, stars };
    finish(c, api, { popRot: 0 });
    api.twinkle = function (tl, t0, t1, period) {
      period = period || 0.7;
      stars.forEach((s, i) => {
        let t = t0 + ((i * 0.23) % 1) * period * 0.5;
        const half = period / 2;
        while (t + period <= t1 + 1e-6) {
          tl.fromTo(s, { scale: 1, rotation: 0 }, { scale: 0.5, rotation: 25, duration: half, ease: 'sine.inOut', immediateRender: false }, t);
          tl.fromTo(s, { scale: 0.5, rotation: 25 }, { scale: 1, rotation: 0, duration: half, ease: 'sine.inOut', immediateRender: false }, t + half);
          t += period + ((i % 3) * 0.05);
        }
      });
      // moon bob
      let t = t0; const p = 1.2;
      while (t + p <= t1 + 1e-6) {
        tl.fromTo(moon, { y: 0, rotation: 0 }, { y: -12, rotation: -4, duration: p / 2, ease: 'sine.inOut', immediateRender: false }, t);
        tl.fromTo(moon, { y: -12, rotation: -4 }, { y: 0, rotation: 0, duration: p / 2, ease: 'sine.inOut', immediateRender: false }, t + p / 2);
        t += p;
      }
      return api;
    };
    return api;
  };

  // ================================================================ 6. CHAT BUBBLES  (~800x900 area, anchor center)
  // parts: pile, badge, bubbles[] ; animators: stack(tl,t0,t1,n,text='¿precio?') (builds n bubbles + "×n" badge), pop, out
  function bubbleD(w, h, r, side) {
    const x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2, s = side < 0 ? -1 : 1;
    const tA = s * (w * 0.22), tB = s * (w * 0.36), tTip = s * (w * 0.44);
    if (s > 0) return `M${x0 + r},${y0} H${x1 - r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${y1 - r} A${r},${r} 0 0 1 ${x1 - r},${y1} H${tB} L${tTip},${y1 + 30} L${tA},${y1} H${x0 + r} A${r},${r} 0 0 1 ${x0},${y1 - r} V${y0 + r} A${r},${r} 0 0 1 ${x0 + r},${y0} Z`;
    return `M${x0 + r},${y0} H${x1 - r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${y1 - r} A${r},${r} 0 0 1 ${x1 - r},${y1} H${tA} L${tTip},${y1 + 30} L${tB},${y1} H${x0 + r} A${r},${r} 0 0 1 ${x0},${y1 - r} V${y0 + r} A${r},${r} 0 0 1 ${x0 + r},${y0} Z`;
  }
  Props.chatBubbles = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    const pile = c.g(b, 'pile');
    const badge = c.pv(b, 290, -380, 'badge');
    Ci(badge, 4, 6, 66, INK, { stroke: 'none', opacity: 0.18 });
    Ci(badge, 0, 0, 66, C.red, { 'stroke-width': 6 });
    HL(badge, 'M-40,-30 A50,50 0 0 1 -18,-50', 6);
    const nums = c.g(badge, 'nums');
    const api = { pile, badge, bubbles: [] };
    finish(c, api, { popRot: 0 });
    gsap.set(badge, { scale: 0 });
    api.stack = function (tl, t0, t1, n, text) {
      text = text === undefined ? '¿precio?' : text; n = Math.max(1, n || 5);
      const sp = Math.min(84, 700 / Math.max(n - 1, 1));
      const size = 46, w = Math.max(240, textW(text, size) + 90);
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? 1 : -1;
        const x = side * (70 + c.r() * 120), y = 380 - 60 - i * sp, rot = (c.r() - 0.5) * 16;
        const bb = c.pv(pile, x, y, 'b' + i, ` rotate(${rot.toFixed(1)})`);
        P(bb, bubbleD(w, 110, 44, side), INK, { stroke: 'none', opacity: 0.16, transform: 'translate(7,9)' });
        P(bb, bubbleD(w, 110, 44, side), i % 3 === 2 ? C.lblue : C.white, { 'stroke-width': 5.5 });
        T(bb, 0, 2, text, { size, weight: 800 });
        HL(bb, `M${-w / 2 + 20},-36 H${-w / 2 + 44}`, 5);
        api.bubbles.push(bb);
      }
      c.fix();
      // park the counter badge just above/right of the top of the pile
      const top = api.bubbles[api.bubbles.length - 1];
      const tw_ = top.parentNode.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
      const bx = Math.min(330, Math.max(-330, +tw_[1] + (+tw_[1] > 0 ? -1 : 1) * 40 + w / 2 * (+tw_[1] > 0 ? 1 : 0.4)));
      badge.parentNode.setAttribute('transform', `translate(${bx.toFixed(1)} ${(+tw_[2] - 110).toFixed(1)})`);
      const times = [];
      for (let i = 0; i < n; i++) times.push(n === 1 ? t0 : t0 + (t1 - t0) * i / (n - 1));
      api.bubbles.slice(-n).forEach((bb, i) => {
        gsap.set(bb, { scale: 0 });
        tl.fromTo(bb, { scale: 0, y: 30 }, { scale: 1, y: 0, duration: 0.34, ease: 'back.out(2.6)', immediateRender: false }, times[i]);
      });
      // counter texts: one <text> per value, swapped with tl.set
      const labels = [];
      for (let k = 1; k <= n; k++) {
        const lab = T(nums, 0, 3, '×' + k, { size: k > 9 ? 50 : 60, weight: 900, fill: C.white, id: c.id + '-n' + k });
        gsap.set(lab, { visibility: 'hidden' });
        labels.push(lab);
      }
      tl.fromTo(badge, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.6)', immediateRender: false }, times[0]);
      labels.forEach((lab, k) => {
        tl.set(lab, { visibility: 'visible' }, S(times[k]));
        if (k < n - 1) tl.set(lab, { visibility: 'hidden' }, S(times[k + 1]));
        if (k > 0) tl.fromTo(badge, { scale: 1.3 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, times[k]);
      });
      return api;
    };
    return api;
  };

  // ================================================================ 7. INVOICE WITH WINGS  (~260x330, anchor center)
  // parts: flyer (moves), paper, wingL, wingR, stamp ; animators: fly(tl,t0,t1,path=[[0,0],[140,-90],[300,-40],[460,-170]]), flap(tl,t0,t1), stamp(tl,t), pop, out, bounce
  Props.invoice = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    const flyer = c.pv(b, 0, 0, 'fly');
    const wingD = 'M0,-4 C-26,-56 -96,-82 -150,-58 C-166,-50 -164,-32 -148,-28 C-166,-20 -162,0 -144,0 C-156,12 -146,30 -128,26 C-130,40 -112,46 -100,36 C-66,40 -30,28 0,16 Z';
    const wingL = c.pv(flyer, -96, -54, 'wingL');
    P(wingL, wingD, C.white);
    P(wingL, 'M-24,0 C-60,-14 -100,-22 -136,-26 M-26,12 C-60,8 -96,4 -126,4', 'none', { 'stroke-width': 4 });
    const wingR = c.pv(flyer, 96, -54, 'wingR');
    const wr = E('g', { transform: 'scale(-1,1)' }, wingR);
    P(wr, wingD, C.white);
    P(wr, 'M-24,0 C-60,-14 -100,-22 -136,-26 M-26,12 C-60,8 -96,4 -126,4', 'none', { 'stroke-width': 4 });
    const paper = c.g(flyer, 'paper');
    P(paper, 'M-103,-141 H77 L117,-101 V159 H-103 Z', INK, { stroke: 'none', opacity: 0.16 });
    P(paper, 'M-110,-150 H70 L110,-110 V150 H-110 Z', C.white);
    P(paper, 'M70,-150 V-110 H110', C.cream, { 'stroke-width': 5 });
    T(paper, -14, -98, 'FACTURA', { size: 34, weight: 900 });
    R(paper, -80, -62, 160, 10, 5, C.lblue, NOS);
    R(paper, -80, -38, 118, 10, 5, C.lblue, NOS);
    R(paper, -80, -14, 140, 10, 5, C.lblue, NOS);
    L(paper, -80, 14, 80, 14, { 'stroke-width': 3.5 });
    T(paper, -80, 38, 'TOTAL', { size: 22, weight: 800, anchor: 'start' });
    T(paper, 82, 38, '$250', { size: 26, weight: 900, anchor: 'end' });
    const stamp = c.pv(paper, 0, 98, 'stamp', ' rotate(-13)');
    R(stamp, -96, -30, 192, 60, 12, C.white, { stroke: C.red, 'stroke-width': 6 });
    R(stamp, -88, -22, 176, 44, 8, 'none', { stroke: C.red, 'stroke-width': 2.5 });
    T(stamp, 0, 2, 'PENDIENTE', { size: 30, weight: 900, fill: C.red });
    const api = { flyer, paper, wingL, wingR, stamp };
    finish(c, api);
    gsap.set(wingL, { rotation: 8 }); gsap.set(wingR, { rotation: -8 });
    let fx = 0, fy = 0;
    api.flap = function (tl, t0, t1, period) {
      period = period || 0.18;
      for (let t = t0; t + period <= t1 + 1e-6; t += period) {
        tl.fromTo(wingL, { rotation: 8, scaleY: 1 }, { rotation: -30, scaleY: 0.8, duration: period / 2, ease: 'sine.inOut', immediateRender: false }, t);
        tl.fromTo(wingL, { rotation: -30, scaleY: 0.8 }, { rotation: 8, scaleY: 1, duration: period / 2, ease: 'sine.inOut', immediateRender: false }, t + period / 2);
        tl.fromTo(wingR, { rotation: -8, scaleY: 1 }, { rotation: 30, scaleY: 0.8, duration: period / 2, ease: 'sine.inOut', immediateRender: false }, t);
        tl.fromTo(wingR, { rotation: 30, scaleY: 0.8 }, { rotation: -8, scaleY: 1, duration: period / 2, ease: 'sine.inOut', immediateRender: false }, t + period / 2);
      }
      return api;
    };
    api.fly = function (tl, t0, t1, path) {
      path = path || [[0, 0], [140, -90], [300, -40], [460, -170]];
      const pts = path.map((q) => [fx + q[0], fy + q[1]]);
      if (pts[0][0] !== fx || pts[0][1] !== fy) pts.unshift([fx, fy]);
      let tot = 0; const lens = [];
      for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(l); tot += l; }
      let t = t0, prevRot = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = (t1 - t0) * (tot ? lens[i - 1] / tot : 1 / lens.length);
        const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
        const rot = Math.max(-18, Math.min(18, Math.atan2(dy, Math.abs(dx) + 1) * 180 / Math.PI * 0.4)) * (dx < 0 ? -1 : 1);
        tl.fromTo(flyer, { x: pts[i - 1][0], y: pts[i - 1][1] }, { x: pts[i][0], y: pts[i][1], duration: d, ease: 'sine.inOut', immediateRender: false }, t);
        tl.fromTo(flyer, { rotation: prevRot }, { rotation: rot, duration: Math.min(0.25, d), ease: 'sine.inOut', immediateRender: false }, t);
        prevRot = rot; t += d;
      }
      tl.fromTo(flyer, { rotation: prevRot }, { rotation: 0, duration: 0.25, ease: 'sine.out', immediateRender: false }, t1);
      api.flap(tl, t0, t1 + 0.18);
      fx = pts[pts.length - 1][0]; fy = pts[pts.length - 1][1];
      return api;
    };
    api.stamp = function (tl, t) {
      tl.fromTo(stamp, { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: 'power3.in', immediateRender: false }, t);
      shake(tl, b, t + 0.2, 4, 3, 0.05);
      return api;
    };
    return api;
  };

  // ================================================================ 8. FOLDERS + MAGNIFIER  (~500x400, anchor bottom-center)
  // opts.magnifier=true ; parts: pile, papers[], magnifier (sub-api with search) ; animators: burst(tl,t,d=.9), search(tl,t0,t1), pop, out, bounce
  function buildMagnifier(c, p, px, py) {
    const mag = c.pv(p, px, py, 'mag');
    const h = c.pv(mag, 0, 0, 'magRot');
    fat(h, 'M44,44 L104,104', C.blue, 20);
    HL(h, 'M56,60 L66,70', 4);
    Ci(h, 0, 0, 62, C.lblue, { 'stroke-width': 9 });
    Ci(h, 0, 0, 62, 'none', { stroke: C.white, 'stroke-width': 4, opacity: 0.0 });
    P(h, 'M-38,-14 A40,40 0 0 1 -14,-38', 'none', { stroke: C.white, 'stroke-width': 9 });
    Ci(h, 22, 22, 6, C.white, NOS);
    return { mag, rot: h };
  }
  function magSearch(tl, mag, rot, t0, t1, way, seg) {
    way = way || [[0, 0], [-170, 40], [-60, 90], [-230, -10], [-90, -30]];
    seg = seg || 0.34;
    let i = 0, t = t0;
    while (t + seg <= t1 + 1e-6) {
      const a = way[i % way.length], z = way[(i + 1) % way.length];
      tl.fromTo(mag, { x: a[0], y: a[1] }, { x: z[0], y: z[1], duration: seg, ease: 'sine.inOut', immediateRender: false }, t);
      tl.fromTo(rot, { rotation: (i % 2 ? 12 : -12) }, { rotation: (i % 2 ? -12 : 12), duration: seg, ease: 'sine.inOut', immediateRender: false }, t);
      i++; t += seg;
    }
    const last = way[i % way.length];
    tl.fromTo(mag, { x: last[0], y: last[1] }, { x: 0, y: 0, duration: 0.3, ease: 'power2.out', immediateRender: false }, t);
    tl.fromTo(rot, { rotation: (i % 2 ? 12 : -12) }, { rotation: 0, duration: 0.3, ease: 'power2.out', immediateRender: false }, t);
  }
  Props.folders = function (parent, opts) {
    const c = mk(parent, opts, { magnifier: true }), b = c.body;
    GS(b, 0, 2, 270, 16);
    const papers = [];
    const flying = c.g(b, 'papers');
    for (let i = 0; i < 6; i++) {
      const pp = c.pv(flying, -90 + i * 36, -262 + (i % 2) * 8, 'paper' + i, ` rotate(${(-12 + i * 5)})`);
      R(pp, -44, -56, 88, 112, 8, C.white, { 'stroke-width': 4.5 });
      for (let k = 0; k < 4; k++) R(pp, -30, -36 + k * 18, k === 0 ? 40 : 58 - k * 6, 6, 3, k === 0 ? C.pink : C.lblue, NOS);
      papers.push(pp);
    }
    const pile = c.g(b, 'pile');
    const cols = [C.lblue, C.yellow, C.pink, C.yellow];
    const rots = [2, -3, 3, -2], xs = [0, -14, 10, -6];
    for (let i = 0; i < 4; i++) {
      const f = E('g', { transform: `translate(${xs[i]},${-38 - i * 64}) rotate(${rots[i]})` }, pile);
      R(f, -186, -50, 112, 30, 9, cols[i]);
      R(f, -178, -44, 350, 30, 4, C.white, { 'stroke-width': 4.5 });
      R(f, -200, -33, 400, 68, 11, cols[i]);
      R(f, -36, -12, 72, 26, 5, C.white, { 'stroke-width': 4 });
      L(f, -24, 1, 22, 1, { 'stroke-width': 3.5 });
      HL(f, 'M-186,-20 H-140', 5);
    }
    const api = { pile, papers };
    if (c.o.magnifier) { const m = buildMagnifier(c, b, 170, -330); api.magnifier = m.mag; api.magnifierRot = m.rot; }
    finish(c, api);
    api.burst = function (tl, t, d) {
      d = d || 0.9;
      tl.fromTo(b, { scaleX: 1.08, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.1,0.4)', immediateRender: false }, t);
      papers.forEach((pp, i) => {
        const side = i % 2 ? 1 : -1, r = rng(hash(c.id + 'p' + i));
        const dx = side * (190 + r() * 160) - (-90 + i * 36) * 0.3, peak = -(170 + r() * 170), land = 230 + r() * 20, spin = side * (160 + r() * 260);
        const ti = t + i * 0.045;
        tl.fromTo(pp, { x: 0 }, { x: dx, duration: d, ease: 'power1.out', immediateRender: false }, ti);
        tl.fromTo(pp, { y: 0 }, { y: peak, duration: d * 0.42, ease: 'power2.out', immediateRender: false }, ti);
        tl.fromTo(pp, { y: peak }, { y: land, duration: d * 0.58, ease: 'power2.in', immediateRender: false }, ti + d * 0.42);
        tl.fromTo(pp, { rotation: 0 }, { rotation: spin, duration: d, ease: 'power1.out', immediateRender: false }, ti);
      });
      return api;
    };
    api.search = function (tl, t0, t1) { if (api.magnifier) magSearch(tl, api.magnifier, api.magnifierRot, t0, t1); return api; };
    return api;
  };
  // standalone magnifier (~180x180, anchor = lens centre)
  Props.magnifier = function (parent, opts) {
    const c = mk(parent, opts), m = buildMagnifier(c, c.body, 0, 0);
    const api = { magnifier: m.mag, lens: m.rot };
    finish(c, api);
    api.search = function (tl, t0, t1, way, seg) { magSearch(tl, m.mag, m.rot, t0, t1, way, seg); return api; };
    return api;
  };

  // ================================================================ 9. BATTERY  (~240x120, anchor center)
  // parts: level (scaleX pivot at left), bar, labels{} ; animators: drain(tl,t0,t1,blinks=4), pop, out, bounce
  Props.battery = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    R(b, 96, -26, 26, 52, 9, INK, NOS);
    R(b, -114, -60, 216, 120, 24, C.white, { 'stroke-width': 6.5 });
    const level = c.pv(b, -98, 0, 'level');
    const bar = R(level, 0, -44, 184, 88, 13, C.green, { stroke: 'none', id: c.id + '-bar' });
    HL(level, 'M14,-30 H70', 7);
    const vals = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5, 1];
    const labels = {};
    vals.forEach((v) => {
      labels[v] = T(b, -6, 3, v + '%', { size: 44, weight: 900, fill: INK, outline: 9, oc: C.white, id: c.id + '-pct' + v });
    });
    const api = { level, bar, labels };
    finish(c, api);
    vals.forEach((v) => gsap.set(labels[v], { visibility: v === 100 ? 'visible' : 'hidden' }));
    api.drain = function (tl, t0, t1, blinks) {
      blinks = blinks === undefined ? 4 : blinks;
      const D = t1 - t0, minS = 0.07;
      tl.fromTo(level, { scaleX: 1 }, { scaleX: minS, duration: D, ease: 'none', immediateRender: false }, t0);
      const at = (frac) => t0 + D * (1 - frac) / (1 - minS); // time when level == frac
      tl.set(bar, { fill: C.yellow }, S(at(0.5)));
      tl.set(bar, { fill: C.red }, S(at(0.2)));
      for (let i = 1; i < vals.length; i++) {
        const tv = t0 + D * (100 - vals[i]) / 99;
        tl.set(labels[vals[i - 1]], { visibility: 'hidden' }, S(tv));
        tl.set(labels[vals[i]], { visibility: 'visible' }, S(tv));
      }
      for (let k = 0; k < blinks; k++) {
        tl.set([bar, labels[1]], { opacity: 0.15 }, S(t1 + 0.1 + k * 0.24));
        tl.set([bar, labels[1]], { opacity: 1 }, S(t1 + 0.22 + k * 0.24));
      }
      if (blinks) shake(tl, b, t1, 5, 4, 0.05);
      return api;
    };
    return api;
  };

  // ================================================================ 10. PLANT  (~200x300, anchor bottom-center)
  // parts: stemLow, stemHigh, leaves[] ; animators: wilt(tl,t,d=.9), pop, out, bounce
  Props.plant = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    GS(b, 0, 2, 92, 10);
    El(b, 0, -132, 68, 13, INK, NOS);
    const leafD = 'M0,0 C16,-30 66,-40 92,-10 C68,14 22,18 0,0 Z';
    const leaf = (p, x, y, name, left, sc) => {
      const lv = c.pv(p, x, y, name);
      const g = E('g', { transform: `${left ? 'scale(-1,1) ' : ''}rotate(-18) scale(${sc || 1})` }, lv);
      P(g, leafD, C.green, { 'stroke-width': 5 });
      P(g, 'M6,-2 C30,-10 54,-12 78,-10', 'none', { 'stroke-width': 3.5 });
      HL(g, 'M30,-22 C40,-26 50,-27 58,-26', 4);
      return lv;
    };
    const s1 = c.pv(b, 0, -134, 'stemLow');
    fat(s1, 'M0,6 L0,-88', C.green, 9);
    const s2 = c.pv(s1, 0, -86, 'stemHigh');
    fat(s2, 'M0,4 L0,-78', C.green, 9);
    const leaves = [leaf(s1, 0, -26, 'leaf0', true), leaf(s1, 0, -62, 'leaf1', false), leaf(s2, 0, -24, 'leaf2', true, 0.9), leaf(s2, 0, -54, 'leaf3', false, 0.85)];
    const top = c.pv(s2, 0, -78, 'leaf4');
    P(E('g', { transform: 'rotate(-90) scale(0.7)' }, top), leafD, C.green, { 'stroke-width': 6 });
    leaves.push(top);
    // pot (over stems' base)
    P(b, 'M-72,-112 H72 L56,0 H-56 Z', C.pink);
    R(b, -84, -136, 168, 32, 11, C.pink);
    HL(b, 'M-60,-92 L-50,-24', 6);
    HL(b, 'M-70,-124 H-40', 5);
    const api = { stemLow: s1, stemHigh: s2, leaves };
    finish(c, api);
    api.wilt = function (tl, t, d) {
      d = d || 0.9;
      const e = 'back.out(1.4)';
      tl.fromTo(s1, { rotation: 0 }, { rotation: 18, duration: d, ease: e, immediateRender: false }, t);
      tl.fromTo(s2, { rotation: 0 }, { rotation: 92, duration: d, ease: e, immediateRender: false }, t + 0.06);
      [[0, -50], [1, 50], [2, -70], [3, 20], [4, 20]].forEach(([i, r]) =>
        tl.fromTo(leaves[i], { rotation: 0 }, { rotation: r, duration: d, ease: e, immediateRender: false }, t + 0.05 * i));
      // falling leaf
      tl.fromTo(leaves[0], { x: 0, y: 0 }, { x: -50, y: 120, duration: 0.9, ease: 'power1.in', immediateRender: false }, t + d * 0.7);
      tl.fromTo(leaves[0], { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, t + d * 0.7 + 0.65);
      return api;
    };
    return api;
  };

  // ================================================================ 11. STORE + small items
  // store (~520x420, anchor bottom-center): parts sign, awning, door ; animators pop, out, bounce, openSign(tl,t)
  Props.store = function (parent, opts) {
    const c = mk(parent, opts, { text: 'TU NEGOCIO' }), b = c.body;
    GS(b, 0, 2, 280, 16);
    R(b, -228, -350, 456, 350, 10, C.lblue);
    HL(b, 'M-214,-230 V-160', 6);
    // window with display
    R(b, -204, -206, 186, 160, 10, C.white);
    R(b, -192, -194, 162, 136, 6, C.lblue, { 'stroke-width': 4 });
    P(b, 'M-180,-58 V-96 H-136 V-58', C.pink, { 'stroke-width': 4 });
    P(b, 'M-120,-58 L-112,-104 H-72 L-64,-58 Z', C.yellow, { 'stroke-width': 4 });
    P(b, 'M-106,-104 C-106,-122 -78,-122 -78,-104', 'none', { 'stroke-width': 4 });
    HL(b, 'M-180,-180 L-160,-160', 6);
    R(b, -212, -50, 202, 16, 6, C.blue, { 'stroke-width': 4.5 });
    // door
    const door = c.g(b, 'door');
    R(door, 30, -222, 170, 222, 10, C.yellow);
    R(door, 52, -200, 126, 84, 8, C.lblue, { 'stroke-width': 4.5 });
    Ci(door, 172, -96, 8, INK, NOS);
    const tag = c.pv(door, 115, -150, 'openSign');
    L(tag, -26, -30, 0, -46, { 'stroke-width': 3.5 }); L(tag, 26, -30, 0, -46, { 'stroke-width': 3.5 });
    R(tag, -50, -30, 100, 40, 8, C.white, { 'stroke-width': 4 });
    T(tag, 0, -10, 'ABIERTO', { size: 19, weight: 900, fill: C.green });
    // plinth
    R(b, -244, -22, 488, 22, 8, C.blue);
    // awning
    const aw = c.g(b, 'awning');
    for (let i = 0; i < 8; i++) {
      const x = -240 + i * 60;
      P(aw, `M${x},-318 H${x + 60} V-262 A30,30 0 0 1 ${x},-262 Z`, i % 2 ? C.white : C.pink, { 'stroke-width': 5 });
    }
    R(aw, -252, -332, 504, 26, 12, C.pink);
    HL(aw, 'M-236,-322 H-180', 5);
    // sign board
    const sign = c.pv(b, 0, -372, 'sign');
    L(sign, -150, 30, -150, 46, { 'stroke-width': 6 }); L(sign, 150, 30, 150, 46, { 'stroke-width': 6 });
    R(sign, -212, -44, 424, 82, 18, C.blue, { 'stroke-width': 6 });
    T(sign, 0, -1, c.o.text, { size: 52, weight: 900, fill: C.white, fit: textW(c.o.text, 52) > 380 ? 380 : null });
    HL(sign, 'M-196,-28 H-160', 5);
    const api = { sign, awning: aw, door, openSignTag: tag };
    finish(c, api);
    api.openSign = function (tl, t) {
      tl.fromTo(tag, { rotation: -28 }, { rotation: 0, duration: 0.9, ease: 'elastic.out(1.2,0.3)', immediateRender: false }, t);
      return api;
    };
    return api;
  };
  function itemFactory(drawFn, def) {
    return function (parent, opts) {
      const c = mk(parent, opts, def);
      drawFn(c, c.body, c.o);
      const api = {};
      return finish(c, api);
    };
  }
  function boxArt(p, w, h) {
    R(p, -w / 2, -h, w, h, 8, C.yellow);
    R(p, -w / 2 - 6, -h - 4, w + 12, h * 0.26, 7, C.yellow);
    R(p, -14, -h - 4, 28, h + 4, 0, C.cream, { 'stroke-width': 4 });
    HL(p, `M${-w / 2 + 12},${-h * 0.62} V${-h * 0.3}`, 5);
  }
  function laptopMiniArt(p) {
    R(p, -62, -96, 124, 82, 10, C.white, { 'stroke-width': 5 });
    R(p, -52, -86, 104, 62, 5, C.blue, { 'stroke-width': 3.5 });
    R(p, -42, -76, 50, 30, 4, C.pink, { 'stroke-width': 3 });
    R(p, -10, -60, 50, 28, 4, C.yellow, { 'stroke-width': 3 });
    P(p, 'M-80,-16 H80 L72,0 H-72 Z', C.white, { 'stroke-width': 5 });
  }
  function phoneMiniArt(p) {
    R(p, -30, -112, 60, 112, 12, C.blue, { 'stroke-width': 5 });
    R(p, -22, -102, 44, 86, 6, C.lblue, { 'stroke-width': 3.5 });
    R(p, -16, -94, 32, 14, 6, C.white, { 'stroke-width': 3 });
    R(p, -9, -10, 18, 4, 2, C.white, NOS);
  }
  function coinsArt(p) {
    const coin = (g, y, rx, ry) => {
      P(g, `M${-rx},${y} V${y + 10} A${rx},${ry} 0 0 0 ${rx},${y + 10} V${y}`, C.yellow, { 'stroke-width': 4.5 });
      El(g, 0, y, rx, ry, C.yellow, { 'stroke-width': 4.5 });
    };
    const side = E('g', { transform: 'translate(54,0)' }, p);
    coin(side, -22, 32, 11);
    for (let i = 0; i < 3; i++) coin(p, -24 - i * 13, 40, 13);
    T(p, 0, -50, '$', { size: 18, weight: 900, fill: INK });
    HL(p, 'M-28,-55 Q-20,-60 -10,-61', 3.5);
  }
  // all anchored bottom-center
  Props.box = itemFactory((c, b) => boxArt(b, 130, 96));            // ~140x100
  Props.laptopMini = itemFactory((c, b) => laptopMiniArt(b));        // ~160x100
  Props.phoneMini = itemFactory((c, b) => phoneMiniArt(b));          // ~60x112
  Props.coins = itemFactory((c, b) => coinsArt(b));                  // ~130x70
  // itemPile: box + laptopMini + phoneMini + coins stacked (~200x270, anchor bottom-center); parts box, laptop, phone, coins (pivots)
  Props.itemPile = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    const box = c.pv(b, 0, 0, 'box'); boxArt(box, 170, 110);
    const lap = c.pv(b, -6, -118, 'laptop', ' rotate(-4)'); laptopMiniArt(lap);
    const ph = c.pv(b, 60, -134, 'phone', ' rotate(12)'); phoneMiniArt(ph);
    const co = c.pv(b, -40, -132, 'coins'); coinsArt(co);
    const api = { box, laptop: lap, phone: ph, coins: co };
    finish(c, api);
    api.wobble = function (tl, t0, t1) {
      const parts = [lap, ph, co];
      let k = 0;
      for (let t = t0; t + 0.2 <= t1 + 1e-6; t += 0.2) {
        parts.forEach((pp, i) => tl.fromTo(pp, { rotation: (k + i) % 2 ? 3 : -3 }, { rotation: (k + i) % 2 ? -3 : 3, duration: 0.2, ease: 'sine.inOut', immediateRender: false }, t));
        k++;
      }
      parts.forEach((pp) => tl.fromTo(pp, { rotation: k % 2 ? 3 : -3 }, { rotation: 0, duration: 0.2, ease: 'sine.out', immediateRender: false }, t0 + k * 0.2));
      return api;
    };
    return api;
  };

  // ================================================================ 12. CLOCK 2H (~260, anchor center) + PRICE TAG (~300x150)
  // clock2h parts: wedge, hand, badge ; animators sweep(tl,t,d=.8), pop, out, bounce
  Props.clock2h = function (parent, opts) {
    const c = mk(parent, opts, { label: '2 H', hours: 2 }), b = c.body;
    Ci(b, 4, 6, 130, INK, { stroke: 'none', opacity: 0.16 });
    Ci(b, 0, 0, 130, C.blue, { 'stroke-width': 6 });
    Ci(b, 0, 0, 106, C.white);
    const rr = 52, circ = 2 * Math.PI * rr, frac = c.o.hours / 12;
    const wedge = E('circle', { cx: 0, cy: 0, r: rr, fill: 'none', stroke: C.pink, 'stroke-width': 104, transform: 'rotate(-90)', id: c.id + '-wedge' }, b);
    HL(b, 'M-112,-50 A120,120 0 0 1 -50,-112', 6);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, big = i % 3 === 0;
      L(b, Math.sin(a) * (big ? 80 : 88), -Math.cos(a) * (big ? 80 : 88), Math.sin(a) * 98, -Math.cos(a) * 98, { 'stroke-width': big ? 6.5 : 4 });
    }
    L(b, 0, 0, 0, -104, { 'stroke-width': 6 });
    const hand = c.pv(b, 0, 0, 'hand'); L(hand, 0, 0, 0, -104, { 'stroke-width': 6 });
    R(hand, -6, -72, 12, 70, 6, INK, NOS);
    Ci(b, 0, 0, 12, C.yellow, { 'stroke-width': 4.5 });
    const badge = c.pv(b, 104, -108, 'badge');
    R(badge, -58, -32, 116, 64, 32, C.yellow, { 'stroke-width': 5.5 });
    T(badge, 0, 2, c.o.label, { size: 36, weight: 900 });
    const api = { wedge, hand, badge };
    finish(c, api);
    gsap.set(wedge, { strokeDasharray: '0 ' + (circ + 2) });
    gsap.set(badge, { scale: 0 });
    api.sweep = function (tl, t, d) {
      d = d || 0.8;
      tl.fromTo(wedge, { strokeDasharray: '0 ' + (circ + 2) }, { strokeDasharray: (circ * frac).toFixed(2) + ' ' + (circ + 2), duration: d, ease: 'power2.inOut', immediateRender: false }, t);
      tl.fromTo(hand, { rotation: 0 }, { rotation: 360 * frac, duration: d, ease: 'power2.inOut', immediateRender: false }, t);
      tl.fromTo(badge, { scale: 0, rotation: -15 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2.8)', immediateRender: false }, t + d * 0.8);
      return api;
    };
    return api;
  };
  // priceTag(parent,{id,x,y,scale,text='× $25'}) ~300x150, anchor center; parts tag (swing pivot at the hole) ; animators swing(tl,t0,t1), pop, out, bounce
  Props.priceTag = function (parent, opts) {
    if (typeof opts === 'string') opts = { text: opts };
    const c = mk(parent, opts, { text: '× $25' }), b = c.body;
    const tag = c.pv(b, -110, 0, 'tag');
    const g = E('g', { transform: 'translate(110,0)' }, tag);
    P(g, 'M-110,0 C-130,-40 -170,-60 -150,-96', 'none', { 'stroke-width': 5 });
    P(g, 'M-143,9 L-93,-53 H147 Q157,-53 157,-43 V61 Q157,71 147,71 H-93 Z', INK, { stroke: 'none', opacity: 0.16 });
    P(g, 'M-150,0 L-100,-62 H140 Q150,-62 150,-52 V52 Q150,62 140,62 H-100 Z', C.yellow, { 'stroke-width': 6 });
    Ci(g, -110, 0, 11, C.cream, { 'stroke-width': 4.5 });
    HL(g, 'M-90,-48 H-40', 6);
    const txt = String(c.o.text);
    T(g, 24, 3, txt, { size: 62, weight: 900, fit: textW(txt, 62) > 220 ? 220 : null });
    const api = { tag };
    finish(c, api);
    api.swing = function (tl, t0, t1) {
      const n = Math.max(2, Math.round((t1 - t0) / 0.3)); const step = (t1 - t0) / n;
      let prev = 0;
      for (let i = 0; i < n; i++) {
        const v = i === n - 1 ? 0 : (i % 2 ? -1 : 1) * 14 * (1 - i / n);
        tl.fromTo(tag, { rotation: prev }, { rotation: v, duration: step, ease: 'sine.inOut', immediateRender: false }, t0 + i * step);
        prev = v;
      }
      return api;
    };
    return api;
  };

  // ================================================================ 13. MONEY COUNTER  (~900x260, anchor center)
  // opts.start=0, opts.prefix='$', opts.sep=',' ; parts: values (group) ; animators: countTo(tl,t0,t1,target,prefix,sep,steps=24), pop, out, bounce
  Props.moneyCounter = function (parent, opts) {
    const c = mk(parent, opts, { start: 0, prefix: '$', sep: ',', size: 190, fill: C.green }), b = c.body;
    const vals = c.g(b, 'values');
    const fmt = (v, sep) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    let n = 0;
    const node = (str) => {
      const g = E('g', { id: c.id + '-v' + (n++) }, vals);
      T(g, 9, 13, str, { size: c.o.size, weight: 900, fill: INK, outline: 14, oc: INK, tnum: true });
      T(g, 0, 0, str, { size: c.o.size, weight: 900, fill: c.o.fill, outline: 14, oc: INK, tnum: true });
      return g;
    };
    let curNode = node(c.o.prefix + fmt(c.o.start, c.o.sep)), cur = c.o.start;
    const api = { values: vals };
    finish(c, api);
    api.countTo = function (tl, t0, t1, target, prefix, sep, steps) {
      prefix = prefix === undefined ? c.o.prefix : prefix; sep = sep === undefined ? c.o.sep : sep; steps = steps || 24;
      const from = cur, span = target - from;
      const unit = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.max(1, Math.abs(span)))) - 2));
      let prevNode = curNode, lastStr = null;
      for (let i = 1; i <= steps; i++) {
        const e = 1 - Math.pow(1 - i / steps, 2.2);
        const v = i === steps ? target : from + Math.round(span * e / unit) * unit;
        const str = prefix + fmt(v, sep);
        if (str === lastStr) continue;
        lastStr = str;
        const nd = node(str), ti = t0 + (t1 - t0) * i / steps;
        gsap.set(nd, { visibility: 'hidden' });
        tl.set(nd, { visibility: 'visible' }, S(ti));
        tl.set(prevNode, { visibility: 'hidden' }, S(ti));
        prevNode = nd;
      }
      tl.fromTo(b, { scale: 1 }, { scale: 1.14, duration: 0.12, ease: 'power2.out', immediateRender: false }, t1);
      tl.fromTo(b, { scale: 1.14 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1.1,0.4)', immediateRender: false }, t1 + 0.12);
      curNode = prevNode; cur = target;
      return api;
    };
    return api;
  };

  // ================================================================ 14. BILLS + GIFT BOX
  // bill(parent,{id,x,y,scale,rotation}) ~140x70, anchor center ; parts mover ; animators flyAway(tl,t,dx,dy,d=.8), flutter(tl,t0,t1), pop, out
  Props.bill = function (parent, opts) {
    const c = mk(parent, opts, { rotation: 0 }), b = c.body;
    const mv = c.pv(b, 0, 0, 'mv', ` rotate(${c.o.rotation})`);
    const flip = c.pv(mv, 0, 0, 'flip');
    billArt(flip);
    const api = { mover: mv, flip };
    finish(c, api);
    api.flyAway = function (tl, t, dx, dy, d) {
      d = d || 0.8; const s = dx >= 0 ? 1 : -1;
      tl.fromTo(mv, { x: 0, y: 0, rotation: 0 }, { x: dx, y: dy, rotation: s * 220, duration: d, ease: 'power2.in', immediateRender: false }, t);
      tl.fromTo(flip, { scaleY: 1 }, { scaleY: -1, duration: d / 2, ease: 'sine.inOut', immediateRender: false }, t);
      tl.fromTo(flip, { scaleY: -1 }, { scaleY: 1, duration: d / 2, ease: 'sine.inOut', immediateRender: false }, t + d / 2);
      tl.fromTo(mv, { opacity: 1 }, { opacity: 0, duration: d * 0.25, immediateRender: false }, t + d * 0.75);
      return api;
    };
    api.flutter = function (tl, t0, t1) {
      let k = 0;
      for (let t = t0; t + 0.3 <= t1 + 1e-6; t += 0.3, k++) tl.fromTo(flip, { rotation: k % 2 ? 8 : -8, scaleY: k % 2 ? 0.7 : 1 }, { rotation: k % 2 ? -8 : 8, scaleY: k % 2 ? 1 : 0.7, duration: 0.3, ease: 'sine.inOut', immediateRender: false }, t);
      return api;
    };
    return api;
  };
  // bills(parent,{id,x,y}) container ; animators rain(tl,t0,t1,n,area={x:-540,y:-960,w:1080,h:1920}, fall=1.3), flyAway(tl,t,dx,dy) moves the whole container ; parts list[]
  Props.bills = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    const api = { list: [] };
    finish(c, api, { popRot: 0 });
    api.rain = function (tl, t0, t1, n, area, fall) {
      area = area || { x: -540, y: -960, w: 1080, h: 1920 };
      n = n || 12;
      const f = Math.min(fall || 1.3, Math.max(0.4, t1 - t0));
      const base = api.list.length;
      for (let i = 0; i < n; i++) {
        const r = rng(hash(c.id + 'rain' + (base + i)));
        const x = area.x + 60 + ((i + r() * 0.8) / n) * (area.w - 120);
        const y0 = area.y - 70, y1 = area.y + area.h + 70;
        const sc = 0.8 + r() * 0.5, rot0 = (r() - 0.5) * 70;
        const bw = c.pv(b, x, y0, 'r' + (base + i), ` scale(${sc.toFixed(2)})`);
        const fl = c.pv(bw, 0, 0, 'rf' + (base + i));
        billArt(fl);
        c.fix();
        api.list.push(bw);
        const ti = t0 + (n > 1 ? (t1 - t0 - f) * (((i * 7) % n) / (n - 1)) : 0) + r() * 0.08;
        gsap.set(bw, { visibility: 'hidden' });
        tl.set(bw, { visibility: 'visible' }, S(ti));
        tl.set(bw, { visibility: 'hidden' }, S(ti + f));
        tl.fromTo(bw, { y: 0 }, { y: (y1 - y0) / sc, duration: f, ease: 'none', immediateRender: false }, ti);
        const sw = 50 + r() * 40, segs = 3;
        for (let k = 0; k < segs; k++) {
          const a = (k % 2 ? 1 : -1) * sw, z = -a;
          tl.fromTo(bw, { x: k === 0 ? 0 : a }, { x: k === segs - 1 ? z * 0.5 : z, duration: f / segs, ease: 'sine.inOut', immediateRender: false }, ti + k * f / segs);
          tl.fromTo(fl, { rotation: rot0 + (k % 2 ? 25 : -25), scaleY: k % 2 ? 0.45 : 1 }, { rotation: rot0 + (k % 2 ? -25 : 25), scaleY: k % 2 ? 1 : 0.45, duration: f / segs, ease: 'sine.inOut', immediateRender: false }, ti + k * f / segs);
        }
      }
      return api;
    };
    api.flyAway = function (tl, t, dx, dy, d) {
      d = d || 0.8;
      tl.fromTo(b, { x: 0, y: 0, opacity: 1 }, { x: dx, y: dy, duration: d, ease: 'power2.in', immediateRender: false }, t);
      tl.fromTo(b, { opacity: 1 }, { opacity: 0, duration: d * 0.3, immediateRender: false }, t + d * 0.7);
      return api;
    };
    return api;
  };
  // giftBox (~300x320, anchor bottom-center) ; parts lid, bills[] ; animators open(tl,t), pop, out, bounce
  Props.giftBox = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    GS(b, 0, 2, 160, 14);
    const inside = c.g(b, 'inside');
    const bills = [];
    for (let i = 0; i < 6; i++) {
      const bw = c.pv(inside, -60 + i * 24, -150, 'bill' + i);
      const fl = c.pv(bw, 0, 0, 'billFlip' + i);
      billArt(fl);
      bills.push([bw, fl]);
    }
    R(b, -130, -200, 260, 200, 14, C.pink);
    R(b, -22, -200, 44, 200, 0, C.yellow, { 'stroke-width': 5 });
    HL(b, 'M-112,-176 V-120', 6); HL(b, 'M-112,-100 V-88', 6);
    const lid = c.pv(b, 0, -200, 'lid');
    const bow = E('g', {}, lid);
    P(bow, 'M0,-60 C-30,-124 -108,-112 -76,-70 C-62,-54 -24,-58 0,-60 Z', C.yellow);
    P(bow, 'M0,-60 C30,-124 108,-112 76,-70 C62,-54 24,-58 0,-60 Z', C.yellow);
    R(lid, -150, -64, 300, 64, 14, C.pink);
    R(lid, -24, -64, 48, 64, 0, C.yellow, { 'stroke-width': 5 });
    Ci(lid, 0, -66, 17, C.yellow);
    HL(lid, 'M-132,-48 H-80', 6);
    const api = { lid, bills: bills.map((x) => x[0]) };
    finish(c, api);
    const spk = Props.sparkle(b, { id: c.id + '-spk', x: 0, y: -300, scale: 1.3 });
    api.sparkle = spk;
    api.open = function (tl, t) {
      shake(tl, b, t, 5, 5, 0.05);
      const to = t + 0.3;
      tl.fromTo(lid, { x: 0, y: 0, rotation: 0 }, { x: 40, y: -230, rotation: 22, duration: 0.32, ease: 'power2.out', immediateRender: false }, to);
      tl.fromTo(lid, { x: 40, y: -230, rotation: 22 }, { x: 300, y: 40, rotation: 95, duration: 0.5, ease: 'power2.in', immediateRender: false }, to + 0.32);
      tl.fromTo(lid, { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, to + 0.68);
      spk.burst(tl, to + 0.1);
      bills.forEach(([bw, fl], i) => {
        const r = rng(hash(c.id + 'gb' + i)), side = i < 3 ? -1 : 1;
        const ux = (i - 2.5) * 34, uy = -230 - r() * 120;
        const ti = to + 0.06 + i * 0.05;
        tl.fromTo(bw, { x: 0, y: 0, rotation: 0, scale: 0.7 }, { x: ux, y: uy, rotation: (r() - 0.5) * 60, scale: 1, duration: 0.42, ease: 'power2.out', immediateRender: false }, ti);
        tl.fromTo(bw, { x: ux, y: uy, rotation: 0 }, { x: ux + side * (360 + r() * 200), y: uy - 260 - r() * 200, rotation: side * 260, duration: 0.85, ease: 'power1.in', immediateRender: false }, ti + 0.42);
        tl.fromTo(fl, { scaleY: 1 }, { scaleY: -1, duration: 0.4, ease: 'sine.inOut', immediateRender: false }, ti + 0.42);
        tl.fromTo(fl, { scaleY: -1 }, { scaleY: 1, duration: 0.4, ease: 'sine.inOut', immediateRender: false }, ti + 0.82);
        tl.fromTo(bw, { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, ti + 1.07);
      });
      tl.fromTo(b, { scaleX: 1.1, scaleY: 0.88 }, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'elastic.out(1.1,0.4)', immediateRender: false }, to);
      return api;
    };
    return api;
  };

  // ================================================================ 15. GEARS + CONVEYOR (+ machine = both, ~900x400)
  function gearD(T, ro, ri) {
    const p = 2 * Math.PI / T; let d = '';
    for (let k = 0; k < T; k++) {
      const a = k * p;
      const q = [[ri, a - 0.29 * p], [ro, a - 0.15 * p], [ro, a + 0.15 * p], [ri, a + 0.29 * p]];
      q.forEach((v, j) => { d += (k === 0 && j === 0 ? 'M' : 'L') + (v[0] * Math.cos(v[1])).toFixed(1) + ',' + (v[0] * Math.sin(v[1])).toFixed(1); });
    }
    return d + 'Z';
  }
  function buildGears(c, p, ox, oy) {
    const M = 7; // pitch radius per tooth
    const defs = [{ T: 14, col: C.blue }, { T: 10, col: C.yellow }, { T: 7, col: C.pink }];
    const dirs = [-35 * Math.PI / 180, 40 * Math.PI / 180];
    const pos = [[ox, oy]];
    for (let i = 1; i < 3; i++) {
      const dist = (defs[i - 1].T + defs[i].T) * M + 7; // + clearance for the outlines
      pos.push([pos[i - 1][0] + dist * Math.cos(dirs[i - 1]), pos[i - 1][1] + dist * Math.sin(dirs[i - 1])]);
    }
    const rots = [0];
    for (let i = 1; i < 3; i++) {
      const Ti = defs[i - 1].T, Tj = defs[i].T, pi = 2 * Math.PI / Ti;
      let dlt = dirs[i - 1] - rots[i - 1];
      dlt = ((dlt % pi) + pi) % pi; if (dlt > pi / 2) dlt -= pi;
      rots.push(dirs[i - 1] + Math.PI + Math.PI / Tj + dlt * Ti / Tj);
    }
    const gears = defs.map((d, i) => {
      const rp = d.T * M, ro = rp + 11, ri = rp - 11;
      const g = c.pv(p, pos[i][0], pos[i][1], 'gear' + i);
      P(g, gearD(d.T, ro, ri), d.col, { 'stroke-width': 5.5 });
      Ci(g, 0, 0, ri * 0.62, 'none', { 'stroke-width': 4 });
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; Ci(g, Math.cos(a) * ri * 0.62, Math.sin(a) * ri * 0.62, Math.max(5, ri * 0.13), C.cream, { 'stroke-width': 3.5 }); }
      Ci(g, 0, 0, Math.max(9, ri * 0.24), C.cream, { 'stroke-width': 4.5 });
      HL(g.parentNode, `M${-ri * 0.8},${-ri * 0.2} A${ri * 0.82},${ri * 0.82} 0 0 1 ${-ri * 0.2},${-ri * 0.8}`, 5); // static gloss (does not spin)
      return { g, T: d.T, rot: rots[i] * 180 / Math.PI };
    });
    return gears;
  }
  function gearsSpin(tl, gears, t0, t1, turns) {
    turns = turns === undefined ? 1 : turns;
    const T1 = gears[0].T;
    gears.forEach((G, i) => {
      const sign = i % 2 ? -1 : 1, delta = sign * 360 * turns * T1 / G.T;
      tl.fromTo(G.g, { rotation: G.rot }, { rotation: G.rot + delta, duration: t1 - t0, ease: 'none', immediateRender: false }, t0);
      G.rot += delta;
    });
  }
  function buildConveyor(c, p, ox, oy) {
    const g = E('g', { transform: `translate(${ox},${oy})` }, p);
    GS(g, 0, 118, 240, 12);
    P(g, 'M-170,22 L-190,116 H-140 L-130,22 Z', C.blue, { 'stroke-width': 5 });
    P(g, 'M170,22 L190,116 H140 L130,22 Z', C.blue, { 'stroke-width': 5 });
    R(g, -250, -26, 500, 52, 26, INK, { 'stroke-width': 5 });
    const dash = L(g, -222, -20, 222, -20, { stroke: C.lblue, 'stroke-width': 5, 'stroke-dasharray': '18 16', 'stroke-linecap': 'butt', id: c.id + '-belt' });
    const rollers = [-222, -74, 74, 222].map((x, i) => {
      const r = c.pv(g, x, 4, 'roller' + i);
      Ci(r, 0, 0, 17, C.lblue, { 'stroke-width': 4.5 });
      L(r, -10, 0, 10, 0, { 'stroke-width': 4 }); L(r, 0, -10, 0, 10, { 'stroke-width': 4 });
      return r;
    });
    const items = [];
    const kinds = ['env', 'box', 'env'];
    for (let i = 0; i < 3; i++) {
      const it = c.pv(g, 0, -28, 'item' + i);
      const k = kinds[i];
      if (k === 'env') {
        R(it, -46, -62, 92, 60, 7, C.white, { 'stroke-width': 5 });
        P(it, 'M-44,-60 L0,-28 L44,-60', 'none', { 'stroke-width': 4.5 });
        Ci(it, 0, -30, 9, C.pink, { 'stroke-width': 3.5 });
      } else {
        R(it, -40, -76, 80, 74, 7, C.yellow, { 'stroke-width': 5 });
        R(it, -10, -76, 20, 74, 0, C.cream, { 'stroke-width': 3.5 });
        HL(it, 'M-30,-62 V-40', 4);
      }
      items.push({ el: it, x: -190 + i * 133 });
    }
    return { g, dash, rollers, items };
  }
  function conveyorRun(tl, cv, t0, t1, speed, state) {
    speed = speed || 230;
    const D = t1 - t0, dist = speed * D;
    tl.fromTo(cv.dash, { strokeDashoffset: state.off }, { strokeDashoffset: state.off - dist, duration: D, ease: 'none', immediateRender: false }, t0);
    state.off -= dist;
    cv.rollers.forEach((r, i) => {
      const deg = dist / 17 * 180 / Math.PI;
      tl.fromTo(r, { rotation: state.rr[i] }, { rotation: state.rr[i] + deg, duration: D, ease: 'none', immediateRender: false }, t0);
      state.rr[i] += deg;
    });
    const A = -200, B = 200, sh = 0.14;
    cv.items.forEach((it) => {
      let t = t0, x = it.x;
      while (t < t1 - 1e-6) {
        const tReach = t + (B - x) / speed;
        const tEnd = Math.min(t1, tReach);
        const xEnd = x + (tEnd - t) * speed;
        tl.fromTo(it.el, { x }, { x: xEnd, duration: tEnd - t, ease: 'none', immediateRender: false }, t);
        if (tReach <= t1) {
          tl.fromTo(it.el, { scale: 1 }, { scale: 0, duration: sh, ease: 'back.in(2)', immediateRender: false }, Math.max(t, tReach - sh));
          tl.fromTo(it.el, { scale: 0 }, { scale: 1, duration: sh + 0.08, ease: 'back.out(2.5)', immediateRender: false }, tReach);
          x = A;
        } else x = xEnd;
        t = tEnd;
      }
      it.x = x;
    });
  }
  function initConveyor(cv) {
    cv.items.forEach((it) => gsap.set(it.el, { x: it.x }));
    return { off: 0, rr: [0, 0, 0, 0] };
  }
  // gears (~420x320, anchor center) ; parts gears[] ; animators spin(tl,t0,t1,turns=1)
  Props.gears = function (parent, opts) {
    const c = mk(parent, opts), gs = buildGears(c, c.body, -90, 40);
    const api = { gears: gs.map((x) => x.g) };
    finish(c, api);
    gs.forEach((G) => gsap.set(G.g, { rotation: G.rot }));
    api.spin = function (tl, t0, t1, turns) { gearsSpin(tl, gs, t0, t1, turns); return api; };
    return api;
  };
  // conveyor (~500x260, anchor center of belt) ; parts items[], rollers[] ; animators run(tl,t0,t1,speed=230)
  Props.conveyor = function (parent, opts) {
    const c = mk(parent, opts), cv = buildConveyor(c, c.body, 0, 0);
    const api = { items: cv.items.map((i) => i.el), rollers: cv.rollers, belt: cv.dash };
    finish(c, api);
    const stt = initConveyor(cv);
    api.run = function (tl, t0, t1, speed) { conveyorRun(tl, cv, t0, t1, speed, stt); return api; };
    return api;
  };
  // machine = gears (left) + conveyor (right), ~900x400, anchor center ; animators spin, run, pop, out
  Props.machine = function (parent, opts) {
    const c = mk(parent, opts), gs = buildGears(c, c.body, -330, 10), cv = buildConveyor(c, c.body, 190, 70);
    const api = { gears: gs.map((x) => x.g), items: cv.items.map((i) => i.el), rollers: cv.rollers, belt: cv.dash };
    finish(c, api);
    gs.forEach((G) => gsap.set(G.g, { rotation: G.rot }));
    const stt = initConveyor(cv);
    api.spin = function (tl, t0, t1, turns) { gearsSpin(tl, gs, t0, t1, turns); return api; };
    api.run = function (tl, t0, t1, speed) { conveyorRun(tl, cv, t0, t1, speed, stt); return api; };
    return api;
  };

  // ================================================================ 16. COMMENT BUBBLE  (~700x300, anchor center)
  // opts.text='YO', opts.user='tu_amiga' ; parts letters[], caret, heart ; animators type(tl,t,cps=6), like(tl,t), pop, out, bounce
  Props.commentBubble = function (parent, opts) {
    const c = mk(parent, opts, { text: 'YO', user: 'tu_amiga' }), b = c.body;
    card(b, -350, -134, 700, 268, 48, C.white);
    const av = E('g', { transform: 'translate(-262,-26)' }, b);
    faceArt(c, av, 0.6, 'avEyes');
    T(b, -190, -78, c.o.user, { size: 30, weight: 800, anchor: 'start' });
    T(b, -190 + textW(c.o.user, 30) + 16, -78, '2 min', { size: 24, weight: 600, anchor: 'start', fill: INK }).setAttribute('opacity', 0.45);
    const size = 84, tx = -192, ty = 8;
    const text = E('text', { x: tx, y: ty, 'font-family': FONT, 'font-weight': 900, 'font-size': size, fill: INK, 'dominant-baseline': 'central', id: c.id + '-text' }, b);
    const letters = [];
    String(c.o.text).split('').forEach((ch, i) => {
      const ts = E('tspan', { id: c.id + '-ch' + i }, text);
      ts.textContent = ch;
      letters.push(ts);
    });
    const caret = R(b, tx, ty - 36, 7, 72, 3.5, C.blue, { stroke: 'none', id: c.id + '-caret' });
    const rep = T(b, -190, 92, 'Responder', { size: 24, weight: 700, anchor: 'start' }); rep.setAttribute('opacity', 0.45);
    const heart = c.pv(b, 282, -6, 'heart');
    const hp = P(heart, heartD(0.9), C.white, { 'stroke-width': 5.5, id: c.id + '-heartFill' });
    const burst = c.g(b, 'likeBurst');
    const rays = [];
    for (let i = 0; i < 6; i++) {
      const a = i * 60 - 90;
      const w = E('g', { transform: `translate(282,-10) rotate(${a})` }, burst);
      const ray = E('g', { id: c.id + '-ray' + i }, w);
      L(ray, 52, 0, 72, 0, { stroke: i % 2 ? C.pink : C.red, 'stroke-width': 7 });
      rays.push(ray);
    }
    const cnt = T(b, 282, 52, '1', { size: 26, weight: 800, id: c.id + '-likes' });
    const api = { letters, caret, heart, heartPath: hp };
    finish(c, api);
    letters.forEach((l) => gsap.set(l, { visibility: 'hidden' }));
    gsap.set(caret, { opacity: 0 });
    gsap.set(rays, { opacity: 0 });
    gsap.set(cnt, { visibility: 'hidden' });
    api.type = function (tl, t, cps) {
      cps = cps || 6;
      const str = String(c.o.text);
      tl.set(caret, { opacity: 1, x: 0 }, S(t - 0.2));
      let xx = 0;
      str.split('').forEach((ch, i) => {
        const ti = t + i / cps;
        tl.set(letters[i], { visibility: 'visible' }, S(ti));
        xx += textW(ch, size) * 0.95;
        tl.set(caret, { x: xx + 6 }, S(ti));
      });
      const te = t + str.length / cps;
      for (let k = 0; k < 3; k++) { tl.set(caret, { opacity: 0 }, S(te + 0.2 + k * 0.4)); tl.set(caret, { opacity: 1 }, S(te + 0.4 + k * 0.4)); }
      tl.set(caret, { opacity: 0 }, S(te + 1.4));
      return api;
    };
    api.like = function (tl, t) {
      tl.set(hp, { fill: C.red }, S(t));
      tl.fromTo(heart, { scale: 0.5 }, { scale: 1, duration: 0.45, ease: 'back.out(3.5)', immediateRender: false }, t);
      rays.forEach((r) => {
        tl.fromTo(r, { opacity: 1, x: -16 }, { opacity: 0, x: 12, duration: 0.4, ease: 'power2.out', immediateRender: false }, t + 0.03);
      });
      tl.set(cnt, { visibility: 'visible' }, S(t + 0.1));
      return api;
    };
    return api;
  };

  // ================================================================ 17. TAG BUBBLE (~600x200) + FRIEND avatar (~180)
  // tagBubble opts.text='etiqueta a tu amiga' ; animators pop (slide+overshoot), out, wiggle(tl,t), bounce
  Props.tagBubble = function (parent, opts) {
    const c = mk(parent, opts, { text: 'etiqueta a tu amiga' }), b = c.body;
    const txt = String(c.o.text), size = 44;
    const w = Math.max(360, 130 + textW(txt, size) + 50);
    card(b, -w / 2, -66, w, 132, 66, C.white, { 'stroke-width': 6 });
    Ci(b, -w / 2 + 70, 0, 46, C.pink, { 'stroke-width': 5.5 });
    T(b, -w / 2 + 70, -2, '@', { size: 58, weight: 900, fill: C.white });
    T(b, -w / 2 + 132, 0, txt, { size, weight: 800, anchor: 'start' });
    HL(b, `M${-w / 2 + 120},-48 H${-w / 2 + 150}`, 5);
    const api = {};
    finish(c, api);
    api.pop = function (tl, t, d) {
      d = d || 0.55;
      gsap.set(c.pop, { scale: 0 });
      tl.fromTo(c.pop, { scale: 0, x: -60, rotation: -8 }, { scale: 1, x: 0, rotation: 0, duration: d, ease: 'back.out(2.4)', immediateRender: false }, t);
      return api;
    };
    api.out = function (tl, t, d) { d = d || 0.3; tl.fromTo(c.pop, { scale: 1, x: 0 }, { scale: 0, x: 60, duration: d, ease: 'back.in(1.8)', immediateRender: false }, t); return api; };
    api.wiggle = function (tl, t) { shake(tl, b, t, 6, 5, 0.06); return api; };
    return api;
  };
  // friend(parent,{id,x,y,scale}) avatar circle r=90, anchor center ; parts eyes ; animators blink(tl,t), pop, out, bounce
  Props.friend = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    Ci(b, 6, 8, 90, INK, { stroke: 'none', opacity: 0.16 });
    const f = faceArt(c, b, 1, 'eyes');
    const api = { eyes: f.eyes };
    finish(c, api);
    api.blink = function (tl, t) {
      tl.fromTo(f.eyes, { scaleY: 1 }, { scaleY: 0.1, duration: 0.07, ease: 'power2.in', immediateRender: false }, t);
      tl.fromTo(f.eyes, { scaleY: 0.1 }, { scaleY: 1, duration: 0.1, ease: 'power2.out', immediateRender: false }, t + 0.09);
      return api;
    };
    return api;
  };

  // ================================================================ 18. FOLLOW BUTTON  (~620x130, anchor center)
  // parts pill, label1 ("Seguir"), label2 ("Siguiendo ✓"), dot, ripple ; animators tap(tl,t), pop, out, bounce
  Props.followButton = function (parent, opts) {
    const c = mk(parent, opts, { text: 'Seguir', done: 'Siguiendo' }), b = c.body;
    R(b, -302, -54, 620, 130, 65, INK, { stroke: 'none', opacity: 0.18 });
    const pill = R(b, -310, -65, 620, 130, 65, C.blue, { 'stroke-width': 6, id: c.id + '-pill' });
    const clip = c.clip(b, (cp) => E('rect', { x: -307, y: -62, width: 614, height: 124, rx: 62 }, cp));
    const rip = c.g(b, null, { 'clip-path': clip });
    const ripple = c.pv(rip, 210, 12, 'ripple');
    Ci(ripple, 0, 0, 60, C.white, { stroke: 'none' });
    HL(b, 'M-262,-36 H-220', 6);
    const label1 = T(b, 0, 2, c.o.text, { size: 64, weight: 800, fill: C.white, id: c.id + '-l1' });
    const label2 = c.g(b, 'l2');
    const dw = textW(c.o.done, 58);
    T(label2, -40, 2, c.o.done, { size: 58, weight: 800, fill: INK });
    const cx = -40 + dw / 2 + 44;
    const chkU = P(label2, `M${cx - 22},2 L${cx - 6},18 L${cx + 24},-18`, 'none', { 'stroke-width': 19 });
    const chk = P(label2, `M${cx - 22},2 L${cx - 6},18 L${cx + 24},-18`, 'none', { stroke: C.green, 'stroke-width': 9 });
    const dot = c.pv(b, 210, 12, 'dot');
    Ci(dot, 0, 0, 34, C.white, { 'stroke-width': 5, opacity: 0.95 });
    Ci(dot, 0, 0, 12, C.lblue, { stroke: 'none' });
    const api = { pill, label1, label2, dot, ripple };
    finish(c, api);
    gsap.set(label2, { visibility: 'hidden' });
    gsap.set(dot, { scale: 0 });
    gsap.set(ripple, { scale: 0, opacity: 0 });
    const l1 = prepDraw(chkU), l2 = prepDraw(chk);
    api.tap = function (tl, t) {
      tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.18, ease: 'back.out(2.5)', immediateRender: false }, t - 0.22);
      tl.fromTo(dot, { scale: 1 }, { scale: 0.78, duration: 0.07, ease: 'power2.in', immediateRender: false }, t - 0.04);
      tl.fromTo(b, { scale: 1 }, { scale: 0.92, duration: 0.08, ease: 'power2.in', immediateRender: false }, t - 0.04);
      tl.fromTo(b, { scale: 0.92 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1.1,0.45)', immediateRender: false }, t + 0.04);
      tl.fromTo(ripple, { scale: 0.2, opacity: 0.55 }, { scale: 6, opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, t);
      tl.fromTo(pill, { fill: C.blue }, { fill: C.white, duration: 0.16, ease: 'none', immediateRender: false }, t + 0.1);
      tl.set(label1, { visibility: 'hidden' }, S(t + 0.12));
      tl.set(label2, { visibility: 'visible' }, S(t + 0.12));
      draw(tl, chkU, l1, t + 0.2, 0.25, 'power2.out');
      draw(tl, chk, l2, t + 0.2, 0.25, 'power2.out');
      tl.fromTo(dot, { scale: 0.78 }, { scale: 0, duration: 0.2, ease: 'back.in(2)', immediateRender: false }, t + 0.2);
      return api;
    };
    return api;
  };

  // ================================================================ 19. BLOCKS -> little shop  (~600x500, anchor bottom-center)
  // opts.text='TIENDA' ; parts blocks[] ; animators build(tl,t0,t1,height=560 drop distance), pop, out, bounce
  Props.blocks = function (parent, opts) {
    const c = mk(parent, opts, { text: 'TIENDA' }), b = c.body;
    GS(b, 0, 2, 280, 14);
    const W = 150, H = 100, blocks = [];
    const spec = [
      [-150, 0, C.blue, 'win'], [0, 0, C.yellow, 'door'], [150, 0, C.blue, 'win'],
      [-150, -H, C.pink, 'dots'], [0, -H, C.white, 'sign'], [150, -H, C.pink, 'dots']
    ];
    spec.forEach(([x, y, col, deco], i) => {
      const bl = c.pv(b, x, y, 'blk' + i);
      R(bl, -W / 2, -H, W, H, 12, col);
      HL(bl, `M${-W / 2 + 14},${-H + 14} H${-W / 2 + 46}`, 5);
      if (deco === 'win') { R(bl, -32, -76, 64, 52, 6, C.lblue, { 'stroke-width': 4.5 }); L(bl, 0, -76, 0, -24, { 'stroke-width': 4 }); L(bl, -32, -50, 32, -50, { 'stroke-width': 4 }); }
      if (deco === 'door') { P(bl, 'M-30,0 V-58 A30,30 0 0 1 30,-58 V0', C.pink, { 'stroke-width': 5 }); Ci(bl, 18, -32, 5, INK, NOS); }
      if (deco === 'dots') { Ci(bl, -30, -50, 9, C.white, { 'stroke-width': 4 }); Ci(bl, 0, -50, 9, C.yellow, { 'stroke-width': 4 }); Ci(bl, 30, -50, 9, C.white, { 'stroke-width': 4 }); }
      if (deco === 'sign') T(bl, 0, -50, c.o.text, { size: 32, weight: 900, fit: textW(c.o.text, 32) > 124 ? 124 : null });
      blocks.push(bl);
    });
    const roof = c.pv(b, 0, -2 * H, 'roof');
    P(roof, 'M-262,0 L0,-160 L262,0 Z', C.red, { 'stroke-width': 6 });
    HL(roof, 'M-190,-30 L-110,-80', 6);
    Ci(roof, 0, -62, 22, C.yellow, { 'stroke-width': 5 });
    blocks.push(roof);
    const flag = c.pv(b, 0, -2 * H - 156, 'flag');
    L(flag, 0, 0, 0, -70, { 'stroke-width': 6 });
    P(flag, 'M2,-70 L56,-54 L2,-38 Z', C.pink, { 'stroke-width': 5 });
    blocks.push(flag);
    const api = { blocks };
    finish(c, api);
    api.build = function (tl, t0, t1, height) {
      const n = blocks.length, drop = 0.36, H0 = -(height || 560);
      blocks.forEach((bl, i) => {
        const ti = t0 + (n > 1 ? (t1 - t0 - drop - 0.2) * i / (n - 1) : 0);
        gsap.set(bl, { opacity: 0, y: H0 });
        tl.set(bl, { opacity: 1 }, S(ti));
        tl.fromTo(bl, { y: H0 }, { y: 0, duration: drop, ease: 'power2.in', immediateRender: false }, ti);
        tl.fromTo(bl, { scaleX: 1.18, scaleY: 0.76 }, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1.2,0.4)', immediateRender: false }, ti + drop);
      });
      return api;
    };
    return api;
  };

  // ================================================================ 20. HELPERS: sparkle, speedLines, sweatDrops
  // sparkle(parent,{id,x,y,scale,color}) ~200, anchor center ; hidden at rest ; animators burst(tl,t), pop (star stays), out
  Props.sparkle = function (parent, opts) {
    const c = mk(parent, opts, { color: C.yellow }), b = c.body;
    const rays = [];
    for (let i = 0; i < 8; i++) {
      const w = E('g', { transform: `rotate(${i * 45})` }, b);
      const ray = E('g', { id: c.id + '-ray' + i }, w);
      if (i % 2) Ci(ray, 0, -64, 7, i % 4 === 1 ? C.pink : C.lblue, { 'stroke-width': 4 });
      else L(ray, 0, -52, 0, -84, { 'stroke-width': 7 });
      rays.push(ray);
    }
    const star = c.pv(b, 0, 0, 'star');
    P(star, sparkD(46), c.o.color, { 'stroke-width': 5.5 });
    const api = { star, rays };
    finish(c, api, { popRot: 0 });
    gsap.set(star, { scale: 0 }); gsap.set(rays, { opacity: 0 });
    api.burst = function (tl, t) {
      tl.fromTo(star, { scale: 0, rotation: -45 }, { scale: 1.15, rotation: 0, duration: 0.22, ease: 'back.out(3)', immediateRender: false }, t);
      tl.fromTo(star, { scale: 1.15, rotation: 0 }, { scale: 0, rotation: 60, duration: 0.25, ease: 'power2.in', immediateRender: false }, t + 0.4);
      rays.forEach((r) => {
        tl.fromTo(r, { opacity: 1, y: 22 }, { opacity: 0, y: -26, duration: 0.5, ease: 'power2.out', immediateRender: false }, t + 0.04);
      });
      return api;
    };
    api.pop = function (tl, t) { tl.fromTo(star, { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(3)', immediateRender: false }, t); return api; };
    api.out = function (tl, t) { tl.fromTo(star, { scale: 1 }, { scale: 0, duration: 0.25, ease: 'back.in(2)', immediateRender: false }, t); return api; };
    return api;
  };
  // speedLines(parent,{id,x,y,w=300,h=200,dir='left',color}) anchor = top-left of the box ; hidden at rest ; animators show(tl,t0,t1,period=.32)
  Props.speedLines = function (parent, opts) {
    const c = mk(parent, opts, { w: 300, h: 200, dir: 'left', color: INK }), b = c.body;
    const n = Math.max(3, Math.round(c.o.h / 42)), lines = [];
    for (let i = 0; i < n; i++) {
      const y = c.o.h * (i + 0.5) / n, len = c.o.w * (0.45 + c.r() * 0.5), x0 = c.r() * (c.o.w - len);
      const d = c.o.dir === 'left' ? `M${x0 + len},${y} H${x0}` : `M${x0},${y} H${x0 + len}`;
      lines.push({ el: P(b, d, 'none', { stroke: c.o.color, 'stroke-width': i % 2 ? 6 : 9, id: c.id + '-ln' + i }), len });
    }
    const api = { lines: lines.map((l) => l.el) };
    finish(c, api, { popRot: 0 });
    lines.forEach((l) => gsap.set(l.el, { strokeDasharray: l.len + ' ' + (l.len + 20), strokeDashoffset: l.len + 10 }));
    api.show = function (tl, t0, t1, period) {
      period = period || 0.32;
      lines.forEach((l, i) => {
        for (let t = t0 + (i % 3) * period / 3; t + period <= t1 + 1e-6; t += period) {
          tl.fromTo(l.el, { strokeDashoffset: l.len + 10 }, { strokeDashoffset: -l.len - 10, duration: period, ease: 'none', immediateRender: false }, t);
        }
      });
      return api;
    };
    return api;
  };
  // sweatDrops(parent,{id,x,y,scale}) ~120x80, anchor center ; hidden at rest ; animators drip(tl,t0,t1,period=.6), pop, out
  Props.sweatDrops = function (parent, opts) {
    const c = mk(parent, opts), b = c.body;
    const dropD = 'M0,-28 C10,-12 17,-3 17,8 A17,17 0 0 1 -17,8 C-17,-3 -10,-12 0,-28 Z';
    const drops = [[-44, 6, -28], [0, -14, 0], [44, 6, 28]].map(([x, y, r], i) => {
      const d = c.pv(b, x, y, 'drop' + i, ` rotate(${r})`);
      P(d, dropD, C.lblue, { 'stroke-width': 5 });
      Ci(d, -6, 6, 4, C.white, NOS);
      return d;
    });
    const api = { drops };
    finish(c, api, { popRot: 0 });
    gsap.set(drops, { scale: 0 });
    api.drip = function (tl, t0, t1, period) {
      period = period || 0.6;
      drops.forEach((d, i) => {
        for (let t = t0 + i * period / 3; t + period <= t1 + 1e-6; t += period) {
          tl.fromTo(d, { scale: 0, y: 0, opacity: 1 }, { scale: 1, y: 0, duration: period * 0.3, ease: 'back.out(3)', immediateRender: false }, t);
          tl.fromTo(d, { y: 0, opacity: 1 }, { y: 34, opacity: 0, duration: period * 0.6, ease: 'power2.in', immediateRender: false }, t + period * 0.35);
        }
      });
      return api;
    };
    api.pop = function (tl, t) { drops.forEach((d, i) => tl.fromTo(d, { scale: 0, opacity: 1, y: 0 }, { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, t + i * 0.06)); return api; };
    api.out = function (tl, t) { drops.forEach((d) => tl.fromTo(d, { scale: 1 }, { scale: 0, duration: 0.2, ease: 'back.in(2)', immediateRender: false }, t)); return api; };
    return api;
  };

  window.Props = Props;
})();
