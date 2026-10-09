/* character.js — "Lia" flat-vector cartoon girl rig for HyperFrames (SVG + GSAP).
 * Original design in a flat "character kit" style: no outlines (thin same-hue edges only), big head,
 * messy high ponytail, magenta jacket over a mint tee, purple striped leggings, pink sneakers.
 *
 *   const g = Girl.create(parentSvgGroup, { id:'lia', x:540, y:1700, scale:1.2 });
 *   g.face(tl,t,'happy'); g.talk(tl,t0,t1); g.autoBlink(tl,t0,t1); g.pose(tl,t,'wave',0.25);
 *   g.waveHand(tl,t0,t1); g.bob(tl,t0,t1,5); g.jump(tl,t,60); g.hairSway(tl,t0,t1); g.prop(tl,t,'laptop',true)
 *
 * Local units: feet at (0,0); hair top ~ -730, ponytail tip ~ -800. ~800 px tall at scale 1.
 * "R" = HER right arm = screen-left (flip:false).
 */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  var C = {
    skin: '#F7CBA6', skinD: '#E9A884', skinDD: '#D98F6E', cheek: '#F39C95',
    hair: '#5C4032', hairD: '#45302A', hairL: '#74523F', tie: '#F5922A', tieD: '#D9761A',
    jacket: '#DB3270', jacketD: '#B3245B', jacketL: '#EA5D90',
    tee: '#A3CFA8', teeD: '#86B48D', flower: '#F8D93A', flowerC: '#F0962A',
    leg: '#7344A8', legD: '#57318B', shoe: '#EE4E84', shoeD: '#C93467', sole: '#FFFFFF', soleD: '#E3DCE8',
    eyeW: '#FFFFFF', iris: '#432257', irisL: '#6A3A86', lash: '#3A2231', brow: '#4A3127',
    mouth: '#7E2B3B', tongue: '#F06D7E', line: '#6E2E37', sweat: '#8FD3F0', shadow: '#1d2b3a',
    lap: '#C7CEDD', lapD: '#A6AFC4'
  };
  var U = 90, F = 84;
  var SH = { R: [-56, -405], L: [56, -405] };
  var NECK = 440;
  var EYE = { l: [-52, -556], r: [52, -556] };
  var MOUTH_Y = -486;
  var EXPRESSIONS = ['neutral', 'happy', 'grin', 'worried', 'surprised', 'doubtful', 'wink', 'proud'];

  function f2(n) { return Math.round(n * 100) / 100; }
  function fillOnly(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra ? ' ' + extra : '') + '/>'; }
  function edge(d, fill, col, sw) {
    return '<path d="' + d + '" fill="' + fill + '" stroke="' + col + '" stroke-width="' + (sw || 2.5) + '" stroke-linejoin="round"/>';
  }
  function stroke(d, color, w, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w +
      '" stroke-linecap="round" stroke-linejoin="round"' + (extra ? ' ' + extra : '') + '/>';
  }
  function mx(d) {
    return d.replace(/([MLCQSTHVZ])([^MLCQSTHVZ]*)/g, function (m, c, args) {
      var a = args.trim();
      var nums = a.length ? a.split(/[\s,]+/).map(Number) : [];
      if (c === 'H') nums = nums.map(function (n) { return -n; });
      else if (c !== 'V' && c !== 'Z') nums = nums.map(function (n, i) { return i % 2 === 0 ? -n : n; });
      return c + ' ' + nums.join(' ') + ' ';
    });
  }
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
  function eye(P, key, s, o) {
    if (o.type === 'up') return stroke('M -24 8 Q 0 -24 24 8', C.lash, 8);
    if (o.type === 'down') return stroke('M -24 -2 Q 0 16 24 -2', C.lash, 8);
    var rx = o.rx || 32, ry = o.ry || 35, pr = o.pr || 21, px = o.px || 0, py = (o.py == null ? 4 : o.py);
    var cid = P + '-ec-' + key;
    var m = '<clipPath id="' + cid + '"><ellipse rx="' + rx + '" ry="' + ry + '"/></clipPath>';
    m += '<ellipse rx="' + rx + '" ry="' + ry + '" fill="' + C.eyeW + '"/>';
    m += '<g clip-path="url(#' + cid + ')">';
    m += '<circle cx="' + px + '" cy="' + py + '" r="' + pr + '" fill="' + C.iris + '"/>';
    m += '<circle cx="' + f2(px + pr * 0.25) + '" cy="' + f2(py + pr * 0.3) + '" r="' + f2(pr * 0.55) + '" fill="' + C.irisL + '" opacity="0.55"/>';
    m += '<circle cx="' + f2(px - pr * 0.36) + '" cy="' + f2(py - pr * 0.38) + '" r="' + f2(Math.max(3, pr * 0.32)) + '" fill="#fff"/>';
    m += '<circle cx="' + f2(px + pr * 0.38) + '" cy="' + f2(py + pr * 0.36) + '" r="' + f2(Math.max(1.6, pr * 0.14)) + '" fill="#fff"/>';
    if (o.lid) {
      var yi = o.lid[0], yo = o.lid[1], xi = -s * (rx + 6), xo = s * (rx + 6);
      m += fillOnly('M ' + xi + ' ' + yi + ' L ' + xo + ' ' + yo + ' L ' + xo + ' ' + (-ry - 10) + ' L ' + xi + ' ' + (-ry - 10) + ' Z', C.skin);
      m += stroke('M ' + xi + ' ' + yi + ' L ' + xo + ' ' + yo, C.lash, 5);
    }
    m += '</g>';
    if (!o.lid) m += stroke('M ' + (-s * 27) + ' -12 Q ' + (-s * 4) + ' -42 ' + (s * 28) + ' -12', C.lash, 4.5);
    m += stroke('M ' + (s * 27) + ' -14 L ' + (s * 37) + ' -21', C.lash, 4);
    return m;
  }
  function brow(s, b) {
    var xi = s * 30, xo = s * 76, xm = s * 53;
    var ym = Math.min(b[0], b[1]) - b[2];
    return stroke('M ' + xo + ' ' + b[1] + ' Q ' + xm + ' ' + ym + ' ' + xi + ' ' + b[0], C.brow, b[3] || 8);
  }
  function mOpen(P, key, d, o) {
    o = o || {};
    var cid = P + '-mc-' + key;
    var m = '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>';
    m += fillOnly(d, C.mouth);
    m += '<g clip-path="url(#' + cid + ')">';
    if (o.teeth != null) m += '<rect x="-40" y="-40" width="80" height="' + (40 + o.teeth + 6) + '" fill="#fff"/>';
    if (o.tongue) m += '<ellipse cx="' + o.tongue[0] + '" cy="' + o.tongue[1] + '" rx="' + o.tongue[2] + '" ry="' + o.tongue[3] + '" fill="' + C.tongue + '"/>';
    m += '</g>';
    return m;
  }
  function mLine(d, w) { return stroke(d, C.line, w || 5); }
  function sweat(x, y, sc) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">' +
      fillOnly('M 0 -16 C 7 -5 12 1 12 8 C 12 15 7 19 0 19 C -7 19 -12 15 -12 8 C -12 1 -7 -5 0 -16 Z', C.sweat) +
      fillOnly('M -5 7 C -5 3 -3 0 -2 -1 C -2 3 -3 7 -2 10 Z', '#fff') + '</g>';
  }

  var EX = {
    neutral: {
      eyes: [{}, {}],
      brows: [[-606, -610, 5], [-606, -610, 5]],
      mC: function () { return mLine('M -14 -2 Q 0 9 14 -2'); },
      mO: function (P) { return mOpen(P, 'neutralO', 'M -14 -3 Q 0 0 14 -3 Q 12 15 0 16 Q -12 15 -14 -3 Z', { tongue: [0, 16, 9, 6] }); }
    },
    happy: {
      eyes: [{ py: 2 }, { py: 2 }],
      brows: [[-614, -614, 7], [-614, -614, 7]],
      mC: function (P) { return mOpen(P, 'happyC', 'M -20 -6 Q 0 -2 20 -6 Q 16 15 0 16 Q -16 15 -20 -6 Z', { teeth: -2, tongue: [0, 16, 10, 5] }); },
      mO: function (P) { return mOpen(P, 'happyO', 'M -22 -7 Q 0 -3 22 -7 Q 18 22 0 23 Q -18 22 -22 -7 Z', { teeth: -2, tongue: [0, 22, 12, 7] }); }
    },
    grin: {
      eyes: [{ type: 'up' }, { type: 'up' }],
      brows: [[-622, -620, 8], [-622, -620, 8]],
      mC: function (P) { return mOpen(P, 'grinC', 'M -30 -10 Q 0 -5 30 -10 Q 26 27 0 29 Q -26 27 -30 -10 Z', { teeth: 0, tongue: [0, 28, 16, 10] }); },
      mO: function (P) { return mOpen(P, 'grinO', 'M -31 -11 Q 0 -6 31 -11 Q 27 32 0 34 Q -27 32 -31 -11 Z', { teeth: 0, tongue: [0, 33, 17, 11] }); }
    },
    worried: {
      eyes: [{ pr: 17, py: 1 }, { pr: 17, py: 1 }],
      brows: [[-626, -604, 2], [-626, -604, 2]],
      mC: function () { return mLine('M -15 4 Q -8 -3 0 1 Q 8 5 15 -1'); },
      mO: function (P) { return mOpen(P, 'worriedO', 'M -13 4 Q 0 -6 13 4 Q 10 14 0 14 Q -10 14 -13 4 Z', { tongue: [0, 14, 7, 4] }); },
      fx: function () { return sweat(112, -612, 1.1); }
    },
    surprised: {
      eyes: [{ rx: 33, ry: 38, pr: 14, py: 0 }, { rx: 33, ry: 38, pr: 14, py: 0 }],
      brows: [[-632, -628, 9], [-632, -628, 9]],
      mC: function (P) { return mOpen(P, 'surpC', 'M 0 -9 Q 11 -9 11 4 Q 11 18 0 18 Q -11 18 -11 4 Q -11 -9 0 -9 Z', { tongue: [0, 16, 7, 4] }); },
      mO: function (P) { return mOpen(P, 'surpO', 'M 0 -11 Q 13 -11 13 5 Q 13 22 0 22 Q -13 22 -13 5 Q -13 -11 0 -11 Z', { tongue: [0, 20, 8, 5] }); }
    },
    doubtful: {
      eyes: [{ px: 7, py: -3, pr: 18, lid: [-6, -12] }, { px: 7, py: -3, pr: 18 }],
      brows: [[-602, -606, 1], [-626, -622, 9]],
      mC: function () { return mLine('M -15 3 Q -5 -4 4 0 Q 11 3 16 -3'); },
      mO: function (P) { return mOpen(P, 'doubtO', 'M -12 2 Q 2 -4 14 -2 Q 11 10 1 10 Q -9 10 -12 2 Z', { tongue: [1, 10, 7, 4] }); }
    },
    wink: {
      eyes: [{ py: 2 }, { type: 'up' }],
      brows: [[-614, -616, 7], [-606, -608, 4]],
      mC: function () { return fillOnly('M 3 4 Q 5 16 12 15 Q 18 13 16 2 Z', C.tongue) + mLine('M -20 -4 Q 0 13 20 -4'); },
      mO: function (P) { return mOpen(P, 'winkO', 'M -20 -5 Q 0 -1 20 -5 Q 16 19 0 20 Q -16 19 -20 -5 Z', { teeth: -1, tongue: [2, 19, 10, 6] }); }
    },
    proud: {
      eyes: [{ py: 6, lid: [-12, -10] }, { py: 6, lid: [-12, -10] }],
      brows: [[-606, -610, 4], [-620, -618, 7]],
      mC: function () { return mLine('M -15 1 Q 3 9 18 -7'); },
      mO: function (P) { return mOpen(P, 'proudO', 'M -13 0 Q 3 4 18 -7 Q 14 10 1 10 Q -10 10 -13 0 Z', { tongue: [1, 10, 7, 4] }); }
    }
  };

  // ---------------------------------------------------------------- hands (drawn for s=+1, thumb on +x), skin with fine same-hue edge
  function sk(d) { return edge(d, C.skin, C.skinD, 2.5); }
  var FIST_D = 'M -13 2 C -17 11 -17 25 -11 31 C -5 36 7 36 12 31 C 17 25 17 11 13 2 Z';
  function fist() {
    return sk(FIST_D) + stroke('M 13 11 C 6 12 1 17 3 24', C.skinD, 3) +
      stroke('M -7 33 L -7 28', C.skinD, 2.5) + stroke('M 0 35 L 0 29', C.skinD, 2.5) + stroke('M 6 33 L 6 28', C.skinD, 2.5);
  }
  var HANDS = {
    open: function () {
      return sk('M 8 8 C 16 5 24 11 24 19 C 24 26 17 28 14 24 C 12 21 10 19 8 18 Z') +
        sk('M -12 2 C -15 13 -16 28 -13 37 C -10 44 -2 47 4 45 C 10 43 14 36 14 27 C 14 17 12 8 11 2 Z') +
        stroke('M -6 44 L -6 35', C.skinD, 2.5) + stroke('M 1 46 L 1 36', C.skinD, 2.5) + stroke('M 7 43 L 7 34', C.skinD, 2.5);
    },
    fist: fist,
    point: function () { return sk('M -10 22 L -10 54 C -10 61 -1 61 -1 54 L -1 22 Z') + fist(); },
    thumbsUp: function () { return '<g transform="scale(1.1)">' + sk('M 6 4 L 34 1 C 43 1 44 16 35 16 L 6 18 Z') + fist() + '</g>'; },
    grip: function () { return sk(FIST_D) + stroke('M -13 13 C -4 15 6 15 15 12', C.skinD, 2.5) + stroke('M -14 22 C -4 24 6 24 15 21', C.skinD, 2.5); }
  };
  var HAND_NAMES = Object.keys(HANDS);

  // ---------------------------------------------------------------- arm IK + poses
  function deg(r) { return r * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  function wrap(a) { while (a > 180) a -= 360; while (a <= -180) a += 360; return a; }
  function dirAngle(dx, dy) { return deg(Math.atan2(-dx, dy)); }
  function solveArm(side, spec) {
    var sx = SH[side][0], sy = SH[side][1], tx = spec.t[0], ty = spec.t[1];
    var dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
    var k = 1, maxR = (U + F) * 0.985;
    if (d > maxR) k = d / maxR;
    var u = U * k, f = F * k;
    d = Math.max(d, Math.abs(u - f) + 2);
    var ft = dirAngle(dx, dy);
    var ca = Math.min(1, Math.max(-1, (u * u + d * d - f * f) / (2 * u * d)));
    var al = deg(Math.acos(ca));
    var cands = [ft + al, ft - al].map(function (pu) { return { pu: pu, ex: sx - u * Math.sin(rad(pu)), ey: sy + u * Math.cos(rad(pu)) }; });
    var outS = function (c) { return side === 'R' ? -c.ex : c.ex; };
    var scorers = { out: outS, 'in': function (c) { return -outS(c); }, down: function (c) { return c.ey; }, up: function (c) { return -c.ey; } };
    var sc = scorers[spec.bend || 'out'];
    var c = sc(cands[0]) >= sc(cands[1]) ? cands[0] : cands[1];
    var pf = dirAngle(tx - c.ex, ty - c.ey);
    var sh = c.pu;
    if (side === 'R') { while (sh < -90) sh += 360; while (sh >= 270) sh -= 360; }
    else { while (sh > 90) sh -= 360; while (sh <= -270) sh += 360; }
    var ph = spec.hand == null ? pf : spec.hand;
    return { sh: sh, el: wrap(pf - c.pu), wr: wrap(ph - pf), ku: k, kf: k, shape: spec.shape || 'open' };
  }
  function mir(spec) { return { t: [-spec.t[0], spec.t[1]], bend: spec.bend, hand: spec.hand == null ? null : -spec.hand, shape: spec.shape }; }
  var IDLE_R = { t: [-74, -236], bend: 'out', hand: 4, shape: 'open' };
  var POSE_SPECS = {
    idle: { R: IDLE_R, L: mir(IDLE_R) },
    wave: { R: { t: [-170, -560], bend: 'down', hand: 168, shape: 'open' }, L: mir(IDLE_R), head: 4 },
    waveL: { R: IDLE_R, L: { t: [170, -560], bend: 'down', hand: -168, shape: 'open' }, head: -4 },
    point: { R: { t: [-220, -470], bend: 'down', shape: 'point' }, L: mir(IDLE_R), head: -3 },
    pointL: { R: IDLE_R, L: { t: [220, -470], bend: 'down', shape: 'point' }, head: 3 },
    pointYou: { R: { t: [-120, -330], bend: 'down', hand: 150, shape: 'point' }, L: mir(IDLE_R), head: -2 },
    pointUp: { R: { t: [-120, -600], bend: 'out', hand: 180, shape: 'point' }, L: mir(IDLE_R), head: -3 },
    pointDownL: { R: IDLE_R, L: { t: [205, -275], bend: 'up', shape: 'point' }, head: 6 },
    pushL: { R: IDLE_R, L: { t: [215, -430], bend: 'down', hand: -165, shape: 'open' }, head: 2 },
    presentL: { R: IDLE_R, L: { t: [190, -340], bend: 'down', hand: -120, shape: 'open' }, head: 3 },
    tada: { R: { t: [-190, -360], bend: 'down', hand: 120, shape: 'open' }, L: { t: [190, -360], bend: 'down', hand: -120, shape: 'open' }, head: 0 },
    juggle: { R: { t: [-150, -470], bend: 'down', hand: 172, shape: 'open' }, L: { t: [150, -470], bend: 'down', hand: -172, shape: 'open' }, head: 0 },
    armsUp: { R: { t: [-150, -600], bend: 'out', hand: 165, shape: 'open' }, L: { t: [150, -600], bend: 'out', hand: -165, shape: 'open' }, head: 0 },
    thumbsUp: { R: { t: [-112, -420], bend: 'down', hand: -90, shape: 'thumbsUp' }, L: mir(IDLE_R), head: 4 },
    thumbsUpL: { R: IDLE_R, L: { t: [112, -420], bend: 'down', hand: 90, shape: 'thumbsUp' }, head: -4 },
    handsOnHips: { R: { t: [-58, -290], bend: 'out', hand: -48, shape: 'fist' }, L: { t: [58, -290], bend: 'out', hand: 48, shape: 'fist' }, head: 0 },
    shrug: { R: { t: [-150, -420], bend: 'down', hand: 140, shape: 'open' }, L: { t: [150, -420], bend: 'down', hand: -140, shape: 'open' }, head: 7 },
    chin: { R: { t: [-40, -470], bend: 'out', hand: 170, shape: 'fist' }, L: { t: [40, -320], bend: 'out', hand: 80, shape: 'fist' }, head: 6 },
    typing: { R: { t: [-34, -300], bend: 'out', hand: -72, shape: 'open' }, L: { t: [34, -300], bend: 'out', hand: 72, shape: 'open' }, head: 5 },
    holdLaptop: { R: { t: [-96, -312], bend: 'out', hand: -80, shape: 'grip' }, L: { t: [96, -312], bend: 'out', hand: 80, shape: 'grip' }, head: 4 },
    hug: { R: { t: [-30, -380], bend: 'out', hand: -100, shape: 'open' }, L: { t: [30, -380], bend: 'out', hand: 100, shape: 'open' }, head: 5 }
  };
  var POSES = {};
  Object.keys(POSE_SPECS).forEach(function (n) {
    var p = POSE_SPECS[n];
    POSES[n] = { R: solveArm('R', p.R), L: solveArm('L', p.L), head: p.head || 0, prop: p.prop || null };
  });
  POSES.holdLaptop.prop = 'laptop';

  // ---------------------------------------------------------------- body markup
  function buildMarkup(P) {
    var m = '';
    var idleR = POSES.idle.R, idleL = POSES.idle.L;
    function vis(on) { return ' opacity="' + (on ? 1 : 0) + '"'; }

    m += '<g id="' + P + '-shadow" transform="scale(1,1)"><ellipse cx="0" cy="0" rx="118" ry="15" fill="' + C.shadow + '" opacity="0.16"/></g>';
    m += '<g id="' + P + '-jump" transform="translate(0,0)"><g id="' + P + '-squash" transform="scale(1,1)"><g id="' + P + '-slumpg" transform="scale(1,1)"><g id="' + P + '-bob" transform="scale(1,1)">';

    function headWrap(tag, inner) {
      return '<g transform="translate(0,' + (-NECK) + ')"><g id="' + P + '-hp' + tag + '" transform="rotate(0)"><g id="' + P + '-hs' + tag + '" transform="rotate(0)">' +
        '<g id="' + P + '-hq' + tag + '" transform="scale(1,1)"><g transform="translate(0,' + NECK + ')">' + inner + '</g></g></g></g></g>';
    }
    // --- back hair + ponytail ---
    var hb = '';
    hb += '<g transform="translate(22,-716)"><g id="' + P + '-tail" transform="rotate(0)"><g transform="translate(-22,716)">';
    hb += fillOnly('M 4 -712 C -8 -752 14 -800 62 -806 C 44 -786 40 -764 50 -742 C 66 -776 104 -786 138 -772 C 106 -760 92 -742 82 -716 Z', C.hair);
    hb += fillOnly('M 30 -716 C 62 -742 112 -736 136 -712 C 108 -716 82 -708 60 -700 Z', C.hair);
    hb += fillOnly('M 20 -716 C 14 -746 26 -776 50 -790 C 36 -764 34 -742 40 -722 Z', C.hairD);
    hb += fillOnly('M 70 -730 C 88 -756 112 -764 128 -768 C 108 -754 94 -740 86 -722 Z', C.hairD);
    hb += fillOnly('M 0 -716 C -24 -740 -30 -770 -14 -792 C -12 -766 -4 -744 14 -722 Z', C.hair);
    hb += '</g></g></g>';
    var backHair = 'M -148 -468 C -160 -560 -152 -660 -92 -702 C -40 -734 40 -734 92 -702 C 152 -660 160 -560 148 -468 Q 136 -454 124 -468 L -124 -468 Q -136 -454 -148 -468 Z';
    hb += fillOnly(backHair, C.hair);
    hb += fillOnly('M 120 -560 C 136 -530 140 -500 140 -470 L 126 -468 C 128 -500 126 -530 120 -560 Z', C.hairD);
    hb += fillOnly(mx('M 120 -560 C 136 -530 140 -500 140 -470 L 126 -468 C 128 -500 126 -530 120 -560 Z'), C.hairD);
    m += headWrap('B', hb);

    // --- legs + shoes ---
    var legs = '';
    var legL = 'M -55 -262 L -3 -262 L -9 -34 L -45 -34 Z';
    var hip = 'M -57 -282 L 57 -282 L 55 -226 L -55 -226 Z';
    var cl = P + '-legclip';
    legs += '<clipPath id="' + cl + '"><path d="' + legL + '"/><path d="' + mx(legL) + '"/><path d="' + hip + '"/></clipPath>';
    legs += fillOnly(legL, C.leg) + fillOnly(mx(legL), C.leg) + fillOnly(hip, C.leg);
    legs += '<g clip-path="url(#' + cl + ')">';
    for (var y = -250; y < -30; y += 30) legs += '<rect x="-70" y="' + y + '" width="140" height="13" fill="' + C.legD + '"/>';
    legs += fillOnly('M -3 -240 L 3 -240 L 9 -34 L -9 -34 Z', C.legD, 'opacity="0.5"');
    legs += '</g>';
    var shoeL = 'M -62 -8 C -64 -30 -46 -44 -28 -42 C -10 -42 0 -30 2 -8 Z';
    var soleL = 'M -68 -14 L 6 -14 Q 9 0 0 0 L -60 0 Q -70 0 -68 -14 Z';
    var capL = 'M -68 -14 C -68 -26 -60 -31 -50 -29 L -48 -14 Z';
    [false, true].forEach(function (mirror) {
      var f = mirror ? mx : function (d) { return d; };
      legs += fillOnly(f(shoeL), C.shoe) + fillOnly(f('M -10 -40 C -2 -34 2 -22 2 -8 L -8 -8 C -8 -22 -10 -32 -16 -40 Z'), C.shoeD);
      legs += fillOnly(f(soleL), C.sole) + fillOnly(f('M -66 -5 L 4 -5 Q 3 0 0 0 L -60 0 Q -66 0 -66 -5 Z'), C.soleD) + fillOnly(f(capL), C.sole);
      legs += stroke(f('M -38 -36 L -26 -32'), '#fff', 4) + stroke(f('M -40 -27 L -28 -23'), '#fff', 4);
    });
    m += legs;

    // --- torso ---
    var t = '';
    t += fillOnly('M -17 -460 L -17 -412 L 17 -412 L 17 -460 Z', C.skin);
    t += fillOnly('M -17 -452 Q 0 -432 17 -452 L 17 -436 Q 0 -420 -17 -436 Z', C.skinD);
    var tee = 'M -48 -428 C -60 -424 -66 -406 -64 -386 L -58 -258 L 58 -258 L 64 -386 C 66 -406 60 -424 48 -428 Z';
    t += fillOnly(tee, C.tee);
    t += fillOnly('M -22 -428 Q 0 -398 22 -428 Z', C.skin);
    t += stroke('M -24 -428 Q 0 -394 24 -428', C.teeD, 5);
    t += fillOnly('M -40 -272 L 40 -272 L 42 -258 L -42 -258 Z', C.teeD);
    // flower print
    var fl = '';
    for (var k = 0; k < 5; k++) { var a = k * 72 * Math.PI / 180; fl += '<circle cx="' + f2(Math.sin(a) * 8) + '" cy="' + f2(-Math.cos(a) * 8) + '" r="7" fill="' + C.flower + '"/>'; }
    fl += '<circle cx="0" cy="0" r="4.5" fill="' + C.flowerC + '"/>';
    t += '<g transform="translate(-2,-366)">' + fl + '</g>';
    // jacket panels
    var jac = 'M -48 -430 C -66 -426 -72 -406 -70 -386 L -66 -250 L -24 -250 C -24 -300 -26 -362 -20 -430 Z';
    [false, true].forEach(function (mirror) {
      var f = mirror ? mx : function (d) { return d; };
      t += fillOnly(f(jac), C.jacket);
      t += fillOnly(f('M -24 -250 C -24 -300 -26 -362 -20 -430 L -30 -430 C -34 -370 -33 -300 -32 -250 Z'), C.jacketD);
      t += fillOnly(f('M -20 -430 L -42 -432 L -30 -372 Z'), C.jacketD);
      t += fillOnly(f('M -66 -262 L -24 -262 L -24 -250 L -66 -250 Z'), C.jacketD);
    });
    // held laptop (back of the lid faces the viewer)
    t += '<g id="' + P + '-laptop" opacity="0">' +
      '<rect x="-100" y="-392" width="200" height="132" rx="12" fill="' + C.lap + '"/>' +
      '<rect x="-100" y="-276" width="200" height="16" rx="6" fill="' + C.lapD + '"/>' +
      '<rect x="-108" y="-262" width="216" height="12" rx="6" fill="#8D97AE"/>' +
      '<circle cx="0" cy="-330" r="24" fill="' + C.tee + '"/>' +
      fillOnly('M 0 -318 C -16 -330 -14 -344 -5 -344 C -2 -344 0 -341 0 -338 C 0 -341 2 -344 5 -344 C 14 -344 16 -330 0 -318 Z', C.jacket) + '</g>';
    m += t;

    // --- head front ---
    var h = '';
    var ear = 'M -112 -580 C -136 -584 -144 -548 -128 -530 C -122 -522 -114 -522 -110 -528 Z';
    h += fillOnly(ear, C.skin) + fillOnly(mx(ear), C.skin);
    h += stroke('M -124 -566 Q -132 -552 -122 -540', C.skinD, 4) + stroke(mx('M -124 -566 Q -132 -552 -122 -540'), C.skinD, 4);
    var faceD = 'M 0 -684 C 74 -684 124 -636 124 -566 C 124 -498 72 -446 0 -446 C -72 -446 -124 -498 -124 -566 C -124 -636 -74 -684 0 -684 Z';
    h += fillOnly(faceD, C.skin);
    h += fillOnly('M 92 -500 C 70 -466 36 -450 0 -448 C 46 -456 80 -476 100 -520 Z', C.skinD, 'opacity="0.55"');
    h += '<ellipse cx="-84" cy="-506" rx="20" ry="12" fill="' + C.cheek + '" opacity="0.85"/><ellipse cx="84" cy="-506" rx="20" ry="12" fill="' + C.cheek + '" opacity="0.85"/>';
    h += stroke('M -6 -522 Q 0 -516 6 -522', C.skinDD, 4);
    ['l', 'r'].forEach(function (side, si) {
      var s = si === 0 ? -1 : 1;
      h += '<g transform="translate(' + EYE[side][0] + ',' + EYE[side][1] + ')"><g id="' + P + '-eye' + side + '" transform="scale(1,1)">';
      EXPRESSIONS.forEach(function (E) {
        h += '<g id="' + P + '-eye' + side + '-' + E + '"' + vis(E === 'neutral') + '>' + eye(P, side + '-' + E, s, EX[E].eyes[si]) + '</g>';
      });
      h += '</g></g>';
    });
    EXPRESSIONS.forEach(function (E) { h += '<g id="' + P + '-fx-' + E + '"' + vis(E === 'neutral') + '>' + (EX[E].fx ? EX[E].fx() : '') + '</g>'; });
    h += '<g transform="translate(0,' + MOUTH_Y + ')"><g id="' + P + '-mouth" transform="scale(1,1)">';
    h += '<g id="' + P + '-mC" opacity="1">';
    EXPRESSIONS.forEach(function (E) { h += '<g id="' + P + '-mC-' + E + '"' + vis(E === 'neutral') + '>' + EX[E].mC(P) + '</g>'; });
    h += '</g><g id="' + P + '-mO" opacity="0" transform="scale(1,1)">';
    EXPRESSIONS.forEach(function (E) { h += '<g id="' + P + '-mO-' + E + '"' + vis(E === 'neutral') + '>' + EX[E].mO(P) + '</g>'; });
    h += '</g></g></g>';
    // bangs: side-swept fringe + face-framing locks
    var bangs = 'M -130 -500 C -146 -600 -128 -690 -40 -714 C 34 -732 116 -704 134 -628 C 144 -584 138 -536 130 -496 ' +
      'Q 122 -540 114 -578 Q 108 -606 96 -616 Q 86 -598 70 -592 Q 66 -616 52 -630 Q 34 -604 8 -598 Q 4 -620 -6 -636 ' +
      'Q -30 -606 -58 -600 Q -62 -620 -70 -628 Q -92 -612 -106 -598 Q -116 -560 -118 -500 Z';
    h += fillOnly(bangs, C.hair);
    h += fillOnly('M 96 -616 Q 108 -606 114 -578 Q 122 -540 130 -496 Q 136 -560 124 -610 Q 112 -650 86 -668 Q 104 -640 96 -616 Z', C.hairD);
    h += fillOnly('M -106 -598 Q -116 -560 -118 -500 L -130 -500 Q -134 -560 -122 -616 Z', C.hairD);
    h += stroke('M -70 -680 Q -30 -704 20 -704', C.hairL, 7) + stroke('M -112 -620 Q -108 -650 -90 -668', C.hairL, 5);
    h += stroke('M 10 -660 Q 40 -676 70 -672', C.hairD, 5);
    // hair tie
    h += '<g transform="translate(22,-712) rotate(-14)"><rect x="-20" y="-11" width="40" height="22" rx="10" fill="' + C.tie + '"/>' +
      '<rect x="-20" y="2" width="40" height="9" rx="4" fill="' + C.tieD + '"/></g>';
    EXPRESSIONS.forEach(function (E) {
      h += '<g id="' + P + '-brow-' + E + '"' + vis(E === 'neutral') + '>' + brow(-1, EX[E].brows[0]) + brow(1, EX[E].brows[1]) + '</g>';
    });
    m += headWrap('F', h);

    // --- arms: edge chain then fill chain ---
    function arm(side, fill) {
      var a = side === 'R' ? idleR : idleL;
      var s = side === 'R' ? -1 : 1;
      var tg = fill ? 'f' : 'k';
      var id = function (n) { return P + '-' + side + tg + '-' + n; };
      var o = '<g id="' + id('sp') + '" transform="translate(' + SH[side][0] + ',' + SH[side][1] + ')"><g id="' + id('sh') + '" transform="rotate(' + f2(a.sh) + ')">';
      o += '<line id="' + id('ul') + '" x1="0" y1="0" x2="0" y2="' + U + '" stroke="' + (fill ? C.jacket : C.jacketD) + '" stroke-width="' + (fill ? 30 : 35) + '" stroke-linecap="round"/>';
      if (fill) o += '<circle cx="0" cy="-2" r="19" fill="' + C.jacket + '"/>' + fillOnly('M ' + (s * 4) + ' -14 C ' + (s * 16) + ' -10 ' + (s * 17) + ' 10 ' + (s * 14) + ' 40 L ' + (s * 8) + ' 40 C ' + (s * 10) + ' 14 ' + (s * 10) + ' -4 ' + (s * 4) + ' -14 Z', C.jacketL, 'opacity="0.6"');
      o += '<g id="' + id('ep') + '" transform="translate(0,' + U + ')"><g id="' + id('el') + '" transform="rotate(' + f2(a.el) + ')">';
      if (fill) {
        o += '<line id="' + id('fk') + '" x1="0" y1="8" x2="0" y2="' + F + '" stroke="' + C.jacketD + '" stroke-width="31" stroke-linecap="butt"/>';
        o += '<line id="' + id('fl') + '" x1="0" y1="0" x2="0" y2="' + F + '" stroke="' + C.jacket + '" stroke-width="27" stroke-linecap="round"/>';
        o += '<g id="' + id('wp') + '" transform="translate(0,' + F + ')"><g id="' + id('wr') + '" transform="rotate(' + f2(a.wr) + ')">';
        HAND_NAMES.forEach(function (hn) {
          o += '<g id="' + id('hand-' + hn) + '"' + vis(hn === a.shape) + '><g transform="scale(' + (-s) + ',1)">' + HANDS[hn]() + '</g></g>';
        });
        o += '<rect x="-15" y="-10" width="30" height="12" rx="6" fill="' + C.jacketD + '"/>';
        o += '</g></g>';
      } else {
        o += '<line id="' + id('fl') + '" x1="0" y1="0" x2="0" y2="' + F + '" stroke="' + C.jacketD + '" stroke-width="32" stroke-linecap="round"/>';
      }
      o += '</g></g></g></g>';
      return o;
    }
    m += arm('R', false) + arm('R', true) + arm('L', false) + arm('L', true);
    m += '</g></g></g></g>';
    return m;
  }

  // ---------------------------------------------------------------- API
  function create(parent, opts) {
    opts = opts || {};
    var P = opts.id || 'girl';
    var root = document.createElementNS(NS, 'g');
    root.setAttribute('id', P + '-root');
    root.innerHTML = '<g id="' + P + '-flip" transform="scale(' + (opts.flip ? -1 : 1) + ',1)">' + buildMarkup(P) + '</g>';
    parent.appendChild(root);
    gsap.set(root, { x: opts.x || 0, y: opts.y || 0, scale: opts.scale || 1, svgOrigin: '0 0' });

    function $(n) { return root.querySelector('#' + P + '-' + n); }
    function $$(list) { return list.map($); }
    var eyes = $$(['eyel', 'eyer']);
    var headQ = $$(['hqB', 'hqF']), headP = $$(['hpB', 'hpF']), headS = $$(['hsB', 'hsF']);
    var parts = {};
    EXPRESSIONS.forEach(function (E) { parts[E] = $$(['eyel-' + E, 'eyer-' + E, 'brow-' + E, 'mC-' + E, 'mO-' + E, 'fx-' + E]); });
    var mC = $('mC'), mO = $('mO');
    var props = { laptop: $('laptop') };
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
      root: root, props: props, id: P, expressions: EXPRESSIONS.slice(), poses: Object.keys(POSES),
      blink: function (tl, t, dur) {
        dur = dur || 0.13; var c = dur * 0.42;
        tl.fromTo(eyes, { attr: { transform: 'scale(1,1)' } }, { attr: { transform: 'scale(1,0.08)' }, duration: c, ease: 'power2.in', immediateRender: false }, t);
        tl.fromTo(eyes, { attr: { transform: 'scale(1,0.08)' } }, { attr: { transform: 'scale(1,1)' }, duration: dur - c, ease: 'power2.out', immediateRender: false }, t + c);
        return api;
      },
      autoBlink: function (tl, t0, t1) {
        var r = rng(seedBase ^ Math.round(t0 * 1000));
        var t = t0 + 0.4 + r() * 1.2;
        while (t < t1 - 0.2) { api.blink(tl, t); if (r() < 0.15 && t + 0.32 < t1) api.blink(tl, t + 0.2); t += 2.5 + r() * 1.5; }
        return api;
      },
      face: function (tl, t, name) {
        if (!parts[name]) throw new Error('Girl.face: unknown expression ' + name);
        var h = 0.06;
        tl.fromTo(eyes, { attr: { transform: 'scale(1,1)' } }, { attr: { transform: 'scale(1,0.1)' }, duration: h, ease: 'power1.in', immediateRender: false }, t);
        tl.fromTo(headQ, { attr: { transform: 'scale(1,1)' } }, { attr: { transform: 'scale(1.025,0.972)' }, duration: h, ease: 'power1.out', immediateRender: false }, t);
        EXPRESSIONS.forEach(function (E) { tl.set(parts[E], { attr: { opacity: E === name ? 1 : 0 } }, t + h - EPS); });
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
          HAND_NAMES.forEach(function (hn) { tl.set(A.hands[hn], { attr: { opacity: hn === a.shape ? 1 : 0 } }, t + dur * 0.5 - EPS); });
        });
        tl.set(props.laptop, { attr: { opacity: p.prop === 'laptop' ? 1 : 0 } }, t + dur * 0.5 - EPS);
        tl.to(headP, { attr: { transform: 'rotate(' + p.head + ')' }, duration: dur * 1.2, ease: ease }, t);
        return api;
      },
      waveHand: function (tl, t0, t1, side) {
        side = side || 'R';
        var base = (side === 'R' ? POSES.wave.R : POSES.waveL.L).el, span = t1 - t0;
        if (span < 0.15) return api;
        var n = Math.max(2, Math.floor(span / 0.17) - 1); if (n % 2) n -= 1;
        var half = span / (n + 1), A = arms[side].el;
        tl.to(A, { attr: { transform: 'rotate(' + f2(base - 16) + ')' }, duration: half / 2, ease: 'sine.out' }, t0);
        tl.to(A, { attr: { transform: 'rotate(' + f2(base + 16) + ')' }, duration: half, ease: 'sine.inOut', repeat: n - 1, yoyo: true }, t0 + half / 2);
        tl.to(A, { attr: { transform: 'rotate(' + f2(base) + ')' }, duration: half / 2, ease: 'sine.in' }, t0 + half / 2 + half * n);
        return api;
      },
      prop: function (tl, t, name, on) { tl.set(props[name], { attr: { opacity: on ? 1 : 0 } }, t - EPS); return api; },
      bob: function (tl, t0, t1, amp) {
        amp = amp == null ? 6 : amp;
        var half = 0.8, n = Math.floor((t1 - t0) / half);
        if (n % 2) n -= 1; if (n < 2) return api;
        var sy = 1 - amp / 620, sx = 1 + amp / 2400;
        tl.to($('bob'), { attr: { transform: 'scale(' + f2(sx * 1000) / 1000 + ',' + f2(sy * 1000) / 1000 + ')' }, duration: half, ease: 'sine.inOut', repeat: n - 1, yoyo: true }, t0);
        return api;
      },
      hairSway: function (tl, t0, t1) {
        var tail = $('tail'), t = t0, i = 0, prev = 0;
        while (t + 0.5 <= t1) { var v = (i % 2 ? -5 : 6); tl.fromTo(tail, { attr: { transform: 'rotate(' + prev + ')' } }, { attr: { transform: 'rotate(' + v + ')' }, duration: 0.5, ease: 'sine.inOut', immediateRender: false }, t); prev = v; t += 0.5; i++; }
        return api;
      },
      flick: function (tl, t) {   // ponytail whip on jumps / turns
        var tail = $('tail');
        tl.to(tail, { attr: { transform: 'rotate(-18)' }, duration: 0.12, ease: 'power2.out' }, t);
        tl.to(tail, { attr: { transform: 'rotate(0)' }, duration: 0.5, ease: 'elastic.out(1.2,0.35)' }, t + 0.12);
        return api;
      },
      jump: function (tl, t, h) {
        h = h == null ? 60 : h;
        var J = $('jump'), S = $('squash'), Sh = $('shadow');
        tl.to(S, { attr: { transform: 'scale(1.06,0.9)' }, duration: 0.1, ease: 'power2.out' }, t);
        tl.to(J, { attr: { transform: 'translate(0,' + (-h) + ')' }, duration: 0.26, ease: 'power2.out' }, t + 0.1);
        tl.to(S, { attr: { transform: 'scale(0.95,1.07)' }, duration: 0.1, ease: 'power2.out' }, t + 0.1);
        tl.to(S, { attr: { transform: 'scale(1,1)' }, duration: 0.16, ease: 'sine.inOut' }, t + 0.2);
        var ss = f2(Math.max(0.55, 1 - h / 200));
        tl.to(Sh, { attr: { transform: 'scale(' + ss + ',' + ss + ')' }, duration: 0.26, ease: 'power2.out' }, t + 0.1);
        tl.to(J, { attr: { transform: 'translate(0,0)' }, duration: 0.22, ease: 'power2.in' }, t + 0.36);
        tl.to(Sh, { attr: { transform: 'scale(1,1)' }, duration: 0.22, ease: 'power2.in' }, t + 0.36);
        tl.to(S, { attr: { transform: 'scale(1.08,0.9)' }, duration: 0.06, ease: 'power2.out' }, t + 0.58);
        tl.to(S, { attr: { transform: 'scale(1,1)' }, duration: 0.2, ease: 'back.out(2.5)' }, t + 0.64);
        return api;
      },
      lean: function (tl, t, deg, d) { tl.to(headS, { attr: { transform: 'rotate(' + deg + ')' }, duration: d || 0.3, ease: 'power2.inOut' }, t); return api; }
    };
    return api;
  }
  window.Girl = { create: create, EXPRESSIONS: EXPRESSIONS, POSES: Object.keys(POSES), COLORS: C };
})();
