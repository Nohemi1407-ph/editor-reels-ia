import type React from 'react';
import {Easing, interpolate, spring, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const LIME = '#C8FF00';
export const RED = '#FF2D55';
export const GREEN = '#39FF88';
export const INK = '#0E1014';
export const SANS = "'Inter Tight', sans-serif";
export const SERIF = "'DM Serif Display', serif";

export const glow = (c: string, s = 1) =>
  `0 0 ${10 * s}px ${c}cc, 0 0 ${26 * s}px ${c}88, 0 0 ${48 * s}px ${c}44`;
export const svgGlow = (c: string, s = 1) =>
  `drop-shadow(0 0 ${5 * s}px ${c}) drop-shadow(0 0 ${14 * s}px ${c}aa)`;

/** absolute time in seconds */
export const useT = () => useCurrentFrame() / FPS;

type SprCfg = {damping?: number; stiffness?: number; mass?: number};
/** spring that starts at time `at` (seconds). 0 before. overshoots by default */
export const spr = (t: number, at: number, cfg: SprCfg = {}) => {
  if (t < at) return 0;
  return spring({
    frame: (t - at) * FPS,
    fps: FPS,
    config: {damping: 11, stiffness: 170, mass: 0.7, ...cfg},
  });
};

/** clamped linear/eased map from time window [a,b] to [from,to] */
export const lin = (
  t: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (n: number) => number = Easing.bezier(0.33, 0, 0.2, 1),
) =>
  interpolate(t, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const easeIn = Easing.in(Easing.cubic);
export const easeOut = Easing.out(Easing.cubic);

/** card style shared by all inserts */
export const cardStyle: React.CSSProperties = {
  position: 'absolute',
  background: 'linear-gradient(160deg, #1B1E25 0%, #0D0F13 100%)',
  borderRadius: 30,
  border: '1.5px solid rgba(255,255,255,0.09)',
  boxShadow: '0 22px 50px rgba(0,0,0,0.38), 0 6px 14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
  overflow: 'hidden',
};

export const lerpColor = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * p));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};
