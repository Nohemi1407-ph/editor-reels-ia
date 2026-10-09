import React from 'react';
import {easeIn, lin, spr, useT} from '../kit/theme';
import words from './words.json';
import {LIME, ORANGE, RED, StrokeText} from './kit';

type Wd = {text: string; start: number; end: number};
const WORDS = words as Wd[];

// group = [firstIndex, lastIndex]
const GROUPS: [number, number][] = [
  [0, 1], [2, 4], [5, 7], [8, 10], [11, 12], [13, 14], [15, 17], [18, 18], [19, 20], [21, 21],
  [22, 25], [26, 27], [28, 29], [30, 32], [33, 34], [35, 36], [37, 38], [39, 40], [41, 42], [43, 43],
  [44, 45], [46, 47], [48, 48], [49, 49], [50, 52], [53, 55], [56, 57], [58, 61], [62, 64], [65, 66],
  [67, 68], [69, 69], [70, 71], [72, 74], [75, 77], [78, 78],
];

const KEY: Record<number, string> = {
  1: ORANGE, 7: LIME, 10: LIME, 12: ORANGE, 14: ORANGE, 18: LIME, 20: ORANGE, 21: LIME,
  27: LIME, 29: LIME, 32: LIME, 36: LIME, 40: LIME, 42: LIME, 45: LIME, 46: LIME, 48: ORANGE,
  52: LIME, 55: LIME, 63: LIME, 66: RED, 68: RED, 69: LIME, 71: LIME, 74: ORANGE, 77: ORANGE, 78: ORANGE,
};

const clean = (s: string) => s.replace(/[,.]/g, '').toUpperCase();

/** caption vertical centre per time (moves up a bit while the CTA is on screen) */
const centerY = (t: number) => (t >= 15.1 ? 1205 : 1240);
const CX = 490; // centred between 40px left margin and the 140px right column
const MAXW = 860;

export const Captions: React.FC = () => {
  const t = useT();
  const gi = GROUPS.findIndex(([a], i) => {
    const next = GROUPS[i + 1];
    const s = WORDS[a].start - 0.03;
    const e = next ? WORDS[next[0]].start - 0.03 : 20.3;
    return t >= s && t < e;
  });
  if (gi < 0) return null;
  const [a, b] = GROUPS[gi];
  const ws = WORDS.slice(a, b + 1);
  const gStart = WORDS[a].start - 0.03;
  const chars = ws.map((w) => clean(w.text)).join(' ').length;
  const size = Math.min(116, Math.floor(MAXW / (chars * 0.64)));
  const enter = spr(t, gStart, {damping: 12, stiffness: 260, mass: 0.55});
  const last = gi === GROUPS.length - 1;
  const exit = last ? lin(t, 20.0, 20.25, 0, 1, easeIn) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: CX - 500,
        width: 1000,
        top: centerY(t) - size * 0.6,
        display: 'flex',
        justifyContent: 'center',
        gap: size * 0.24,
        transform: `scale(${0.85 + 0.15 * enter}) translateY(${(1 - enter) * 16}px)`,
        opacity: Math.min(1, enter * 2) * (1 - exit),
      }}
    >
      {ws.map((w, i) => {
        const idx = a + i;
        const at = w.start - 0.03;
        const on = t >= at;
        const p = spr(t, at, {damping: 10, stiffness: 300, mass: 0.5});
        const current = on && (i === ws.length - 1 || t < ws[i + 1].start - 0.03);
        const col = KEY[idx];
        const sc = on ? 1.15 - 0.15 * Math.min(1, p) + (p > 1 ? (p - 1) * 0.3 : 0) : 0.6;
        return (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              opacity: on ? Math.min(1, p * 3) : 0,
              transform: `scale(${sc}) translateY(${current ? -4 : 0}px)`,
              transformOrigin: '50% 70%',
            }}
          >
            <StrokeText size={size} color={col ?? '#FFFFFF'} neon={!!col}>
              {clean(w.text)}
            </StrokeText>
          </span>
        );
      })}
    </div>
  );
};
