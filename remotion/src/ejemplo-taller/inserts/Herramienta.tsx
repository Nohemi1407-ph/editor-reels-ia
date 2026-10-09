import React from 'react';
import {cardStyle, GREEN, glow, LIME, lin, SANS, SERIF, spr, svgGlow, useT, easeOut} from '../../kit/theme';
import {CheckIcon, InsertFrame} from '../ui';

const WrenchGear: React.FC<{t: number}> = ({t}) => (
  <svg width={110} height={110} viewBox="0 0 110 110" style={{overflow: 'visible', filter: svgGlow(LIME, 0.7)}}>
    <g transform={`rotate(${t * 40} 66 44)`}>
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x={61} y={14} width={10} height={14} rx={2} fill={LIME} transform={`rotate(${i * 45} 66 44)`} />
      ))}
      <circle cx={66} cy={44} r={22} fill={LIME} />
      <circle cx={66} cy={44} r={9} fill="#14171C" />
    </g>
    <g transform="rotate(-45 40 72)">
      <rect x={34} y={60} width={13} height={50} rx={6} fill="#fff" />
      <path d="M26,48 a16,16 0 1 0 28,0 l-6,0 l0,12 l-16,0 l0,-12 z" fill="#fff" />
    </g>
  </svg>
);

export const Herramienta: React.FC = () => {
  const t = useT();
  const move = spr(t, 20.54, {damping: 15, stiffness: 150});
  const boxX = 365 - 355 * move;
  const lid = spr(t, 20.5, {damping: 8, stiffness: 140, mass: 0.7});
  const inner = lin(t, 20.54, 20.7);
  const guide = spr(t, 20.62, {damping: 13, stiffness: 140});
  const badge = spr(t, 21.92, {damping: 11, stiffness: 200});
  const ring = lin(t, 21.94, 22.5, 0, 1, easeOut);
  const tag = spr(t, 23.82, {damping: 10, stiffness: 220});
  const idle = Math.sin(t * 2.6) * 4;
  const edgePulse = 0.75 + Math.sin(t * 6) * 0.25;

  // guide card path: from box mouth to final slot
  const gx0 = boxX + 140 - (710 * 0.15) / 2;
  const gy0 = 215;
  const gx = gx0 + (300 - gx0) * guide;
  const gy = gy0 + (0 - gy0) * guide;
  const gs = 0.15 + 0.85 * guide;

  return (
    <InsertFrame start={19.36} end={24.2}>
      {/* toolbox */}
      <div style={{position: 'absolute', left: boxX, top: 110, width: 280, height: 230}}>
        <svg width={280} height={230} viewBox="0 0 280 230" style={{overflow: 'visible'}}>
          <defs>
            <linearGradient id="tbBeam" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor={LIME} stopOpacity={0.7} />
              <stop offset="1" stopColor={LIME} stopOpacity={0} />
            </linearGradient>
          </defs>
          <ellipse cx={140} cy={224} rx={128} ry={8} fill="#000" opacity={0.35} />
          {/* beam */}
          <path d="M40,110 L240,110 L270,-90 L10,-90 Z" fill="url(#tbBeam)" opacity={inner * 0.5 * (1 - guide * 0.5)} />
          {/* body */}
          <rect x={20} y={110} width={240} height={108} rx={14} fill="#1B1F26" stroke={LIME} strokeWidth={4} style={{filter: svgGlow(LIME, 0.5 * edgePulse)}} />
          <rect x={20} y={140} width={240} height={10} fill="#2A303A" />
          <rect x={118} y={132} width={44} height={26} rx={6} fill="#2A303A" stroke={LIME} strokeWidth={3} />
          {/* inside glow */}
          <rect x={30} y={104} width={220} height={12} rx={6} fill={LIME} opacity={inner} style={{filter: svgGlow(LIME, 1)}} />
          {/* lid (hinged back-left) */}
          <g transform={`translate(0 110) scale(1 ${1 - 1.85 * lid}) translate(0 -110)`}>
            <rect x={14} y={78} width={252} height={34} rx={10} fill="#232831" stroke={LIME} strokeWidth={4} style={{filter: svgGlow(LIME, 0.5 * edgePulse)}} />
            <path d="M100,78 L100,56 Q100,48 108,48 L172,48 Q180,48 180,56 L180,78" fill="none" stroke={LIME} strokeWidth={8} strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* guide card */}
      {t >= 20.6 && (
        <div
          style={{
            ...cardStyle,
            left: 0,
            top: 0,
            width: 710,
            height: 190,
            transform: `translate(${gx}px, ${gy + idle * guide}px) scale(${gs})`,
            transformOrigin: '0% 0%',
            opacity: Math.min(1, guide * 2.5),
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '0 30px',
            boxSizing: 'border-box',
            border: `2px solid ${LIME}55`,
          }}
        >
          <WrenchGear t={t} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: '#fff', letterSpacing: '0.01em', whiteSpace: 'nowrap'}}>
              GUÍA DE DIAGNÓSTICO
            </div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 50, color: LIME, textShadow: glow(LIME, 0.6), whiteSpace: 'nowrap', lineHeight: 1.1}}>
              Lavadoras y secadoras
            </div>
          </div>
        </div>
      )}

      {/* experience badge */}
      {t >= 21.9 && (
        <div
          style={{
            ...cardStyle,
            left: 300,
            top: 210,
            width: 380,
            height: 128,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 22px',
            boxSizing: 'border-box',
            opacity: Math.min(1, badge * 2),
            transform: `translateY(${(1 - badge) * 40}px) scale(${0.6 + 0.4 * badge})`,
          }}
        >
          <svg width={96} height={96} viewBox="0 0 96 96" style={{overflow: 'visible', flexShrink: 0}}>
            <circle cx={48} cy={48} r={40} fill="none" stroke="#2A303A" strokeWidth={8} />
            <circle
              cx={48}
              cy={48}
              r={40}
              fill="none"
              stroke={LIME}
              strokeWidth={8}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - ring}
              transform="rotate(-90 48 48)"
              style={{filter: svgGlow(LIME, 0.9)}}
            />
            {/* star */}
            <path
              d="M48,26 L54,41 L70,42 L57.5,52 L62,68 L48,59 L34,68 L38.5,52 L26,42 L42,41 Z"
              fill="#fff"
              transform={`rotate(${(1 - ring) * -60} 48 48) scale(1)`}
              style={{transformOrigin: '48px 48px'}}
              opacity={0.3 + 0.7 * ring}
            />
          </svg>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 32, lineHeight: 1.05, color: '#fff', letterSpacing: '0.02em'}}>
            AÑOS DE
            <br />
            <span style={{color: LIME, textShadow: glow(LIME, 0.6)}}>EXPERIENCIA</span>
          </div>
        </div>
      )}

      {/* taller real tag */}
      {t >= 23.8 && (
        <div
          style={{
            ...cardStyle,
            left: 696,
            top: 226,
            width: 314,
            height: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            border: `3px solid ${GREEN}`,
            boxShadow: `${glow(GREEN, 0.45)}, 0 18px 40px rgba(0,0,0,0.35)`,
            opacity: Math.min(1, tag * 2),
            transform: `scale(${0.4 + 0.6 * tag}) rotate(${(1 - tag) * -10}deg)`,
          }}
        >
          <div style={{filter: svgGlow(GREEN, 0.8)}}>
            <CheckIcon size={46} color={GREEN} stroke={7} progress={lin(t, 23.86, 24.02)} />
          </div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 34, color: GREEN, textShadow: glow(GREEN, 0.6), whiteSpace: 'nowrap'}}>
            TALLER REAL
          </div>
        </div>
      )}
    </InsertFrame>
  );
};
