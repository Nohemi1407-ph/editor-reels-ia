import React from 'react';
import {easeIn, easeOut, glow, lin, SANS, spr, svgGlow, useT} from '../kit/theme';
import {Emoji, LIME, ORANGE, RED, shake} from './kit';

type Pt = [number, number];

/** Arrow drawn from `from` to `to` with a curve; progress 0..1 draws, retract 0..1 erases */
const Arrow: React.FC<{from: Pt; to: Pt; bend?: number; color: string; draw: number; fade: number}> = ({
  from,
  to,
  bend = 0.25,
  color,
  draw,
  fade,
}) => {
  if (draw <= 0.001 || fade >= 0.999) return null;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const my = (y1 + y2) / 2 + (x2 - x1) * bend;
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  // tangent at end
  const ang = Math.atan2(y2 - my, x2 - mx);
  const hs = 30;
  const head = `M ${x2 - hs * Math.cos(ang - 0.5)} ${y2 - hs * Math.sin(ang - 0.5)} L ${x2} ${y2} L ${
    x2 - hs * Math.cos(ang + 0.5)
  } ${y2 - hs * Math.sin(ang + 0.5)}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: 1 - fade, overflow: 'visible'}}>
      <g style={{filter: svgGlow(color, 0.7)}}>
        <path d={d} stroke="#000" strokeOpacity={0.5} strokeWidth={14} fill="none" strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <path d={d} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - draw} />
        {draw > 0.95 && (
          <path d={head} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </g>
      {draw > 0.95 && (
        <circle cx={x2} cy={y2} r={10 + 26 * lin(draw, 0.95, 1)} fill="none" stroke={color} strokeWidth={4}
          opacity={0.6 * (1 - lin(draw, 0.95, 1))} />
      )}
    </svg>
  );
};

type Label = {
  at: number;
  arrowOff: number; // when the arrow retracts
  end: number;
  x: number;
  y: number;
  emoji: string;
  pre?: string; // neon part
  text: string;
  color: string;
  from: Pt;
  to: Pt;
  bend?: number;
  size?: number;
};

const LABELS: Label[] = [
  // tripod / hang chips (6.46 - 10.27)
  {at: 8.76, arrowOff: 9.95, end: 9.95, x: 600, y: 988, emoji: '📐', text: 'TRÍPODE', color: LIME,
    from: [606, 1036], to: [528, 1086], bend: 0.35, size: 58},
  {at: 9.95, arrowOff: 10.25, end: 10.25, x: 40, y: 172, emoji: '🪝', text: 'SE PUEDE COLGAR', color: ORANGE,
    from: [640, 214], to: [660, 330], bend: -0.4, size: 58},
  // spec callouts (10.69 - 15.09)
  {at: 10.89, arrowOff: 12.6, end: 15.06, x: 40, y: 172, emoji: '💡', pre: '3', text: 'NIVELES DE LUZ', color: LIME,
    from: [470, 268], to: [570, 640], bend: -0.2, size: 62},
  {at: 12.64, arrowOff: 13.95, end: 15.06, x: 270, y: 294, emoji: '⚡', pre: '4', text: 'VELOCIDADES', color: ORANGE,
    from: [690, 392], to: [710, 690], bend: 0.15, size: 62},
  {at: 13.98, arrowOff: 14.62, end: 15.06, x: 40, y: 416, emoji: '🎒', text: 'PORTÁTIL', color: LIME,
    from: [430, 460], to: [650, 630], bend: -0.25, size: 62},
  {at: 14.65, arrowOff: 15.06, end: 15.06, x: 510, y: 416, emoji: '✅', text: 'VERSÁTIL', color: LIME,
    from: [760, 506], to: [820, 650], bend: 0.2, size: 62},
];

const LabelChip: React.FC<{l: Label}> = ({l}) => {
  const t = useT();
  if (t < l.at - 0.04 || t > l.end + 0.2) return null;
  const p = spr(t, l.at - 0.04, {damping: 10, stiffness: 240, mass: 0.55});
  const exit = lin(t, l.end, l.end + 0.15, 0, 1, easeIn);
  const draw = lin(t, l.at + 0.05, l.at + 0.4, 0, 1, easeOut);
  const fade = lin(t, l.arrowOff - 0.12, l.arrowOff, 0, 1);
  const size = l.size ?? 56;
  const active = t < l.arrowOff;
  return (
    <>
      <Arrow from={l.from} to={l.to} bend={l.bend} color={l.color} draw={draw} fade={Math.max(fade, exit)} />
      <div
        style={{
          position: 'absolute',
          left: l.x,
          top: l.y,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: `${size * 0.16}px ${size * 0.4}px ${size * 0.18}px ${size * 0.26}px`,
          borderRadius: 20,
          background: 'rgba(12,13,17,0.92)',
          border: `4px solid ${l.color}`,
          boxShadow: `0 12px 28px rgba(0,0,0,0.45), 0 0 ${active ? 26 : 10}px ${l.color}${active ? 'aa' : '55'}`,
          transform: `translateX(${(1 - Math.min(1, p)) * -60}px) scale(${(0.5 + 0.5 * p) * (1 - exit * 0.3)})`,
          transformOrigin: '0% 50%',
          opacity: Math.min(1, p * 2) * (1 - exit),
          whiteSpace: 'nowrap',
        }}
      >
        <Emoji e={l.emoji} size={size * 0.9} />
        {l.pre && (
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: size * 1.15, lineHeight: 1, color: l.color, textShadow: glow(l.color, 0.6)}}>
            {l.pre}
          </span>
        )}
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1, color: '#fff', letterSpacing: '0.01em'}}>
          {l.text}
        </span>
      </div>
    </>
  );
};

export const Callouts: React.FC = () => (
  <>
    {LABELS.map((l, i) => (
      <LabelChip key={i} l={l} />
    ))}
  </>
);

/* ---------------- SE AGOTA badge (16.62 ->) ---------------- */
export const SoldOutBadge: React.FC = () => {
  const t = useT();
  const at = 16.58;
  if (t < at) return null;
  const p = spr(t, at, {damping: 9, stiffness: 260, mass: 0.55});
  const sh = shake(t, at + 0.05, 0.45, 12);
  const flashOn = Math.floor((t - at) * 30 / 7) % 2 === 0;
  const exit = lin(t, 20.0, 20.25, 0, 1, easeIn);
  return (
    <div style={{position: 'absolute', left: 40, top: 172, opacity: 1 - exit}}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 26px 14px 18px',
          borderRadius: 18,
          background: flashOn ? RED : '#B5001F',
          border: '4px solid #fff',
          boxShadow: `0 10px 26px rgba(0,0,0,0.45), 0 0 ${flashOn ? 40 : 16}px ${RED}`,
          transform: `translate(${sh.x}px, ${sh.y}px) rotate(${-3 + sh.r}deg) scale(${0.4 + 0.6 * p})`,
          transformOrigin: '0% 50%',
        }}
      >
        <Emoji e="🔥" size={58} />
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1, color: '#fff', letterSpacing: '0.01em'}}>
          SE AGOTA RÁPIDO
        </span>
      </div>
    </div>
  );
};
