/* character.js — "Host" flat-vector character rig for HyperFrames (SVG + GSAP).
 * Plain browser JS. Attaches window.Girl.
 *
 *   const g = Girl.create(parentSvgGroup, { id:'host', x:540, y:1700, scale:1.5, flip:false });
 *   g.face(tl, t, 'happy');  g.talk(tl, t0, t1);  g.blink(tl, t);  g.autoBlink(tl, t0, t1);
 *   g.pose(tl, t, 'wave', 0.25);  g.waveHand(tl, t0, t1);  g.bob(tl, t0, t1, 6);  g.jump(tl, t, 60);
 *   g.slump(tl, t, true);  g.prop(tl, t, 'phone', true);  g.root  g.props.phone  g.props.mug
 *
 * Local units: feet at (0,0), hair top at y=-696 (bun to -740). At scale 1 she is ~700px tall.
 * "R" = HER right arm = screen-left when flip:false (screen-right when flip:true).
 * Every animated element has a stable id prefixed with opts.id. Pivots are explicit:
 * each limb is <g transform="translate(pivot)"><g id=... transform="rotate(a)">, and the rig only
 * tweens the SVG transform ATTRIBUTE (attr plugin), never GSAP svgOrigin, so nothing drifts.
 * Everything is a pure function of the timeline (seeded randomness, no timers).
 */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  var C = {
    ink: '#1d1b2e', skin: '#F08A6C', skinD: '#D9694F', cheek: '#F4677A',
    hair: '#26233D', hairG: '#5F5C8E', blue: '#2F4FC0', blueD: '#223A9C', white: '#FFFFFF',
    jean: '#8EC5F5', jeanD: '#5E9BDD', jeanL: '#B8DBFA', shoe: '#FFD93B', shoeD: '#E5B21E',
    pink: '#FF5FA2', pinkD: '#D63F84', gold: '#F2B33D', mouth: '#7A1F3D', tongue: '#F2607A',
    sweat: '#8EC5F5', anger: '#FF3B5C', phone: '#2B2940', screen: '#9AD7FF', coffee: '#7A4A33',
    shadow: '#1d1b2e'
  };
  var SW = 5.5;            // main outline width (canvas px at scale 1)
  var U = 112, F = 106;    // upper arm / forearm length
  var SH = { R: [-60, -455], L: [60, -455] };   // shoulder pivots
  var NECK = 498;          // head pivot y (negative)
  var EYE = { l: [-33, -578], r: [33, -578] };
  var MOUTH_Y = -532;

  var EXPRESSIONS = ['neutral', 'happy', 'grin', 'worried', 'shout', 'annoyed', 'scared', 'tired', 'surprised', 'wink', 'proud'];

  // ---------------------------------------------------------------- svg helpers
  function f2(n) { return Math.round(n * 100) / 100; }
  function shape(d, fill, sw, extra) {
    return '<path d="' + d + '" fill="' + fill + '" stroke="' + C.ink + '" stroke-width="' + (sw == null ? SW : sw) +
      '" stroke-linejoin="round" stroke-linecap="round"' + (extra ? ' ' + extra : '') + '/>';
  }
  function fillOnly(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra ? ' ' + extra : '') + '/>'; }
  function stroke(d, color, w, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra ? ' ' + extra : '') + '/>';
  }
  // mirror an absolute path (M L C Q S T H V Z only) across x=0
  function mx(d) {
    return d.replace(/([MLCQSTHVZ])([^MLCQSTHVZ]*)/g, function (m, c, args) {
      var a = args.trim();
      var nums = a.length ? a.split(/[\s,]+/).map(Number) : [];
      if (c === 'H') nums = nums.map(function (n) { return -n; });
      else if (c !== 'V' && c !== 'Z') nums = nums.map(function (n, i) { return i % 2 === 0 ? -n : n; });
      return c + ' ' + nums.join(' ') + ' ';
    });
  }
  // fill + open outline (no stroke on the closing edge: used for hands so the wrist has no seam)
  function openShape(d, fill, sw) { return fillOnly(d + ' Z', fill) + stroke(d, C.ink, sw || 4.5); }

  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // ---------------------------------------------------------------- face parts
  // eye drawn around (0,0). s = -1 screen-left eye, +1 screen-right eye. inner (nose side) = -s.
  function eye(P, key, s, o) {
    if (o.type === 'up') {   // closed happy arc
      return stroke('M -15 7 Q 0 -15 15 7', C.ink, 6) + stroke('M ' + (s * 15) + ' 7 L ' + (s * 22) + ' 3', C.ink, 4);
    }
    if (o.type === 'down') {  // closed relaxed
      return stroke('M -15 0 Q 0 10 15 0', C.ink, 6) + stroke('M ' + (s * 15) + ' 0 L ' + (s * 21) + ' -4', C.ink, 4);
    }
    var rx = o.rx || 16, ry = o.ry || 20, pr = o.pr || 7.5, px = o.px || 0, py = (o.py == null ? 2 : o.py);
    var cid = P + '-ec-' + key;
    var m = '<clipPath id="' + cid + '"><ellipse rx="' + rx + '" ry="' + ry + '"/></clipPath>';
    m += '<ellipse rx="' + rx + '" ry="' + ry + '" fill="#fff"/>';
    m += '<circle cx="' + px + '" cy="' + py + '" r="' + pr + '" fill="' + C.ink + '"/>';
    m += '<circle cx="' + f2(px - pr * 0.38) + '" cy="' + f2(py - pr * 0.42) + '" r="' + f2(Math.max(1.7, pr * 0.36)) + '" fill="#fff"/>';
    var lx, ly;
    if (o.lid) {
      var yi = o.lid[0], yo = o.lid[1], xi = -s * (rx + 6), xo = s * (rx + 6);
      m += '<g clip-path="url(#' + cid + ')">' + fillOnly('M ' + xi + ' ' + yi + ' L ' + xo + ' ' + yo + ' L ' + xo + ' ' + (-ry - 10) + ' L ' + xi + ' ' + (-ry - 10) + ' Z', C.skin) +
        stroke('M ' + xi + ' ' + yi + ' L ' + xo + ' ' + yo, C.ink, 5) + '</g>';
      var yy = yo + (yi - yo) * 0.08;
      var q = Math.max(0, 1 - (yy * yy) / (ry * ry));
      lx = s * rx * Math.sqrt(q); ly = yy;
    } else {
      lx = s * rx * 0.74; ly = -ry * 0.67;
    }
    m += '<ellipse rx="' + rx + '" ry="' + ry + '" fill="none" stroke="' + C.ink + '" stroke-width="4.5"/>';
    // lashes at the outer top corner
    m += stroke('M ' + f2(lx) + ' ' + f2(ly) + ' L ' + f2(lx + s * 8) + ' ' + f2(ly - 6), C.ink, 4);
    m += stroke('M ' + f2(lx + s * 3) + ' ' + f2(ly + 6) + ' L ' + f2(lx + s * 11) + ' ' + f2(ly + 3), C.ink, 4);
    return m;
  }
  // brow: [innerY, outerY, arch, width]
  function brow(s, b) {
    var xi = s * 16, xo = s * 52, xm = s * 34;
    var ym = Math.min(b[0], b[1]) - b[2];
    return stroke('M ' + xo + ' ' + b[1] + ' Q ' + xm + ' ' + ym + ' ' + xi + ' ' + b[0], C.ink, b[3] || 7);
  }
  // open mouth with clipped teeth/tongue. o: {teeth:y, tongue:[cx,cy,rx,ry]}
  function mOpen(P, key, d, o) {
    o = o || {};
    var cid = P + '-mc-' + key;
    var m = '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>';
    m += fillOnly(d, C.mouth);
    m += '<g clip-path="url(#' + cid + ')">';
    if (o.teeth != null) m += '<rect x="-40" y="-40" width="80" height="' + (40 + o.teeth) + '" fill="#fff"/>' + stroke('M -40 ' + o.teeth + ' L 40 ' + o.teeth, C.ink, 3);
    if (o.tongue) m += '<ellipse cx="' + o.tongue[0] + '" cy="' + o.tongue[1] + '" rx="' + o.tongue[2] + '" ry="' + o.tongue[3] + '" fill="' + C.tongue + '"/>';
    m += '</g>';
    m += stroke(d + '', C.ink, 5);
    return m;
  }
  function mLine(d, w) { return stroke(d, C.ink, w || 5); }
  function sweat(x, y, sc) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">' +
      shape('M 0 -15 C 6 -5 11 1 11 7 C 11 14 6 18 0 18 C -6 18 -11 14 -11 7 C -11 1 -6 -5 0 -15 Z', C.sweat, 4) +
      fillOnly('M -5 6 C -5 3 -3 0 -2 -1 C -2 3 -3 6 -2 9 Z', '#fff') + '</g>';
  }
  function anger(x, y, sc) {
    var d = 'M -11 -3 Q -3 -3 -3 -11 M 3 -11 Q 3 -3 11 -3 M 11 3 Q 3 3 3 11 M -3 11 Q -3 3 -11 3';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">' + stroke(d, C.ink, 9) + stroke(d, C.anger, 4.5) + '</g>';
  }

  // Expression table. eyes: [screen-left, screen-right]; brows idem: [innerY, outerY, arch, w]
  var EX = {
    neutral: {
      eyes: [{ type: 'open' }, { type: 'open' }],
      brows: [[-611, -613, 6], [-611, -613, 6]],
      mC: function () { return mLine('M -13 -2 Q 0 8 13 -2'); },
      mO: function (P) { return mOpen(P, 'neutralO', 'M -13 -3 Q 0 0 13 -3 Q 11 14 0 15 Q -11 14 -13 -3 Z', { tongue: [0, 15, 9, 6] }); }
    },
    happy: {
      eyes: [{ type: 'up' }, { type: 'up' }],
      brows: [[-617, -617, 7], [-617, -617, 7]],
      mC: function () { return mLine('M -21 -5 Q 0 16 21 -5') + mLine('M -23 -8 L -19 -3', 4) + mLine('M 23 -8 L 19 -3', 4); },
      mO: function (P) { return mOpen(P, 'happyO', 'M -21 -6 Q 0 -2 21 -6 Q 17 21 0 22 Q -17 21 -21 -6 Z', { teeth: -1, tongue: [0, 21, 11, 7] }); }
    },
    grin: {
      eyes: [{ type: 'up' }, { type: 'up' }],
      brows: [[-622, -620, 8], [-622, -620, 8]],
      mC: function (P) { return mOpen(P, 'grinC', 'M -27 -9 Q 0 -5 27 -9 Q 23 27 0 29 Q -23 27 -27 -9 Z', { teeth: 0, tongue: [0, 28, 15, 10] }); },
      mO: function (P) { return mOpen(P, 'grinO', 'M -27 -9 Q 0 -5 27 -9 Q 23 27 0 29 Q -23 27 -27 -9 Z', { teeth: 0, tongue: [0, 28, 15, 10] }); }
    },
    worried: {
      eyes: [{ type: 'open', pr: 7, py: -1, lid: [-21, -13] }, { type: 'open', pr: 7, py: -1, lid: [-21, -13] }],
      brows: [[-625, -609, 2], [-625, -609, 2]],
      mC: function () { return mLine('M -13 5 Q -7 -3 0 1 Q 7 5 13 -1'); },
      mO: function (P) { return mOpen(P, 'worriedO', 'M -12 4 Q 0 -6 12 4 Q 9 13 0 13 Q -9 13 -12 4 Z', { tongue: [0, 13, 7, 4] }); },
      fx: function () { return sweat(70, -628, 1); }
    },
    shout: {
      eyes: [{ type: 'open', pr: 7, py: 3, lid: [-3, -17] }, { type: 'open', pr: 7, py: 3, lid: [-3, -17] }],
      brows: [[-600, -621, -1, 8.5], [-600, -621, -1, 8.5]],
      mC: function (P) { return mOpen(P, 'shoutC', 'M -24 -8 Q 0 -13 24 -8 Q 22 22 0 25 Q -22 22 -24 -8 Z', { teeth: -2, tongue: [0, 24, 13, 8] }); },
      mO: function (P) { return mOpen(P, 'shoutO', 'M -26 -10 Q 0 -16 26 -10 Q 24 31 0 35 Q -24 31 -26 -10 Z', { teeth: -4, tongue: [0, 34, 15, 10] }); },
      fx: function () { return anger(60, -652, 1.15); }
    },
    annoyed: {
      eyes: [{ type: 'open', px: 7, py: 6, pr: 7, lid: [-2, -4] }, { type: 'open', px: 7, py: 6, pr: 7, lid: [-4, -2] }],
      brows: [[-605, -609, 1], [-608, -615, 3]],
      mC: function () { return mLine('M -12 2 Q 0 1 12 -2'); },
      mO: function (P) { return mOpen(P, 'annoyedO', 'M -12 0 L 12 -2 Q 10 8 0 8 Q -10 8 -12 0 Z', { tongue: [0, 9, 7, 4] }); }
    },
    scared: {
      eyes: [{ type: 'open', rx: 18, ry: 22, pr: 3.6, py: 0 }, { type: 'open', rx: 18, ry: 22, pr: 3.6, py: 0 }],
      brows: [[-630, -617, 3], [-630, -617, 3]],
      mC: function () { return mLine('M -18 3 Q -13.5 -4 -9 3 Q -4.5 10 0 3 Q 4.5 -4 9 3 Q 13.5 10 18 3', 4.5); },
      mO: function () { return mLine('M -18 3 Q -13.5 -4 -9 3 Q -4.5 10 0 3 Q 4.5 -4 9 3 Q 13.5 10 18 3', 4.5); },
      fx: function () { return sweat(72, -630, 1.05) + sweat(-74, -606, 0.75) + stroke('M -14 -646 L -14 -634 M -4 -648 L -4 -636 M 6 -647 L 6 -635', '#6B86E0', 4); }
    },
    tired: {
      eyes: [{ type: 'open', pr: 7, py: 7, lid: [-7, 1] }, { type: 'open', pr: 7, py: 7, lid: [-7, 1] }],
      brows: [[-611, -603, 2], [-611, -603, 2]],
      mC: function () { return mLine('M -11 4 Q 0 -3 11 4'); },
      mO: function (P) { return mOpen(P, 'tiredO', 'M -10 3 Q 0 -3 10 3 Q 7 11 0 11 Q -7 11 -10 3 Z', { tongue: [0, 11, 6, 4] }); },
      fx: function () { return stroke('M -47 -552 Q -33 -545 -19 -552', C.skinD, 4) + stroke('M 19 -552 Q 33 -545 47 -552', C.skinD, 4) + stroke('M -43 -545 Q -33 -541 -24 -545', C.skinD, 3) + stroke('M 24 -545 Q 33 -541 43 -545', C.skinD, 3); }
    },
    surprised: {
      eyes: [{ type: 'open', rx: 17, ry: 22, pr: 6.5, py: 0 }, { type: 'open', rx: 17, ry: 22, pr: 6.5, py: 0 }],
      brows: [[-631, -627, 9], [-631, -627, 9]],
      mC: function (P) { return mOpen(P, 'surpC', 'M 0 -8 Q 10 -8 10 4 Q 10 17 0 17 Q -10 17 -10 4 Q -10 -8 0 -8 Z', { tongue: [0, 15, 7, 4] }); },
      mO: function (P) { return mOpen(P, 'surpO', 'M 0 -10 Q 11 -10 11 4 Q 11 20 0 20 Q -11 20 -11 4 Q -11 -10 0 -10 Z', { tongue: [0, 18, 8, 5] }); }
    },
    wink: {
      eyes: [{ type: 'open' }, { type: 'up' }],
      brows: [[-615, -616, 7], [-606, -608, 4]],
      mC: function () { return fillOnly('M 4 4 Q 6 15 12 14 Q 17 12 15 1 Z', C.tongue) + stroke('M 4 4 Q 6 15 12 14 Q 17 12 15 1', C.ink, 4) + mLine('M -19 -4 Q 0 12 19 -4'); },
      mO: function (P) { return mOpen(P, 'winkO', 'M -19 -5 Q 0 -1 19 -5 Q 15 18 0 19 Q -15 18 -19 -5 Z', { teeth: -1, tongue: [2, 18, 10, 6] }); }
    },
    proud: {
      eyes: [{ type: 'open', py: 3, lid: [-11, -9] }, { type: 'open', py: 3, lid: [-11, -9] }],
      brows: [[-607, -610, 4], [-623, -621, 8]],
      mC: function () { return mLine('M -13 1 Q 3 8 16 -7') + mLine('M 13 -10 Q 18 -8 18 -3', 4); },
      mO: function (P) { return mOpen(P, 'proudO', 'M -12 0 Q 3 4 16 -7 Q 13 9 1 9 Q -9 9 -12 0 Z', { tongue: [1, 9, 7, 4] }); }
    }
  };

  // ---------------------------------------------------------------- hands (drawn for s=+1; thumb on +x)
  var FIST_D = 'M -14 2 C -18 12 -18 27 -12 33 C -6 39 8 39 13 33 C 18 27 18 12 14 2';
  function fist() {
    return openShape(FIST_D, C.skin) + stroke('M 14 12 C 6 13 1 19 3 26', C.ink, 3.5) +
      stroke('M -8 36 L -8 30', C.ink, 3) + stroke('M 0 38 L 0 31', C.ink, 3) + stroke('M 7 36 L 7 30', C.ink, 3);
  }
  var HANDS = {
    open: function () {
      return shape('M 9 9 C 17 6 26 12 26 21 C 26 28 19 31 15 26 C 13 23 11 21 9 20 Z', C.skin, 4.5) +
        openShape('M -13 2 C -16 14 -17 30 -14 40 C -11 48 -2 51 4 49 C 11 47 15 39 15 29 C 15 18 13 9 12 2', C.skin) +
        stroke('M -7 48 L -7 38', C.ink, 3) + stroke('M 1 50 L 1 39', C.ink, 3) + stroke('M 8 47 L 8 37', C.ink, 3);
    },
    fist: fist,
    point: function () { return shape('M -11 24 L -11 58 C -11 65 -1 65 -1 58 L -1 24 Z', C.skin, 4.5) + fist(); },
    pointFwd: function () {
      return '<g transform="scale(1.18)">' + fist() + shape('M -1 14 C 9 14 13 22 13 29 C 13 37 7 42 -1 42 C -9 42 -15 37 -15 29 C -15 22 -10 14 -1 14 Z', C.skin, 4.5) +
        fillOnly('M -1 20 C 4 20 7 24 7 28 C 7 32 3 34 -1 34 C -5 34 -8 32 -8 28 C -8 24 -5 20 -1 20 Z', '#F7B6A0') + '</g>';
    },
    thumbsUp: function () { return '<g transform="scale(1.15)">' + shape('M 6 4 L 36 1 C 45 1 46 17 37 17 L 6 19 Z', C.skin, 4.5) + fist() + stroke('M 33 2 Q 38 9 34 16', C.skinD, 3) + '</g>'; },
    grip: function () {
      return openShape(FIST_D, C.skin) + stroke('M -14 14 C -4 16 6 16 16 13', C.ink, 3) + stroke('M -15 24 C -4 26 6 26 16 23', C.ink, 3);
    }
  };
  var HAND_NAMES = Object.keys(HANDS);

  // ---------------------------------------------------------------- props (world-oriented, relative to wrist)
  function phoneProp() {
    return '<rect x="-20" y="-80" width="38" height="76" rx="8" fill="' + C.phone + '" stroke="' + C.ink + '" stroke-width="5"/>' +
      '<rect x="-15" y="-74" width="28" height="58" rx="3" fill="' + C.screen + '"/>' +
      '<rect x="-6" y="-71" width="10" height="3.5" rx="1.75" fill="' + C.phone + '"/>' +
      '<rect x="-10" y="-62" width="18" height="5" rx="2.5" fill="#fff"/>' +
      '<rect x="-10" y="-52" width="12" height="5" rx="2.5" fill="#fff"/>';
  }
  function mugProp() {
    return stroke('M 30 -20 C 12 -20 12 8 31 8', C.ink, 12) + stroke('M 30 -20 C 12 -20 12 8 31 8', '#fff', 4.5) +
      shape('M 26 -32 L 72 -32 L 69 14 C 68 20 64 23 58 23 L 40 23 C 34 23 30 20 29 14 Z', '#fff') +
      fillOnly('M 27.6 -12 L 70.7 -12 L 69.9 0 L 28.4 0 Z', C.pink) +
      shape('M 26 -32 L 72 -32 L 69 14 C 68 20 64 23 58 23 L 40 23 C 34 23 30 20 29 14 Z', 'none') +
      '<ellipse cx="49" cy="-32" rx="23" ry="5.5" fill="' + C.coffee + '" stroke="' + C.ink + '" stroke-width="4"/>' +
      stroke('M 42 -44 Q 36 -52 42 -60 Q 48 -68 42 -76', '#C9BEA6', 4) + stroke('M 56 -44 Q 50 -52 56 -60', '#C9BEA6', 4);
  }

  // ---------------------------------------------------------------- arm IK + poses
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  function wrap(a) { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; }
  function dirAngle(dx, dy) { return deg(Math.atan2(-dx, dy)); } // rotate(phi) maps (0,1) to (-sin phi, cos phi)

  function solveArm(side, spec) {
    if (spec.raw) {
      var r = spec.raw;
      return { sh: r.sh, el: r.el, wr: r.wr || 0, ku: r.ku || 1, kf: r.kf || 1, shape: spec.shape, prop: spec.prop || null };
    }
    var sx = SH[side][0], sy = SH[side][1], tx = spec.t[0], ty = spec.t[1];
    var dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
    var k = 1, maxR = (U + F) * 0.985;
    if (d > maxR) k = d / maxR;
    var u = U * k, f = F * k;
    d = Math.max(d, Math.abs(u - f) + 2);
    var ft = dirAngle(dx, dy);
    var ca = Math.min(1, Math.max(-1, (u * u + d * d - f * f) / (2 * u * d)));
    var al = deg(Math.acos(ca));
    var cands = [ft + al, ft - al].map(function (pu) {
      return { pu: pu, ex: sx - u * Math.sin(rad(pu)), ey: sy + u * Math.cos(rad(pu)) };
    });
    var outS = function (c) { return side === 'R' ? -c.ex : c.ex; };
    var scorers = { out: outS, 'in': function (c) { return -outS(c); }, down: function (c) { return c.ey; }, up: function (c) { return -c.ey; } };
    var sc = scorers[spec.bend || 'out'];
    var c = sc(cands[0]) >= sc(cands[1]) ? cands[0] : cands[1];
    var pf = dirAngle(tx - c.ex, ty - c.ey);
    var sh = c.pu;
    if (side === 'R') { while (sh < -90) sh += 360; while (sh >= 270) sh -= 360; }
    else { while (sh > 90) sh -= 360; while (sh <= -270) sh += 360; }
    var ph = spec.hand == null ? pf : spec.hand;
    return { sh: sh, el: wrap(pf - c.pu), wr: wrap(ph - pf), ku: k, kf: k, shape: spec.shape || 'open', prop: spec.prop || null };
  }
  function mir(spec) {
    var o = { bend: spec.bend, shape: spec.shape, prop: spec.prop };
    if (spec.raw) o.raw = { sh: -spec.raw.sh, el: -spec.raw.el, wr: -(spec.raw.wr || 0), ku: spec.raw.ku, kf: spec.raw.kf };
    else { o.t = [-spec.t[0], spec.t[1]]; o.hand = spec.hand == null ? null : -spec.hand; }
    return o;
  }
  var IDLE_R = { t: [-78, -248], bend: 'out', hand: 4, shape: 'open' };
  var POSE_SPECS = {
    idle: { R: IDLE_R, L: mir(IDLE_R) },
    wave: { R: { t: [-152, -612], bend: 'down', hand: 168, shape: 'open' }, L: mir(IDLE_R), head: 3 },
    point: { R: { t: [-228, -505], bend: 'down', shape: 'point' }, L: mir(IDLE_R), head: -3 },
    pointYou: { R: { raw: { sh: 24, el: 146, wr: 10, ku: 0.86, kf: 0.5 }, shape: 'pointFwd' }, L: mir(IDLE_R), head: -2 },
    pointSide: { R: { t: [-236, -462], bend: 'down', shape: 'point' }, L: mir(IDLE_R), head: -3 },
    pointUp: { R: { t: [-112, -642], bend: 'out', hand: 180, shape: 'point' }, L: mir(IDLE_R), head: -2 },
    typing: { R: { t: [-22, -302], bend: 'out', hand: -72, shape: 'open' }, L: { t: [22, -302], bend: 'out', hand: 72, shape: 'open' }, head: 4 },
    holdPhone: { R: { t: [-94, -522], bend: 'out', hand: 180, shape: 'grip', prop: 'phone' }, L: mir(IDLE_R), head: -4 },
    handsOnHips: { R: { t: [-60, -300], bend: 'out', hand: -48, shape: 'fist' }, L: { t: [60, -300], bend: 'out', hand: 48, shape: 'fist' }, head: 0 },
    facepalm: { R: { t: [-58, -578], bend: 'out', hand: -100, shape: 'open' }, L: mir(IDLE_R), head: -7 },
    shrug: { R: { t: [-152, -458], bend: 'down', hand: 140, shape: 'open' }, L: { t: [152, -458], bend: 'down', hand: -140, shape: 'open' }, head: 7 },
    armsUp: { R: { t: [-160, -640], bend: 'out', hand: 162, shape: 'open' }, L: { t: [160, -640], bend: 'out', hand: -162, shape: 'open' }, head: 0 },
    carryOverhead: { R: { t: [-98, -714], bend: 'out', hand: -122, shape: 'open' }, L: { t: [98, -714], bend: 'out', hand: 122, shape: 'open' }, head: 0 },
    thumbsUp: { R: { t: [-118, -452], bend: 'down', hand: -90, shape: 'thumbsUp' }, L: mir(IDLE_R), head: 4 },
    coffee: { R: { t: [-54, -398], bend: 'down', hand: -90, shape: 'grip', prop: 'mug' }, L: mir(IDLE_R), head: 3 },
    juggle: { R: { t: [-142, -482], bend: 'down', hand: 176, shape: 'open' }, L: { t: [142, -482], bend: 'down', hand: -176, shape: 'open' }, head: 0 }
  };
  var POSES = {};
  Object.keys(POSE_SPECS).forEach(function (n) {
    var p = POSE_SPECS[n];
    POSES[n] = { R: solveArm('R', p.R), L: solveArm('L', p.L), head: p.head || 0 };
  });

  // ---------------------------------------------------------------- body markup
  function buildMarkup(P) {
    var m = '';
    var idleR = POSES.idle.R, idleL = POSES.idle.L;

    function vis(on) { return ' opacity="' + (on ? 1 : 0) + '"'; }

    // shadow (does not jump)
    m += '<g id="' + P + '-shadow" transform="scale(1,1)"><ellipse cx="0" cy="0" rx="112" ry="13" fill="' + C.shadow + '" opacity="0.13"/></g>';
    m += '<g id="' + P + '-jump" transform="translate(0,0)"><g id="' + P + '-squash" transform="scale(1,1)"><g id="' + P + '-slumpg" transform="scale(1,1)"><g id="' + P + '-bob" transform="scale(1,1)">';

    // --- head back (back hair) ---
    function headWrap(tag, inner) {
      return '<g transform="translate(0,' + (-NECK) + ')"><g id="' + P + '-hp' + tag + '" transform="rotate(0)"><g id="' + P + '-hs' + tag + '" transform="rotate(0)">' +
        '<g id="' + P + '-hq' + tag + '" transform="scale(1,1)"><g transform="translate(0,' + NECK + ')">' + inner + '</g></g></g></g></g>';
    }
    var backHair = 'M 0 -690 C 66 -690 110 -656 112 -598 C 114 -556 104 -528 112 -503 C 120 -481 136 -470 129 -450 C 123 -435 106 -436 100 -449 C 93 -436 78 -437 72 -451 C 68 -458 64 -462 62 -462 L -62 -462 C -64 -462 -68 -458 -72 -451 C -78 -437 -93 -436 -100 -449 C -106 -436 -123 -435 -129 -450 C -136 -470 -120 -481 -112 -503 C -104 -528 -114 -556 -112 -598 C -110 -656 -66 -690 0 -690 Z';
    var hb = shape(backHair, C.hair) + stroke('M 100 -470 Q 108 -490 104 -512', C.hairG, 4) + stroke('M -101 -468 Q -110 -488 -106 -512', C.hairG, 4);
    m += headWrap('B', hb);

    // --- legs + shoes ---
    var shoeL = 'M -90 -6 C -92 -28 -72 -44 -47 -44 C -22 -44 -4 -30 -4 -6 Z';
    var soleL = 'M -94 -13 C -94 -4 -90 0 -82 0 L -12 0 C -4 0 0 -4 0 -13 Z';
    var legs = '';
    legs += shape(shoeL, C.shoe) + shape(mx(shoeL), C.shoe);
    legs += stroke('M -80 -26 C -74 -36 -60 -40 -46 -40', C.shoeD, 4) + stroke(mx('M -80 -26 C -74 -36 -60 -40 -46 -40'), C.shoeD, 4);
    legs += shape(soleL, '#fff', 5) + shape(mx(soleL), '#fff', 5);
    legs += stroke('M -82 -6.5 L -14 -6.5', '#E3DCCB', 3) + stroke('M 82 -6.5 L 14 -6.5', '#E3DCCB', 3);
    var jeans = 'M -55 -314 L 55 -314 C 60 -240 74 -130 86 -36 L 8 -36 C 8 -110 6 -176 0 -222 C -6 -176 -8 -110 -8 -36 L -86 -36 C -74 -130 -60 -240 -55 -314 Z';
    legs += fillOnly(jeans, C.jean);
    // cuffs
    legs += fillOnly('M -84.2 -54 L -7.9 -52 L -8 -36 L -86 -36 Z', C.jeanL) + fillOnly(mx('M -84.2 -54 L -7.9 -52 L -8 -36 L -86 -36 Z'), C.jeanL);
    legs += stroke('M -84.2 -54 L -7.9 -52', C.ink, 4) + stroke(mx('M -84.2 -54 L -7.9 -52'), C.ink, 4);
    // seams + folds
    var dash = 'stroke-dasharray="7 6"';
    legs += stroke('M -50 -290 C -57 -210 -64 -130 -70 -60', C.jeanD, 3, dash) + stroke(mx('M -50 -290 C -57 -210 -64 -130 -70 -60'), C.jeanD, 3, dash);
    legs += stroke('M -9 -190 C -11 -150 -15 -100 -17 -60', C.jeanD, 3, dash) + stroke(mx('M -9 -190 C -11 -150 -15 -100 -17 -60'), C.jeanD, 3, dash);
    legs += stroke('M -62 -160 Q -50 -152 -38 -160', C.jeanD, 4) + stroke('M 40 -140 Q 52 -132 64 -142', C.jeanD, 4) + stroke('M -58 -110 Q -48 -104 -40 -110', C.jeanD, 4);
    legs += stroke('M -54 -292 Q -36 -284 -28 -296', C.ink, 3.5) + stroke('M 54 -292 Q 36 -284 28 -296', C.ink, 3.5);
    legs += stroke('M 9 -296 L 9 -254 Q 9 -242 0 -240', C.jeanD, 3, 'stroke-dasharray="5 5"');
    legs += stroke('M -55 -298 L 55 -298', C.ink, 4);
    legs += shape(jeans, 'none');
    legs += shape('M -40 -316 L -32 -316 L -32 -294 L -40 -294 Z', C.jean, 3.5) + shape('M 32 -316 L 40 -316 L 40 -294 L 32 -294 Z', C.jean, 3.5);
    legs += '<circle cx="0" cy="-306" r="5" fill="' + C.gold + '" stroke="' + C.ink + '" stroke-width="3"/>';
    m += legs;

    // --- torso: neck + blouse ---
    var t = '';
    t += shape('M -15 -514 L -15 -462 L 15 -462 L 15 -514 Z', C.skin);
    t += fillOnly('M -15 -510 Q 0 -488 15 -510 L 15 -494 Q 0 -478 -15 -494 Z', C.skinD);
    var blouse = 'M -20 -476 C -42 -476 -62 -470 -67 -452 C -72 -420 -62 -360 -56 -304 L 56 -304 C 62 -360 72 -420 67 -452 C 62 -470 42 -476 20 -476 Z';
    t += fillOnly(blouse, C.blue);
    t += fillOnly('M 56 -304 C 62 -360 72 -420 67 -452 C 63 -436 54 -396 44 -304 Z', C.blueD);
    t += stroke('M 0 -452 L 0 -306', C.blueD, 4);
    t += stroke('M -34 -308 Q -28 -320 -22 -308', C.blueD, 3.5) + stroke('M 22 -308 Q 28 -320 34 -308', C.blueD, 3.5);
    t += shape(blouse, 'none');
    [-428, -392, -356, -322].forEach(function (y) { t += '<circle cx="0" cy="' + y + '" r="4.2" fill="#fff" stroke="' + C.ink + '" stroke-width="3"/>'; });
    var collar = 'M -1 -472 C -12 -482 -34 -482 -46 -471 C -50 -455 -34 -441 -15 -447 C -6 -451 -1 -461 -1 -472 Z';
    t += shape(collar, '#fff', 5) + shape(mx(collar), '#fff', 5);
    m += t;

    // --- head front ---
    var h = '';
    var bun = '<circle cx="6" cy="-720" r="23" fill="' + C.hair + '" stroke="' + C.ink + '" stroke-width="' + SW + '"/>' + stroke('M -6 -728 Q 0 -737 10 -738', C.hairG, 4.5);
    h += bun;
    var ear = 'M -76 -596 C -93 -603 -101 -581 -95 -567 C -91 -557 -82 -555 -76 -559 Z';
    h += shape(ear, C.skin) + shape(mx(ear), C.skin);
    h += stroke('M -86 -586 Q -92 -577 -84 -568', C.skinD, 3.5) + stroke(mx('M -86 -586 Q -92 -577 -84 -568'), C.skinD, 3.5);
    var hoop = function (x) { return '<circle cx="' + x + '" cy="-545" r="9" fill="none" stroke="' + C.ink + '" stroke-width="8"/><circle cx="' + x + '" cy="-545" r="9" fill="none" stroke="' + C.gold + '" stroke-width="3.5"/>'; };
    h += hoop(-89) + hoop(89);
    var faceD = 'M 0 -668 C 46 -668 80 -636 80 -588 C 80 -548 66 -520 44 -506 C 30 -498 14 -495 0 -495 C -14 -495 -30 -498 -44 -506 C -66 -520 -80 -548 -80 -588 C -80 -636 -46 -668 0 -668 Z';
    h += shape(faceD, C.skin);
    h += '<ellipse cx="-53" cy="-547" rx="13" ry="7.5" fill="' + C.cheek + '"/><ellipse cx="53" cy="-547" rx="13" ry="7.5" fill="' + C.cheek + '"/>';
    h += stroke('M 3 -567 Q -6 -557 4 -552', C.skinD, 4);
    // eyes (per expression variants inside blink pivots)
    ['l', 'r'].forEach(function (side, si) {
      var s = si === 0 ? -1 : 1;
      h += '<g transform="translate(' + EYE[side][0] + ',' + EYE[side][1] + ')"><g id="' + P + '-eye' + side + '" transform="scale(1,1)">';
      EXPRESSIONS.forEach(function (E) {
        h += '<g id="' + P + '-eye' + side + '-' + E + '"' + vis(E === 'neutral') + '>' + eye(P, side + '-' + E, s, EX[E].eyes[si]) + '</g>';
      });
      h += '</g></g>';
    });
    // fx (bags, sweat...)
    EXPRESSIONS.forEach(function (E) { h += '<g id="' + P + '-fx-' + E + '"' + vis(E === 'neutral') + '>' + (EX[E].fx ? EX[E].fx() : '') + '</g>'; });
    // mouth layers
    h += '<g transform="translate(0,' + MOUTH_Y + ')"><g id="' + P + '-mouth" transform="scale(1,1)">';
    h += '<g id="' + P + '-mC" opacity="1">';
    EXPRESSIONS.forEach(function (E) { h += '<g id="' + P + '-mC-' + E + '"' + vis(E === 'neutral') + '>' + EX[E].mC(P) + '</g>'; });
    h += '</g><g id="' + P + '-mO" opacity="0" transform="scale(1,1)">';
    EXPRESSIONS.forEach(function (E) { h += '<g id="' + P + '-mO-' + E + '"' + vis(E === 'neutral') + '>' + EX[E].mO(P) + '</g>'; });
    h += '</g></g></g>';
    // front hair (bangs)
    var bangs = 'M -82 -556 C -94 -584 -98 -636 -72 -666 C -52 -688 -22 -696 6 -696 C 52 -696 94 -672 93 -622 C 93 -604 90 -592 86 -582 C 80 -606 66 -626 46 -634 C 34 -640 24 -650 16 -664 C 4 -644 -24 -634 -50 -634 C -66 -632 -76 -620 -76 -598 C -76 -580 -78 -566 -82 -556 Z';
    h += shape(bangs, C.hair);
    h += stroke('M -62 -662 Q -44 -682 -16 -688', C.hairG, 6) + stroke('M -80 -626 Q -82 -612 -80 -600', C.hairG, 4.5) + stroke('M 44 -684 Q 64 -676 76 -660', C.hairG, 5);
    h += stroke('M 16 -664 Q 30 -678 52 -682', C.ink, 3.5);
    // scrunchie on the crown
    h += shape('M -21 -700 C -24 -712 -10 -714 -4 -710 C 2 -716 14 -716 18 -710 C 26 -714 36 -708 33 -699 C 36 -690 26 -686 18 -690 C 12 -685 0 -685 -4 -690 C -12 -686 -24 -690 -21 -700 Z', C.pink, 5);
    h += stroke('M -4 -709 Q -2 -700 -4 -691', C.pinkD, 3.5) + stroke('M 18 -709 Q 20 -700 18 -691', C.pinkD, 3.5);
    // brows (on top of the bangs)
    EXPRESSIONS.forEach(function (E) {
      h += '<g id="' + P + '-brow-' + E + '"' + vis(E === 'neutral') + '>' + brow(-1, EX[E].brows[0]) + brow(1, EX[E].brows[1]) + '</g>';
    });
    m += headWrap('F', h);

    // --- arms: ink chain then fill chain, per side (R first, L on top) ---
    function arm(side, fill) {
      var a = side === 'R' ? idleR : idleL;
      var s = side === 'R' ? -1 : 1;
      var tg = fill ? 'f' : 'k';
      var id = function (n) { return P + '-' + side + tg + '-' + n; };
      var o = '<g id="' + id('sp') + '" transform="translate(' + SH[side][0] + ',' + SH[side][1] + ')"><g id="' + id('sh') + '" transform="rotate(' + f2(a.sh) + ')">';
      if (fill) o += '<line id="' + id('ul') + '" x1="0" y1="0" x2="0" y2="' + U + '" stroke="' + C.skin + '" stroke-width="25" stroke-linecap="round"/>';
      else o += '<line id="' + id('ul') + '" x1="0" y1="0" x2="0" y2="' + U + '" stroke="' + C.ink + '" stroke-width="' + (25 + 2 * SW) + '" stroke-linecap="round"/>';
      if (fill) {
        o += shape('M -23 -4 C -27 12 -25 30 -19 40 L 19 40 C 25 30 27 12 23 -4 C 15 -17 -15 -17 -23 -4 Z', C.blue);
        o += fillOnly('M 8 -12 C 18 -10 24 -4 23 4 C 22 18 22 30 19 38 L 12 38 C 15 24 15 6 8 -12 Z', C.blueD, 'transform="scale(' + (-s) + ',1)"');
        o += shape('M -23 -4 C -27 12 -25 30 -19 40 L 19 40 C 25 30 27 12 23 -4 C 15 -17 -15 -17 -23 -4 Z', 'none');
        o += '<rect x="-20" y="35" width="40" height="11" rx="5" fill="#fff" stroke="' + C.ink + '" stroke-width="4.5"/>';
      }
      o += '<g id="' + id('ep') + '" transform="translate(0,' + U + ')"><g id="' + id('el') + '" transform="rotate(' + f2(a.el) + ')">';
      if (fill) {
        o += '<line id="' + id('fk') + '" x1="0" y1="12" x2="0" y2="' + F + '" stroke="' + C.ink + '" stroke-width="' + (22 + 2 * SW) + '" stroke-linecap="butt"/>';
        o += '<line id="' + id('fl') + '" x1="0" y1="0" x2="0" y2="' + F + '" stroke="' + C.skin + '" stroke-width="22" stroke-linecap="round"/>';
        o += '<g id="' + id('wp') + '" transform="translate(0,' + F + ')"><g id="' + id('wr') + '" transform="rotate(' + f2(a.wr) + ')">';
        if (side === 'R') {
          o += '<g id="' + P + '-phone" opacity="0"><g transform="rotate(180)">' + phoneProp() + '</g></g>';
          o += '<g id="' + P + '-mug" opacity="0"><g transform="rotate(90)">' + mugProp() + '</g></g>';
        }
        HAND_NAMES.forEach(function (hn) {
          o += '<g id="' + id('hand-' + hn) + '"' + vis(hn === a.shape) + '><g transform="scale(' + (-s) + ',1)">' + HANDS[hn]() + '</g></g>';
        });
        o += '</g></g>';
      } else {
        o += '<line id="' + id('fl') + '" x1="0" y1="0" x2="0" y2="' + F + '" stroke="' + C.ink + '" stroke-width="' + (22 + 2 * SW) + '" stroke-linecap="round"/>';
      }
      o += '</g></g></g></g>';
      return o;
    }
    m += arm('R', false) + arm('R', true) + arm('L', false) + arm('L', true);

    m += '</g></g></g></g>'; // bob, slump, squash, jump
    return m;
  }

  // ---------------------------------------------------------------- API
  function create(parent, opts) {
    opts = opts || {};
    var P = opts.id || 'girl';
    var root = document.createElementNS(NS, 'g');
    root.setAttribute('id', P + '-root');
    var flipG = '<g id="' + P + '-flip" transform="scale(' + (opts.flip ? -1 : 1) + ',1)">';
    root.innerHTML = flipG + buildMarkup(P) + '</g>';
    parent.appendChild(root);
    gsap.set(root, { x: opts.x || 0, y: opts.y || 0, scale: opts.scale || 1, svgOrigin: '0 0' });

    function $(n) { return root.querySelector('#' + P + '-' + n); }
    function $$(list) { return list.map($); }
    var eyes = $$(['eyel', 'eyer']);
    var headQ = $$(['hqB', 'hqF']), headP = $$(['hpB', 'hpF']), headS = $$(['hsB', 'hsF']);
    var parts = {};
    EXPRESSIONS.forEach(function (E) {
      parts[E] = $$(['eyel-' + E, 'eyer-' + E, 'brow-' + E, 'mC-' + E, 'mO-' + E, 'fx-' + E]);
    });
    var mC = $('mC'), mO = $('mO');
    var props = { phone: $('phone'), mug: $('mug') };
    var arms = {};
    ['R', 'L'].forEach(function (sd) {
      var g = function (n) { return $(sd + n); };
      arms[sd] = {
        sp: [g('k-sp'), g('f-sp')], sh: [g('k-sh'), g('f-sh')], ep: [g('k-ep'), g('f-ep')], el: [g('k-el'), g('f-el')],
        ul: [g('k-ul'), g('f-ul')], fl: [g('k-fl'), g('f-fl'), g('f-fk')], wp: [g('f-wp')], wr: [g('f-wr')],
        hands: HAND_NAMES.reduce(function (acc, hn) { acc[hn] = g('f-hand-' + hn); return acc; }, {})
      };
    });
    var seedBase = hash(P);
    var EPS = 0.002;

    var api = {
      root: root, props: props, id: P,
      expressions: EXPRESSIONS.slice(), poses: Object.keys(POSES),

      blink: function (tl, t, dur) {
        dur = dur || 0.13;
        var c = dur * 0.42;
        tl.fromTo(eyes, { attr: { transform: 'scale(1,1)' } }, { attr: { transform: 'scale(1,0.08)' }, duration: c, ease: 'power2.in', immediateRender: false }, t);
        tl.fromTo(eyes, { attr: { transform: 'scale(1,0.08)' } }, { attr: { transform: 'scale(1,1)' }, duration: dur - c, ease: 'power2.out', immediateRender: false }, t + c);
        return api;
      },

      autoBlink: function (tl, t0, t1) {
        var r = rng(seedBase ^ Math.round(t0 * 1000));
        var t = t0 + 0.4 + r() * 1.2;
        while (t < t1 - 0.2) {
          api.blink(tl, t);
          if (r() < 0.15 && t + 0.32 < t1) api.blink(tl, t + 0.2);
          t += 2.5 + r() * 1.5;
        }
        return api;
      },

      face: function (tl, t, name) {
        if (!parts[name]) throw new Error('Girl.face: unknown expression ' + name);
        var h = 0.06;
        tl.fromTo(eyes, { attr: { transform: 'scale(1,1)' } }, { attr: { transform: 'scale(1,0.1)' }, duration: h, ease: 'power1.in', immediateRender: false }, t);
        tl.fromTo(headQ, { attr: { transform: 'scale(1,1)' } }, { attr: { transform: 'scale(1.025,0.972)' }, duration: h, ease: 'power1.out', immediateRender: false }, t);
        EXPRESSIONS.forEach(function (E) {
          tl.set(parts[E], { attr: { opacity: E === name ? 1 : 0 } }, t + h - EPS);
        });
        tl.fromTo(eyes, { attr: { transform: 'scale(1,0.1)' } }, { attr: { transform: 'scale(1,1)' }, duration: h, ease: 'power1.out', immediateRender: false }, t + h);
        tl.fromTo(headQ, { attr: { transform: 'scale(1.025,0.972)' } }, { attr: { transform: 'scale(1,1)' }, duration: h * 2, ease: 'back.out(3)', immediateRender: false }, t + h);
        return api;
      },

      talk: function (tl, t0, t1) {
        var r = rng(seedBase ^ Math.round(t0 * 1000) ^ 0x9e3779b9);
        var t = t0;
        while (t < t1 - 0.06) {
          if (r() < 0.9) {
            var open = 0.065 + r() * 0.03;
            var sy = r() < 0.35 ? 0.62 : 1;
            tl.set(mO, { attr: { opacity: 1, transform: 'scale(1,' + sy + ')' } }, t - EPS);
            tl.set(mC, { attr: { opacity: 0 } }, t - EPS);
            var tc = Math.min(t + open, t1);
            tl.set(mO, { attr: { opacity: 0 } }, tc - EPS);
            tl.set(mC, { attr: { opacity: 1 } }, tc - EPS);
          }
          t += 1 / 7 + (r() - 0.5) * 0.04;
        }
        tl.set(mO, { attr: { opacity: 0 } }, t1 - EPS);
        tl.set(mC, { attr: { opacity: 1 } }, t1 - EPS);
        return api;
      },

      pose: function (tl, t, name, dur) {
        var p = POSES[name];
        if (!p) throw new Error('Girl.pose: unknown pose ' + name);
        dur = dur == null ? 0.25 : dur;
        var ease = 'power2.inOut';
        ['R', 'L'].forEach(function (sd) {
          var a = p[sd], A = arms[sd];
          tl.to(A.sh, { attr: { transform: 'rotate(' + f2(a.sh) + ')' }, duration: dur, ease: ease }, t);
          tl.to(A.el, { attr: { transform: 'rotate(' + f2(a.el) + ')' }, duration: dur, ease: ease }, t);
          tl.to(A.wr, { attr: { transform: 'rotate(' + f2(a.wr) + ')' }, duration: dur, ease: ease }, t);
          tl.to(A.ep, { attr: { transform: 'translate(0,' + f2(U * a.ku) + ')' }, duration: dur, ease: ease }, t);
          tl.to(A.ul, { attr: { y2: f2(U * a.ku) }, duration: dur, ease: ease }, t);
          tl.to(A.wp, { attr: { transform: 'translate(0,' + f2(F * a.kf) + ')' }, duration: dur, ease: ease }, t);
          tl.to(A.fl, { attr: { y2: f2(F * a.kf) }, duration: dur, ease: ease }, t);
          HAND_NAMES.forEach(function (hn) {
            tl.set(A.hands[hn], { attr: { opacity: hn === a.shape ? 1 : 0 } }, t + dur * 0.5 - EPS);
          });
        });
        var pr = p.R.prop;
        tl.set(props.phone, { attr: { opacity: pr === 'phone' ? 1 : 0 } }, t + dur * 0.5 - EPS);
        tl.set(props.mug, { attr: { opacity: pr === 'mug' ? 1 : 0 } }, t + dur * 0.5 - EPS);
        tl.to(headP, { attr: { transform: 'rotate(' + p.head + ')' }, duration: dur * 1.2, ease: ease }, t);
        return api;
      },

      // waggle the R hand while in the 'wave' pose
      waveHand: function (tl, t0, t1) {
        var base = POSES.wave.R.el, span = t1 - t0;
        if (span < 0.15) return api;
        var n = Math.max(2, Math.floor(span / 0.17) - 1);
        if (n % 2) n -= 1;
        var half = span / (n + 1);
        tl.to(arms.R.el, { attr: { transform: 'rotate(' + f2(base - 16) + ')' }, duration: half / 2, ease: 'sine.out' }, t0);
        tl.to(arms.R.el, { attr: { transform: 'rotate(' + f2(base + 16) + ')' }, duration: half, ease: 'sine.inOut', repeat: n - 1, yoyo: true }, t0 + half / 2);
        tl.to(arms.R.el, { attr: { transform: 'rotate(' + f2(base) + ')' }, duration: half / 2, ease: 'sine.in' }, t0 + half / 2 + half * n);
        return api;
      },

      prop: function (tl, t, name, on) {
        tl.set(props[name], { attr: { opacity: on ? 1 : 0 } }, t - EPS);
        return api;
      },

      bob: function (tl, t0, t1, amp) {
        amp = amp == null ? 6 : amp;
        var half = 0.8;
        var n = Math.floor((t1 - t0) / half);
        if (n < 1) return api;
        if (n % 2) n -= 1;
        if (n < 2) return api;
        var sy = 1 - amp / 620, sx = 1 + amp / 2400;
        var bobEl = $('bob');
        tl.to(bobEl, { attr: { transform: 'scale(' + f2(sx * 1000) / 1000 + ',' + f2(sy * 1000) / 1000 + ')' }, duration: half, ease: 'sine.inOut', repeat: n - 1, yoyo: true }, t0);
        return api;
      },

      jump: function (tl, t, h) {
        h = h == null ? 60 : h;
        var J = $('jump'), S = $('squash'), Sh = $('shadow');
        tl.to(S, { attr: { transform: 'scale(1.06,0.9)' }, duration: 0.1, ease: 'power2.out' }, t);
        tl.to(J, { attr: { transform: 'translate(0,' + (-h) + ')' }, duration: 0.26, ease: 'power2.out' }, t + 0.1);
        tl.to(S, { attr: { transform: 'scale(0.95,1.07)' }, duration: 0.1, ease: 'power2.out' }, t + 0.1);
        tl.to(S, { attr: { transform: 'scale(1,1)' }, duration: 0.16, ease: 'sine.inOut' }, t + 0.2);
        tl.to(Sh, { attr: { transform: 'scale(' + f2(Math.max(0.55, 1 - h / 200)) + ',' + f2(Math.max(0.55, 1 - h / 200)) + ')' }, duration: 0.26, ease: 'power2.out' }, t + 0.1);
        tl.to(J, { attr: { transform: 'translate(0,0)' }, duration: 0.22, ease: 'power2.in' }, t + 0.36);
        tl.to(Sh, { attr: { transform: 'scale(1,1)' }, duration: 0.22, ease: 'power2.in' }, t + 0.36);
        tl.to(S, { attr: { transform: 'scale(1.08,0.9)' }, duration: 0.06, ease: 'power2.out' }, t + 0.58);
        tl.to(S, { attr: { transform: 'scale(1,1)' }, duration: 0.2, ease: 'back.out(2.5)' }, t + 0.64);
        return api;
      },

      slump: function (tl, t, on) {
        on = on !== false;
        var d = 0.5, ease = 'power2.inOut';
        tl.to($('slumpg'), { attr: { transform: on ? 'scale(1.03,0.96)' : 'scale(1,1)' }, duration: d, ease: ease }, t);
        tl.to(headS, { attr: { transform: on ? 'rotate(8)' : 'rotate(0)' }, duration: d, ease: ease }, t);
        ['R', 'L'].forEach(function (sd) {
          var x = SH[sd][0] + (on ? (sd === 'R' ? 3 : -3) : 0), y = SH[sd][1] + (on ? 12 : 0);
          tl.to(arms[sd].sp, { attr: { transform: 'translate(' + x + ',' + y + ')' }, duration: d, ease: ease }, t);
        });
        return api;
      }
    };
    return api;
  }

  window.Girl = { create: create, EXPRESSIONS: EXPRESSIONS, POSES: Object.keys(POSES), COLORS: C };
})();
