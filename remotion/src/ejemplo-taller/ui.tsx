import React from 'react';
import {glow, lin, easeIn, spr, SANS, useT} from '../kit/theme';

/** The top-band box: x 35-1045, y 225-565 */
export const BAND = {left: 35, top: 225, width: 1010, height: 340};

export const InsertFrame: React.FC<{
  start: number;
  end: number;
  children: React.ReactNode;
}> = ({start, end, children}) => {
  const t = useT();
  if (t < start - 0.001 || t > end) return null;
  const enter = spr(t, start, {damping: 13, stiffness: 190});
  const exit = lin(t, end - 0.2, end, 0, 1, easeIn);
  const float = Math.sin((t - start) * 2.1) * 3;
  return (
    <div
      style={{
        position: 'absolute',
        ...BAND,
        transform: `translateY(${(1 - enter) * -36 - exit * 26 + float}px) scale(${
          0.9 + 0.1 * enter - exit * 0.07
        })`,
        opacity: Math.min(1, enter * 1.6) * (1 - exit),
        transformOrigin: '50% 40%',
      }}
    >
      {children}
    </div>
  );
};

/** pop-in factor helpers */
export const usePop = (at: number, cfg?: Parameters<typeof spr>[2]) => {
  const t = useT();
  return spr(t, at, cfg);
};

/** neon label text, pops in at `at` */
export const NeonLabel: React.FC<{
  at: number;
  color: string;
  size?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dim?: number;
}> = ({at, color, size = 44, children, style, dim = 1}) => {
  const t = useT();
  const p = spr(t, at, {damping: 9, stiffness: 220, mass: 0.6});
  const flicker = t > at && t < at + 0.25 ? (Math.floor((t - at) * 30) % 3 === 1 ? 0.55 : 1) : 1;
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: '0.02em',
        color,
        textShadow: glow(color, 0.8),
        opacity: Math.min(1, p * 2) * flicker * dim,
        transform: `scale(${0.4 + 0.6 * p})`,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CheckIcon: React.FC<{size: number; color: string; stroke?: number; progress?: number}> = ({
  size,
  color,
  stroke = 7,
  progress = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{overflow: 'visible'}}>
    <path
      d="M8 21 L17 30 L33 11"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);
