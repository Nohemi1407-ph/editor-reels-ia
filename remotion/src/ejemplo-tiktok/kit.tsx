import React from 'react';
import {glow, SANS} from '../kit/theme';

export const ORANGE = '#FF7A00';
export const TT_RED = '#FE2C55';
export const LIME = '#C8FF00';
export const RED = '#FF2D55';
export const W = 1080;
export const H = 1920;

export const CUTS = [2.242, 3.788, 6.364, 10.273, 15.091];

/** White (or neon) text with a thick black outline + drop shadow. Emoji should be passed outside. */
export const StrokeText: React.FC<{
  children: React.ReactNode;
  size: number;
  color?: string;
  stroke?: number;
  weight?: number;
  neon?: boolean;
  style?: React.CSSProperties;
}> = ({children, size, color = '#FFFFFF', stroke, weight = 900, neon, style}) => {
  const sw = stroke ?? Math.max(8, Math.round(size * 0.15));
  const base: React.CSSProperties = {
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: '-0.005em',
    wordSpacing: '0.1em',
    whiteSpace: 'nowrap',
  };
  return (
    <span style={{position: 'relative', display: 'inline-block', ...style}}>
      <span
        aria-hidden
        style={{
          ...base,
          position: 'absolute',
          left: 0,
          top: 0,
          color: '#000',
          WebkitTextStroke: `${sw}px #000`,
          textShadow: `0 ${size * 0.06}px 0 #000, 0 ${size * 0.1}px ${size * 0.25}px rgba(0,0,0,0.55)`,
        }}
      >
        {children}
      </span>
      <span
        style={{
          ...base,
          position: 'relative',
          color,
          textShadow: neon ? glow(color, size / 110) : 'none',
        }}
      >
        {children}
      </span>
    </span>
  );
};

export const Emoji: React.FC<{e: string; size: number; style?: React.CSSProperties}> = ({e, size, style}) => (
  <span
    style={{
      fontSize: size,
      lineHeight: 1,
      fontFamily: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",
      filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
      display: 'inline-block',
      ...style,
    }}
  >
    {e}
  </span>
);

/** deterministic shake offset that decays over `dur` seconds after `at` */
export const shake = (t: number, at: number, dur: number, amp: number) => {
  if (t < at || t > at + dur) return {x: 0, y: 0, r: 0};
  const k = 1 - (t - at) / dur;
  const f = (t - at) * 30;
  return {
    x: Math.sin(f * 2.7) * amp * k,
    y: Math.cos(f * 3.3) * amp * 0.7 * k,
    r: Math.sin(f * 2.1) * amp * 0.12 * k,
  };
};
