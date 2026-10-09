import React from 'react';
import {Easing, interpolate} from 'remotion';
import {cardStyle, GREEN, glow, LIME, lin, RED, SANS, spr, svgGlow, useT, easeOut} from '../../kit/theme';
import {CheckIcon, InsertFrame} from '../ui';

const BP = '#BFE6FF';

const Step: React.FC<{n: string; label: string; on: number; color: string; y: number}> = ({n, label, on, color, y}) => (
  <div
    style={{
      position: 'absolute',
      left: 560,
      top: y,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      opacity: 0.35 + 0.65 * on,
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 99,
        border: `4px solid ${on > 0.5 ? color : '#5B6573'}`,
        boxShadow: on > 0.5 ? glow(color, 0.5) : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: 30,
        color: on > 0.5 ? color : '#8C95A1',
        transform: `scale(${1 + 0.15 * Math.sin(Math.min(1, on) * Math.PI)})`,
      }}
    >
      {n}
    </div>
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 900,
        fontSize: 40,
        letterSpacing: '0.05em',
        color: on > 0.5 ? color : '#8C95A1',
        textShadow: on > 0.5 ? glow(color, 0.6) : 'none',
      }}
    >
      {label}
    </div>
  </div>
);

export const Diagnostico: React.FC = () => {
  const t = useT();
  const draw = lin(t, 24.22, 25.1, 0, 1, easeOut);
  const draw2 = lin(t, 24.5, 25.3, 0, 1, easeOut);
  // magnifier path: fast scan, slows at "dónde" 25.80, lands on problem by 26.95
  const KT = [24.9, 25.35, 25.8, 26.95];
  const mx = interpolate(t, KT, [92, 175, 228, 262], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const my = interpolate(t, KT, [120, 112, 190, 280], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
  const magIn = spr(t, 24.62, {damping: 12, stiffness: 180});
  const magOut = lin(t, 27.8, 28.0);
  const found = spr(t, 26.98, {damping: 8, stiffness: 260, mass: 0.6});
  const fixed = t >= 28.34;
  const fixedP = spr(t, 28.32, {damping: 9, stiffness: 240, mass: 0.6});
  const pulse = (t * 1.8) % 1;
  // wrench spins in at "y" 27.86 -> lands 28.3
  const wr = lin(t, 27.84, 28.3, 0, 1, easeOut);
  const wx = 470 + (300 - 470) * wr;
  const wy = 90 + (262 - 90) * wr;
  const wrot = (1 - wr) * 720 - 30 + (fixed ? Math.sin((t - 28.34) * 14) * 12 * Math.max(0, 1 - (t - 28.34) * 2) : 0);
  const dotColor = fixed ? GREEN : RED;
  const statusRed = t >= 27.0 && !fixed;
  const breathe = 1 + Math.sin(t * 4) * 0.015;

  return (
    <InsertFrame start={24.22} end={28.76}>
      <div
        style={{
          ...cardStyle,
          left: 0,
          top: 0,
          width: 1010,
          height: 340,
          background: 'linear-gradient(160deg, #10263E 0%, #0A1626 100%)',
        }}
      >
        <svg width={1010} height={340} style={{position: 'absolute', left: 0, top: 0}}>
          <defs>
            <pattern id="grid" width={28} height={28} patternUnits="userSpaceOnUse">
              <path d="M28 0 L0 0 0 28" fill="none" stroke="#5FA8E8" strokeOpacity={0.14} strokeWidth={1.5} />
            </pattern>
          </defs>
          <rect width={1010} height={340} fill="url(#grid)" />
          {/* scan line */}
          <line x1={mx} x2={mx} y1={0} y2={340} stroke={LIME} strokeWidth={2} opacity={magIn * (1 - magOut) * (t < 27 ? 0.35 : 0.12)} />
          {/* washer blueprint */}
          <g fill="none" stroke={BP} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 4px ${BP}88)`}}>
            <rect x={60} y={30} width={240} height={286} rx={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            <line x1={60} y1={78} x2={300} y2={78} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            <circle cx={180} cy={182} r={80} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            <circle cx={180} cy={182} r={58} strokeWidth={2.5} strokeDasharray="8 8" opacity={draw2} />
            <circle cx={260} cy={54} r={12} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw2} />
            <rect x={82} y={46} width={60} height={18} rx={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw2} />
            {/* motor */}
            <rect x={86} y={268} width={52} height={30} rx={6} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw2} />
            {/* pump + hose */}
            <circle cx={262} cy={280} r={15} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw2} />
            <path d="M247,280 L200,280 Q180,280 180,262" strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw2} />
          </g>
          {/* dimension lines */}
          <g stroke={BP} strokeOpacity={0.55} strokeWidth={2} opacity={draw2}>
            <line x1={60} y1={330} x2={300} y2={330} />
            <line x1={60} y1={324} x2={60} y2={336} />
            <line x1={300} y1={324} x2={300} y2={336} />
            <line x1={320} y1={30} x2={320} y2={316} />
            <line x1={314} y1={30} x2={326} y2={30} />
            <line x1={314} y1={316} x2={326} y2={316} />
          </g>
          {/* problem dot */}
          {t >= 26.98 && (
            <g style={{filter: svgGlow(dotColor, 1)}}>
              <circle cx={262} cy={280} r={14 + pulse * 26} fill="none" stroke={dotColor} strokeWidth={4} opacity={(1 - pulse) * 0.9} />
              <circle cx={262} cy={280} r={(9 + 3 * Math.sin(t * 10)) * found} fill={dotColor} />
            </g>
          )}
          {/* magnifier */}
          <g transform={`translate(${mx} ${my}) scale(${(0.5 + 0.5 * magIn) * breathe})`} opacity={Math.min(1, magIn * 2) * (1 - magOut)} style={{filter: svgGlow(LIME, 0.8)}}>
            <circle r={44} fill={LIME} fillOpacity={0.07} stroke={LIME} strokeWidth={7} />
            <line x1={31} y1={31} x2={64} y2={64} stroke={LIME} strokeWidth={13} strokeLinecap="round" />
          </g>
          {/* wrench */}
          {t >= 27.84 && (
            <g transform={`translate(${wx} ${wy}) rotate(${wrot})`} opacity={Math.min(1, wr * 4)} style={{filter: svgGlow(fixed ? GREEN : '#FFFFFF', fixed ? 1 : 0.3)}}>
              <rect x={-7} y={-6} width={14} height={62} rx={7} fill={fixed ? GREEN : '#E9EEF3'} />
              <path d="M-17,-18 a19,19 0 1 0 34,0 l-7,0 l0,13 l-20,0 l0,-13 z" fill={fixed ? GREEN : '#E9EEF3'} />
            </g>
          )}
        </svg>
        {/* divider */}
        <div style={{position: 'absolute', left: 520, top: 34, bottom: 34, borderLeft: '2px solid rgba(191,230,255,0.15)'}} />
        <Step n="1" label="ENCONTRAR" on={lin(t, 27.0, 27.1)} color={LIME} y={34} />
        <Step n="2" label="REPARAR" on={lin(t, 28.34, 28.44)} color={GREEN} y={104} />
        {/* status */}
        <div style={{position: 'absolute', left: 560, top: 196, height: 110, display: 'flex', alignItems: 'center'}}>
          {!statusRed && !fixed && (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, opacity: magIn}}>
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.18em', color: '#8FB3D6'}}>ESCANEANDO</div>
              <div style={{width: 400, height: 10, borderRadius: 9, background: 'rgba(191,230,255,0.15)', overflow: 'hidden'}}>
                <div style={{width: `${lin(t, 24.9, 26.95) * 100}%`, height: '100%', background: LIME, boxShadow: glow(LIME, 0.5)}} />
              </div>
            </div>
          )}
          {statusRed && (
            <div
              style={{
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 76,
                color: RED,
                textShadow: glow(RED, 1),
                transform: `scale(${(0.4 + 0.6 * found) * (1 + Math.sin(t * 9) * 0.02)})`,
                transformOrigin: '0% 50%',
                opacity: Math.min(1, found * 2),
              }}
            >
              PROBLEMA
            </div>
          )}
          {fixed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transform: `scale(${0.4 + 0.6 * fixedP})`,
                transformOrigin: '0% 50%',
                opacity: Math.min(1, fixedP * 2),
              }}
            >
              <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 62, color: GREEN, textShadow: glow(GREEN, 1)}}>REPARADO</div>
              <div style={{filter: svgGlow(GREEN, 0.9)}}>
                <CheckIcon size={54} color={GREEN} stroke={7} progress={lin(t, 28.38, 28.55)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </InsertFrame>
  );
};
