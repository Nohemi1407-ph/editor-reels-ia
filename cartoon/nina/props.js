/* props.js — flat-vector props (no outlines, soft same-hue shading) for the cartoon template.
 * Every factory: Props.name(parent, {x, y, scale, rot, ...}) -> api { w (positioned wrapper), b (body pivot at 0,0), ...parts }
 * Generic animators live on every api: pop(tl,t,d), out(tl,t,d), float(tl,t0,t1,amp,half), bounce(tl,t).
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const FONT = "'Inter Tight', sans-serif";
  const C = {
    pink: '#EE4E84', pinkD: '#C93467', mag: '#DB3270', yellow: '#FFD23F', yellowD: '#E8B321', mint: '#A3CFA8', mintD: '#7FB489',
    teal: '#3E8E92', tealD: '#2D6E72', navy: '#25305E', navyD: '#1A2347', purple: '#7344A8', purpleD: '#57318B',
    white: '#FFFFFF', off: '#F4EEE6', offD: '#DED5CA', red: '#F2424E', redD: '#C92E3A', orange: '#F5922A', orangeD: '#D9761A',
    green: '#3CC879', greenD: '#27A35E', blue: '#4F8DF0', blueD: '#356FCC', grey: '#C7CEDD', greyD: '#A6AFC4', skin: '#F7CBA6', skinD: '#E9A884',
    ink: '#24203A'
  };
  function E(tag, a, p) { const n = document.createElementNS(NS, tag); if (a) for (const k in a) if (a[k] != null) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; }
  const G = (p, a) => E('g', a || {}, p);
  const R = (p, x, y, w, h, rx, fill, ex) => E('rect', Object.assign({ x, y, width: w, height: h, rx: rx || 0, fill }, ex || {}), p);
  const Ci = (p, cx, cy, r, fill, ex) => E('circle', Object.assign({ cx, cy, r, fill }, ex || {}), p);
  const Pa = (p, d, fill, ex) => E('path', Object.assign({ d, fill }, ex || {}), p);
  const St = (p, d, col, w, ex) => E('path', Object.assign({ d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ex || {}), p);
  function Tx(p, x, y, str, size, fill, ex) {
    const t = E('text', Object.assign({ x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': FONT, 'font-weight': 900, 'font-size': size, fill }, ex || {}), p);
    t.textContent = str; return t;
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function mk(parent, o) {
    const w = G(parent), b = G(w);
    gsap.set(w, { x: o.x || 0, y: o.y || 0 });
    gsap.set(b, { scale: o.scale || 1, rotation: o.rot || 0, svgOrigin: '0 0' });
    const api = { w, b, s: o.scale || 1, r: o.rot || 0 };
    api.pop = function (tl, t, d) {
      d = d || 0.4;
      gsap.set(b, { scale: 0 });
      tl.fromTo(b, { scale: 0, rotation: api.r - 14 }, { scale: api.s, rotation: api.r, duration: d, ease: 'back.out(2.2)', immediateRender: false }, t);
      return api;
    };
    api.out = function (tl, t, d) {
      tl.fromTo(b, { scale: api.s }, { scale: 0, duration: d || 0.22, ease: 'back.in(2)', immediateRender: false }, t);
      return api;
    };
    api.bounce = function (tl, t) {
      tl.fromTo(b, { scale: api.s }, { scale: api.s * 1.14, duration: 0.09, ease: 'power2.out', immediateRender: false }, t);
      tl.fromTo(b, { scale: api.s * 1.14 }, { scale: api.s, duration: 0.4, ease: 'elastic.out(1.1,0.4)', immediateRender: false }, t + 0.09);
      return api;
    };
    api.float = function (tl, t0, t1, amp, half) {
      amp = amp == null ? 10 : amp; half = half || 0.7;
      let n = Math.floor((t1 - t0) / half); if (n % 2) n -= 1; if (n < 2) return api;
      tl.fromTo(w, { y: o.y || 0 }, { y: (o.y || 0) - amp, duration: half, ease: 'sine.inOut', repeat: n - 1, yoyo: true, immediateRender: false }, t0);
      return api;
    };
    return api;
  }
  const Props = {};
  Props.C = C;

  // ---------------------------------------------------------------- little shop (anchor bottom-center, ~300x330)
  Props.shop = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -150, -230, 300, 230, 6, C.off);
    R(b, 60, -230, 90, 230, 0, C.offD, { opacity: 0.6 });
    R(b, -46, -150, 92, 150, 8, C.teal); R(b, -46, -150, 46, 150, 0, C.tealD, { opacity: 0.4 });
    Ci(b, 30, -74, 6, C.yellow);
    R(b, -132, -150, 70, 70, 8, '#BFE3F0'); R(b, 62, -150, 70, 70, 8, '#BFE3F0');
    Pa(b, 'M -132 -150 L -96 -150 L -132 -114 Z', '#fff', { opacity: 0.6 }); Pa(b, 'M 62 -150 L 98 -150 L 62 -114 Z', '#fff', { opacity: 0.6 });
    // awning
    const aw = G(b);
    for (let i = 0; i < 6; i++) {
      const x = -170 + i * 340 / 6;
      Pa(aw, `M ${x} -300 L ${x + 340 / 6} -300 L ${x + 340 / 6} -236 Q ${x + 170 / 6} -206 ${x} -236 Z`, i % 2 ? '#fff' : C.pink);
    }
    R(b, -176, -322, 352, 28, 10, C.pinkD);
    a.sign = G(b); R(a.sign, -60, -372, 120, 44, 12, C.navy); Tx(a.sign, 0, -349, 'SHOP', 28, C.yellow);
    a.ground = R(b, -190, -6, 380, 12, 6, '#000', { opacity: 0.12 });
    return a;
  };
  // ---------------------------------------------------------------- AI chip (center, ~150)
  Props.chip = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    for (let i = 0; i < 4; i++) {
      const d = -45 + i * 30;
      R(b, d - 6, -88, 12, 26, 4, C.grey); R(b, d - 6, 62, 12, 26, 4, C.grey);
      R(b, -88, d - 6, 26, 12, 4, C.grey); R(b, 62, d - 6, 26, 12, 4, C.grey);
    }
    R(b, -68, -68, 136, 136, 22, C.navy); R(b, -68, 20, 136, 48, 0, C.navyD, { opacity: 0.5 });
    R(b, -50, -50, 100, 100, 14, C.purple);
    a.label = Tx(b, 0, 2, 'IA', 62, C.yellow);
    return a;
  };
  // ---------------------------------------------------------------- rocket (center ~ body middle; ~140x300)
  Props.rocket = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    a.flame = G(b);
    Pa(a.flame, 'M -30 80 Q 0 210 30 80 Z', C.orange); Pa(a.flame, 'M -18 80 Q 0 160 18 80 Z', C.yellow);
    Pa(b, 'M -50 30 L -96 96 L -96 120 L -40 90 Z', C.pink); Pa(b, 'M 50 30 L 96 96 L 96 120 L 40 90 Z', C.pinkD);
    Pa(b, 'M 0 -150 C 60 -100 62 20 46 90 L -46 90 C -62 20 -60 -100 0 -150 Z', C.white);
    Pa(b, 'M 0 -150 C 60 -100 62 20 46 90 L 18 90 C 30 20 30 -90 0 -150 Z', C.offD, { opacity: 0.7 });
    Pa(b, 'M 0 -150 C 26 -132 40 -112 46 -92 L -46 -92 C -40 -112 -26 -132 0 -150 Z', C.pink);
    Ci(b, 0, -20, 30, C.teal); Ci(b, 0, -20, 20, '#BFE3F0'); Pa(b, 'M -12 -32 A 16 16 0 0 1 8 -36', 'none', { stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' });
    R(b, -14, 70, 28, 34, 4, C.pinkD);
    return a;
  };
  // ---------------------------------------------------------------- building block (bottom-center, 110)
  Props.block = function (parent, o) {
    const a = mk(parent, o), b = a.b, c = o.color || C.yellow, cd = o.dark || C.yellowD;
    R(b, -55, -110, 110, 110, 14, c); R(b, -55, -24, 110, 24, 0, cd, { opacity: 0.6 }); R(b, 25, -110, 30, 110, 0, cd, { opacity: 0.35 });
    if (o.label) Tx(b, 0, -58, o.label, 58, '#fff');
    return a;
  };
  // ---------------------------------------------------------------- coin (center, r 44)
  Props.coin = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    Ci(b, 0, 0, 46, C.yellowD); Ci(b, -3, -3, 42, C.yellow); Ci(b, -3, -3, 30, '#FFE27A');
    Tx(b, -3, -1, '$', 46, C.yellowD);
    return a;
  };
  // ---------------------------------------------------------------- trend arrow (bottom-left origin, ~300x220)
  Props.trend = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    a.line = St(b, 'M -150 90 L -60 10 L 0 50 L 120 -80', C.green, 34);
    Pa(b, 'M 70 -110 L 160 -120 L 150 -30 Z', C.green);
    return a;
  };
  // ---------------------------------------------------------------- chat bubble (center, ~260x190)
  Props.chat = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    Pa(b, 'M -120 -90 Q -130 -90 -130 -80 L -130 50 Q -130 60 -120 60 L -60 60 L -90 104 L -20 60 L 120 60 Q 130 60 130 50 L 130 -80 Q 130 -90 120 -90 Z', C.white);
    R(b, -130, 30, 260, 30, 0, C.offD, { opacity: 0.5 });
    a.dots = [-60, 0, 60].map((x) => Ci(b, x, -16, 18, C.teal));
    return a;
  };
  // ---------------------------------------------------------------- image icon (center, 240x190)
  Props.image = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -120, -95, 240, 190, 22, C.white); R(b, -100, -75, 200, 150, 12, '#BFE3F0');
    Ci(b, 50, -36, 22, C.yellow);
    Pa(b, 'M -100 75 L -40 -10 L 10 50 L 40 20 L 100 75 Z', C.mintD); Pa(b, 'M -100 75 L -40 -10 L -20 75 Z', C.green, { opacity: 0.5 });
    return a;
  };
  // ---------------------------------------------------------------- icon tiles (center, 200 square)
  function tile(b, col, dark) { R(b, -100, -100, 200, 200, 40, col); R(b, -100, 40, 200, 60, 0, dark, { opacity: 0.35, 'clip-path': null }); }
  Props.video = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -100, -100, 200, 200, 40, C.red); Pa(b, 'M -100 40 L 100 40 L 100 60 Q 100 100 60 100 L -60 100 Q -100 100 -100 60 Z', C.redD, { opacity: 0.6 });
    Pa(b, 'M -30 -50 L 55 0 L -30 50 Z', '#fff');
    return a;
  };
  Props.apps = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -78, -130, 156, 260, 26, C.navy); R(b, -64, -106, 128, 206, 12, '#BFE3F0');
    const cols = [C.pink, C.yellow, C.green, C.purple, C.orange, C.blue];
    cols.forEach((c, i) => R(b, -50 + (i % 2) * 56, -92 + Math.floor(i / 2) * 62, 44, 44, 12, c));
    Ci(b, 0, 116, 7, C.grey);
    return a;
  };
  function gearD(ro, ri, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2, r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + (Math.cos(a0) * r).toFixed(1) + ' ' + (Math.sin(a0) * r).toFixed(1) + ' L' + (Math.cos(a1) * r).toFixed(1) + ' ' + (Math.sin(a1) * r).toFixed(1) + ' ';
    }
    return d + 'Z';
  }
  Props.gears = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    const g1w = G(b, { transform: 'translate(-40,-20)' }), g2w = G(b, { transform: 'translate(72,62)' });
    a.g1 = G(g1w); a.g2 = G(g2w);
    Pa(a.g1, gearD(96, 76, 10), C.blue); Ci(a.g1, 0, 0, 34, C.blueD); Ci(a.g1, 0, 0, 16, '#fff');
    Pa(a.g2, gearD(62, 48, 8), C.yellow); Ci(a.g2, 0, 0, 22, C.yellowD); Ci(a.g2, 0, 0, 10, '#fff');
    a.spin = function (tl, t0, t1, turns) {
      tl.fromTo(a.g1, { rotation: 0 }, { rotation: 360 * turns, duration: t1 - t0, ease: 'none', immediateRender: false, svgOrigin: '0 0' }, t0);
      tl.fromTo(a.g2, { rotation: 0 }, { rotation: -360 * turns * 1.55, duration: t1 - t0, ease: 'none', immediateRender: false, svgOrigin: '0 0' }, t0);
    };
    return a;
  };
  Props.tools = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    const w1 = G(b, { transform: 'rotate(45)' });
    R(w1, -16, -40, 32, 170, 16, C.grey); R(w1, 4, -40, 12, 170, 6, C.greyD);
    Pa(w1, 'M -44 -70 C -44 -112 44 -112 44 -70 L 44 -50 C 44 -30 16 -26 16 -40 L 16 -80 L -16 -80 L -16 -40 C -16 -26 -44 -30 -44 -50 Z', C.grey);
    const w2 = G(b, { transform: 'rotate(-45)' });
    R(w2, -10, -150, 20, 120, 6, C.greyD); R(w2, -24, -40, 48, 150, 20, C.orange); R(w2, 6, -40, 18, 150, 9, C.orangeD);
    return a;
  };
  Props.bulb = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    a.rays = G(b);
    for (let i = 0; i < 8; i++) { const an = i * 45 * Math.PI / 180; St(a.rays, `M ${(Math.sin(an) * 118).toFixed(1)} ${(-Math.cos(an) * 118 - 20).toFixed(1)} L ${(Math.sin(an) * 150).toFixed(1)} ${(-Math.cos(an) * 150 - 20).toFixed(1)}`, C.yellow, 14); }
    Pa(b, 'M 0 -110 C 60 -110 92 -64 92 -20 C 92 20 60 40 50 70 L -50 70 C -60 40 -92 20 -92 -20 C -92 -64 -60 -110 0 -110 Z', C.yellow);
    Pa(b, 'M 40 -96 C 80 -76 92 -40 88 -10 C 84 20 60 40 50 70 L 30 70 C 40 40 70 10 60 -40 C 56 -64 48 -84 40 -96 Z', C.yellowD, { opacity: 0.55 });
    Pa(b, 'M -50 -60 Q -40 -84 -14 -90', 'none', { stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.8 });
    R(b, -46, 70, 92, 22, 8, C.grey); R(b, -40, 94, 80, 20, 8, C.greyD); R(b, -24, 116, 48, 16, 8, C.grey);
    return a;
  };
  // ---------------------------------------------------------------- code card with cross (center, 300x210)
  Props.code = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -150, -105, 300, 210, 26, C.navy); R(b, -150, -105, 300, 40, 20, C.navyD);
    [[-120, C.red], [-92, C.yellow], [-64, C.green]].forEach(([x, c]) => Ci(b, x, -85, 9, c));
    Tx(b, 0, 22, '</>', 108, C.mint);
    a.cross = G(b);
    a.x1 = St(a.cross, 'M -150 -130 L 150 130', C.red, 30); a.x2 = St(a.cross, 'M 150 -130 L -150 130', C.red, 30);
    [a.x1, a.x2].forEach((p) => { p.setAttribute('stroke-dasharray', '400'); p.setAttribute('stroke-dashoffset', '400'); });
    a.crossOut = function (tl, t) {
      tl.fromTo(a.x1, { attr: { 'stroke-dashoffset': 400 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.16, ease: 'power2.out', immediateRender: false }, t);
      tl.fromTo(a.x2, { attr: { 'stroke-dashoffset': 400 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.16, ease: 'power2.out', immediateRender: false }, t + 0.12);
    };
    return a;
  };
  // ---------------------------------------------------------------- calendar (center, 300x320)
  Props.calendar = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -150, -140, 300, 300, 34, C.white); R(b, -150, 100, 300, 60, 0, C.offD, { opacity: 0.6, rx: 0 });
    Pa(b, 'M -150 -40 L -150 -106 Q -150 -140 -116 -140 L 116 -140 Q 150 -140 150 -106 L 150 -40 Z', C.red);
    Tx(b, 0, -88, 'OCT', 64, '#fff');
    Tx(b, 0, 58, '31', 150, C.navy);
    R(b, -96, -172, 24, 60, 12, C.navyD); R(b, 72, -172, 24, 60, 12, C.navyD);
    return a;
  };
  // ---------------------------------------------------------------- confetti burst (center)
  Props.confetti = function (parent, o) {
    const a = mk(parent, o), b = a.b, r = rng(o.seed || 7);
    const cols = [C.pink, C.yellow, C.green, C.blue, C.orange, '#fff', C.purple];
    a.bits = [];
    for (let i = 0; i < (o.n || 46); i++) {
      const g = G(b), c = cols[i % cols.length];
      if (i % 3 === 0) Ci(g, 0, 0, 9 + r() * 6, c); else R(g, -8, -16, 16, 32, 4, c);
      gsap.set(g, { opacity: 0 });
      a.bits.push({ g, ang: r() * Math.PI * 2, dist: 260 + r() * 420, rot: (r() - 0.5) * 900, fall: 200 + r() * 360 });
    }
    a.burst = function (tl, t, dur) {
      dur = dur || 1.8;
      a.bits.forEach((q, i) => {
        const dx = Math.cos(q.ang) * q.dist, dy = Math.sin(q.ang) * q.dist * 0.75 - 140;
        tl.fromTo(q.g, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 0.4 }, { x: dx, y: dy, rotation: q.rot * 0.5, scale: 1, duration: 0.5, ease: 'power3.out', immediateRender: false }, t);
        tl.fromTo(q.g, { y: dy }, { y: dy + q.fall, rotation: q.rot, duration: dur - 0.5, ease: 'sine.in', immediateRender: false }, t + 0.5);
        tl.fromTo(q.g, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, t + dur - 0.3);
      });
    };
    return a;
  };
  // ---------------------------------------------------------------- sparkle (center)
  Props.sparkle = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    Pa(b, 'M 0 -60 C 6 -14 14 -6 60 0 C 14 6 6 14 0 60 C -6 14 -14 6 -60 0 C -14 -6 -6 -14 0 -60 Z', o.color || C.yellow);
    gsap.set(b, { scale: 0 });
    a.twinkle = function (tl, t) {
      tl.fromTo(b, { scale: 0, rotation: -40 }, { scale: a.s, rotation: 0, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, t);
      tl.fromTo(b, { scale: a.s }, { scale: 0, rotation: 40, duration: 0.3, ease: 'power2.in', immediateRender: false }, t + 0.45);
    };
    return a;
  };
  // ---------------------------------------------------------------- model card 1/2/3 (center, 220x280)
  Props.card = function (parent, o) {
    const a = mk(parent, o), b = a.b, c = o.color || C.pink, cd = o.dark || C.pinkD;
    R(b, -110, -140, 220, 280, 30, C.white); R(b, -110, 90, 220, 50, 0, C.offD, { opacity: 0.5 });
    Ci(b, 0, -40, 74, c); Pa(b, 'M 52 -92 A 74 74 0 0 1 0 34 A 74 74 0 0 0 52 -92 Z', cd, { opacity: 0.4 });
    Tx(b, 0, -36, o.n, 100, '#fff');
    R(b, -70, 66, 140, 16, 8, C.offD); R(b, -50, 96, 100, 16, 8, C.offD);
    return a;
  };
  // ---------------------------------------------------------------- desk with laptop (anchor bottom-center ~ 520 wide)
  Props.desk = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -260, -190, 520, 34, 10, '#C98B5E'); R(b, -260, -168, 520, 12, 0, '#A86F47');
    R(b, -230, -160, 30, 160, 6, '#A86F47'); R(b, 200, -160, 30, 160, 6, '#A86F47');
    // laptop facing viewer (screen)
    const lp = G(b);
    R(lp, -150, -420, 300, 200, 18, C.navy); a.screen = G(lp);
    R(a.screen, -134, -404, 268, 168, 8, '#1F2A4F');
    a.bars = [0, 1, 2, 3].map((i) => R(a.screen, -112, -380 + i * 36, 0, 20, 8, [C.mint, C.yellow, C.pink, C.blue][i]));
    Pa(lp, 'M -180 -200 L 180 -200 L 160 -220 L -160 -220 Z', C.grey); R(lp, -180, -202, 360, 14, 6, C.greyD);
    a.build = function (tl, t0, t1) {
      const ws = [180, 140, 200, 110], n = a.bars.length, step = (t1 - t0) / n;
      a.bars.forEach((r, i) => tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: ws[i] }, duration: step * 0.9, ease: 'power2.out', immediateRender: false }, t0 + i * step));
    };
    return a;
  };
  // ---------------------------------------------------------------- REC pill (center ~ 230x80)
  Props.rec = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -115, -42, 230, 84, 42, C.navy);
    a.dot = Ci(b, -62, 0, 22, C.red);
    Tx(b, 26, 2, 'REC', 50, '#fff');
    a.blink = function (tl, t0, t1) { for (let t = t0; t + 0.5 < t1; t += 0.6) { tl.set(a.dot, { attr: { opacity: 0.15 } }, t + 0.3); tl.set(a.dot, { attr: { opacity: 1 } }, t + 0.6 - 0.002); } };
    return a;
  };
  // ---------------------------------------------------------------- heart (center, ~180)
  Props.heart = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    Pa(b, 'M 0 80 C -110 10 -110 -80 -50 -86 C -20 -88 0 -64 0 -50 C 0 -64 20 -88 50 -86 C 110 -80 110 10 0 80 Z', o.color || C.pink);
    Pa(b, 'M 0 80 C 60 40 96 0 92 -40 C 80 0 50 30 0 60 Z', C.pinkD, { opacity: 0.5 });
    Pa(b, 'M -60 -50 Q -56 -70 -36 -72', 'none', { stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.7 });
    return a;
  };
  // ---------------------------------------------------------------- seats grid (center); fill one by one
  Props.seats = function (parent, o) {
    const a = mk(parent, o), b = a.b, cols = o.cols || 5, rows = o.rows || 4, gx = 92, gy = 100;
    a.seats = [];
    for (let i = 0; i < cols * rows; i++) {
      const cx = (i % cols - (cols - 1) / 2) * gx, cy = (Math.floor(i / cols) - (rows - 1) / 2) * gy;
      const g = G(b, { transform: `translate(${cx},${cy})` });
      const base = G(g);
      R(base, -30, -38, 60, 52, 16, 'rgba(255,255,255,0.45)'); R(base, -36, 6, 72, 20, 10, 'rgba(255,255,255,0.45)');
      const on = G(g, { opacity: 0 });
      R(on, -30, -38, 60, 52, 16, C.pink); R(on, -36, 6, 72, 20, 10, C.pinkD); R(on, -30, -38, 18, 52, 9, C.mag, { opacity: 0.4 });
      a.seats.push({ g, on });
    }
    a.fill = function (tl, t0, t1) {
      const n = a.seats.length, step = (t1 - t0) / n;
      a.seats.forEach((q, i) => {
        tl.set(q.on, { attr: { opacity: 1 } }, t0 + i * step);
        tl.fromTo(q.on, { scale: 0.4 }, { scale: 1, duration: 0.22, ease: 'back.out(3)', immediateRender: false, svgOrigin: '0 0' }, t0 + i * step);
      });
    };
    return a;
  };
  // ---------------------------------------------------------------- price tag (pivot at the hole, hangs down)
  Props.tag = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    St(b, 'M 0 -120 L 0 -20', C.navy, 6);
    Pa(b, 'M 0 -40 L 120 30 L 120 260 Q 120 290 90 290 L -90 290 Q -120 290 -120 260 L -120 30 Z', C.yellow);
    Pa(b, 'M 60 -5 L 120 30 L 120 260 Q 120 290 90 290 L 60 290 Z', C.yellowD, { opacity: 0.5 });
    Ci(b, 0, 20, 16, C.navy);
    a.label = Tx(b, 0, 170, o.text || '$0', 104, C.navy);
    return a;
  };
  // ---------------------------------------------------------------- CTA button (center)
  Props.cta = function (parent, o) {
    const a = mk(parent, o), b = a.b, w = o.w || 620, h = o.h || 210;
    R(b, -w / 2, -h / 2 + 16, w, h, h / 2.4, C.pinkD);
    a.face = G(b);
    R(a.face, -w / 2, -h / 2, w, h, h / 2.4, C.pink);
    R(a.face, -w / 2 + 24, -h / 2 + 14, w - 48, 22, 11, '#fff', { opacity: 0.25 });
    (o.lines || ['RESERVA', 'TU LUGAR']).forEach((s, i, arr) => Tx(a.face, 0, (i - (arr.length - 1) / 2) * 76 + 4, s, 72, '#fff'));
    a.ripple = Ci(b, 0, 0, 10, '#fff', { opacity: 0 });
    a.press = function (tl, t, px, py) {
      tl.fromTo(a.face, { y: 0 }, { y: 14, duration: 0.08, ease: 'power2.in', immediateRender: false }, t);
      tl.fromTo(a.face, { y: 14 }, { y: 0, duration: 0.25, ease: 'back.out(3)', immediateRender: false }, t + 0.1);
      tl.fromTo(a.ripple, { attr: { cx: px || 0, cy: py || 0, r: 10, opacity: 0.6 } }, { attr: { cx: px || 0, cy: py || 0, r: 220, opacity: 0 }, duration: 0.5, ease: 'power2.out', immediateRender: false }, t + 0.04);
    };
    return a;
  };
  // ---------------------------------------------------------------- tapping finger (fingertip at 0,0, hand below)
  Props.finger = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    R(b, -40, 120, 80, 120, 10, C.mag);
    Pa(b, 'M -16 10 C -16 -8 16 -8 16 10 L 16 70 L 50 74 C 70 78 72 100 70 120 L -46 120 C -56 96 -52 76 -40 70 L -16 66 Z', C.skin);
    Pa(b, 'M 16 70 L 50 74 C 70 78 72 100 70 120 L 46 120 C 48 100 46 86 16 84 Z', C.skinD, { opacity: 0.6 });
    St(b, 'M 16 84 L 16 100 M 38 84 L 38 100', C.skinD, 4);
    return a;
  };
  // ---------------------------------------------------------------- down arrow (center)
  Props.arrowDown = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    Pa(b, 'M -24 -60 L 24 -60 L 24 0 L 56 0 L 0 62 L -56 0 L -24 0 Z', o.color || C.yellow);
    return a;
  };
  // ---------------------------------------------------------------- arrow right (center)
  Props.arrowRight = function (parent, o) {
    const a = mk(parent, o), b = a.b;
    Pa(b, 'M -80 -22 L 20 -22 L 20 -56 L 86 0 L 20 56 L 20 22 L -80 22 Z', o.color || C.yellow);
    return a;
  };
  window.Props = Props;
})();
