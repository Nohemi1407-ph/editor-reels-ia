import React from 'react';
import {LIME, svgGlow} from '../kit/theme';

const BODY = '#E4E8EC';
const SIDE = '#AEB6BF';
const TOP = '#CDD3DA';
const PANEL = '#262B33';
const STROKE = '#0B0D10';

/** Flat vector top-load washer. open: 0..1 lid opening, glowAmt: 0..1 */
export const TopLoadWasher: React.FC<{open: number; glowAmt: number; t: number}> = ({open, glowAmt, t}) => {
  const th = (open * 105 * Math.PI) / 180;
  const D = [-26, 33];
  const L = 44;
  const fx = (bx: number, by: number) => [bx + D[0] * Math.cos(th), by + D[1] * Math.cos(th) - L * Math.sin(th)];
  const B1 = [96, 76];
  const B2 = [262, 76];
  const F1 = fx(B1[0], B1[1]);
  const F2 = fx(B2[0], B2[1]);
  const lid = `M${B1[0]},${B1[1]} L${B2[0]},${B2[1]} L${F2[0]},${F2[1]} L${F1[0]},${F1[1]} Z`;
  const lidBack = Math.sin(th) > 0.85; // lid past vertical -> show underside darker
  const flick = 0.85 + Math.sin(t * 13) * 0.08;
  return (
    <svg viewBox="0 0 320 260" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={LIME} stopOpacity={0.85} />
          <stop offset="1" stopColor={LIME} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx={160} cy={254} rx={115} ry={9} fill="#000" opacity={0.35} />
      {/* side */}
      <path d="M240,110 L268,74 L268,214 L240,250 Z" fill={SIDE} stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      {/* front */}
      <rect x={60} y={110} width={180} height={140} rx={6} fill={BODY} stroke={STROKE} strokeWidth={3} />
      <rect x={60} y={110} width={180} height={16} fill="#D3D8DE" stroke={STROKE} strokeWidth={3} />
      <rect x={86} y={232} width={128} height={6} rx={3} fill="#B9C0C8" />
      {/* top face */}
      <path d="M60,110 L240,110 L268,74 L88,74 Z" fill={TOP} stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      {/* tub opening */}
      <ellipse cx={164} cy={93} rx={64} ry={11} fill="#14171C" />
      <ellipse cx={164} cy={93} rx={64} ry={11} fill={LIME} opacity={glowAmt * 0.9 * flick} style={{filter: svgGlow(LIME, 1.4)}} />
      {/* light beam */}
      <path d="M100,93 L228,93 L250,-20 L78,-20 Z" fill="url(#beam)" opacity={glowAmt * 0.55 * flick} />
      {/* backsplash */}
      <path d="M88,74 L268,74 L268,38 L88,38 Z" fill={PANEL} stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={112} cy={56} r={9} fill="#9AA3AD" />
      <circle cx={244} cy={56} r={9} fill="#9AA3AD" />
      <rect x={150} y={49} width={56} height={14} rx={4} fill={LIME} opacity={0.85} style={{filter: svgGlow(LIME, 0.5)}} />
      {/* lid */}
      <path d={lid} fill={lidBack ? '#B8C0C8' : '#EEF1F4'} stroke={glowAmt > 0.05 ? LIME : STROKE} strokeWidth={3} strokeLinejoin="round" style={glowAmt > 0.05 ? {filter: svgGlow(LIME, 0.6 * glowAmt)} : undefined} />
    </svg>
  );
};

/** Flat vector front-load washer / dryer */
export const FrontLoad: React.FC<{
  t: number;
  spin: number; // rotations per second
  ringGlow: number;
  ringColor?: string;
  water?: number; // 0..1 level of water inside drum (0 = none)
  waterWobble?: number;
  dryer?: boolean;
  clothes?: boolean;
}> = ({t, spin, ringGlow, ringColor = LIME, water = 0.45, waterWobble = 1, dryer = false, clothes = true}) => {
  const ang = t * spin * 360;
  const cx = 150;
  const cy = 158;
  const R = 46;
  const level = cy + R - water * 2 * R;
  const wave = (ph: number) => {
    let d = `M${cx - R - 10},${level}`;
    for (let x = -R - 10; x <= R + 10; x += 6) {
      d += ` L${cx + x},${level + Math.sin(x / 9 + ph) * 4 * waterWobble}`;
    }
    d += ` L${cx + R + 10},${cy + R + 10} L${cx - R - 10},${cy + R + 10} Z`;
    return d;
  };
  const id = dryer ? 'dr' : 'fl';
  return (
    <svg viewBox="0 0 300 260" width="100%" height="100%" style={{overflow: 'visible'}}>
      <defs>
        <clipPath id={`glass-${id}`}>
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <radialGradient id={`gl-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={dryer ? '#3A4250' : '#2C5A78'} />
          <stop offset="1" stopColor={dryer ? '#171A20' : '#132836'} />
        </radialGradient>
      </defs>
      <ellipse cx={150} cy={254} rx={105} ry={9} fill="#000" opacity={0.35} />
      <path d="M230,38 L252,22 L252,232 L230,250 Z" fill={SIDE} stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M70,38 L230,38 L252,22 L92,22 Z" fill={TOP} stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />
      <rect x={70} y={38} width={160} height={212} rx={8} fill={BODY} stroke={STROKE} strokeWidth={3} />
      {/* panel */}
      <rect x={70} y={38} width={160} height={42} rx={8} fill={PANEL} stroke={STROKE} strokeWidth={3} />
      <rect x={84} y={52} width={34} height={14} rx={4} fill={dryer ? '#FF9F43' : LIME} opacity={0.85} />
      <circle cx={204} cy={59} r={11} fill="#9AA3AD" stroke={STROKE} strokeWidth={2} />
      <line x1={204} y1={59} x2={204 + 8 * Math.cos(ang / 200)} y2={59 + 8 * Math.sin(ang / 200)} stroke={STROKE} strokeWidth={2.5} />
      {/* door ring */}
      <circle cx={cx} cy={cy} r={R + 14} fill="#C9D0D7" stroke={STROKE} strokeWidth={3} />
      {/* glass */}
      <g clipPath={`url(#glass-${id})`}>
        <circle cx={cx} cy={cy} r={R} fill={`url(#gl-${id})`} />
        {clothes && (
          <g transform={`rotate(${ang} ${cx} ${cy})`}>
            <ellipse cx={cx - 18} cy={cy + 22} rx={20} ry={11} fill="#FF7A59" />
            <ellipse cx={cx + 22} cy={cy + 12} rx={16} ry={10} fill="#5AC8FA" />
            <ellipse cx={cx + 4} cy={cy - 24} rx={18} ry={9} fill="#F5D547" />
            <ellipse cx={cx - 26} cy={cy - 6} rx={12} ry={8} fill="#E9ECEF" />
            <path d={`M${cx - 30},${cy} A30,30 0 0 1 ${cx + 30},${cy}`} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {water > 0 && (
          <>
            <path d={wave(t * 7)} fill="#4FB4FF" opacity={0.55} />
            <path d={wave(t * 9 + 2)} fill="#7FD0FF" opacity={0.35} />
          </>
        )}
        <path d={`M${cx - 30},${cy - 30} A40,40 0 0 1 ${cx + 8},${cy - 42}`} stroke="#fff" strokeOpacity={0.5} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={STROKE} strokeWidth={3} />
      {/* neon ring glow */}
      <circle
        cx={cx}
        cy={cy}
        r={R + 7}
        fill="none"
        stroke={ringColor}
        strokeWidth={6}
        opacity={ringGlow}
        style={{filter: svgGlow(ringColor, 1)}}
      />
      <rect x={cx + R + 6} y={cy - 12} width={8} height={24} rx={3} fill="#8F98A2" />
    </svg>
  );
};
