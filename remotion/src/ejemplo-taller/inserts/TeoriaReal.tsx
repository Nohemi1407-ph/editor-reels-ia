import React from 'react';
import {cardStyle, GREEN, glow, lin, RED, SANS, SERIF, spr, svgGlow, useT, easeOut} from '../../kit/theme';
import {CheckIcon, InsertFrame} from '../ui';

export const TeoriaReal: React.FC = () => {
  const t = useT();
  // TEORÍA plate: pops at 0, strike at 0.64, shrinks left at 1.3
  const pop = spr(t, -0.1, {damping: 10, stiffness: 200});
  const strike = lin(t, 0.64, 0.84, 0, 1, easeOut);
  const shrink = lin(t, 1.3, 1.62, 0, 1);
  const tx = shrink * -292; // move from centre to the left
  const sc = (0.5 + 0.5 * pop) * (1 - 0.45 * shrink);
  const shake = t > 0.64 && t < 0.86 ? Math.sin(t * 90) * 5 * (1 - strike) : 0;

  // REAL card
  const real = spr(t, 1.46, {damping: 10, stiffness: 190});
  const stamp = spr(t, 1.8, {damping: 9, stiffness: 260, mass: 0.6});
  const tag = spr(t, 1.9, {damping: 12, stiffness: 200});
  const breathe = 1 + Math.sin(t * 4.5) * 0.012;

  return (
    <InsertFrame start={-0.2} end={2.2}>
      {/* TEORÍA */}
      <div
        style={{
          ...cardStyle,
          left: 505 - 330,
          top: 60,
          width: 660,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${tx + shake}px) scale(${sc})`,
          opacity: Math.min(1, pop * 2) * (1 - 0.45 * shrink),
          filter: `saturate(${1 - shrink * 0.6})`,
        }}
      >
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 132, color: '#fff', letterSpacing: '0.01em', lineHeight: 1}}>
          TEORÍA
        </div>
        <svg width={660} height={220} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <line
            x1={50}
            y1={140}
            x2={610}
            y2={88}
            stroke={RED}
            strokeWidth={16}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - strike}
            style={{filter: svgGlow(RED, 1.2)}}
          />
        </svg>
      </div>

      {/* REAL */}
      <div
        style={{
          ...cardStyle,
          left: 420,
          top: 4,
          width: 580,
          height: 236,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: Math.min(1, real * 2),
          transform: `scale(${(0.45 + 0.55 * real) * breathe}) rotate(${(1 - real) * 6}deg)`,
          overflow: 'visible',
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 172,
            lineHeight: 1,
            color: '#fff',
            marginTop: -6,
            marginRight: 120,
            textShadow: '0 6px 24px rgba(0,0,0,0.5)',
          }}
        >
          REAL
        </div>
        {/* check stamp */}
        <div
          style={{
            position: 'absolute',
            right: 26,
            top: 52,
            width: 128,
            height: 128,
            borderRadius: 999,
            border: `7px solid ${GREEN}`,
            boxShadow: `${glow(GREEN, 0.7)}, inset 0 0 18px ${GREEN}66`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: Math.min(1, stamp * 3),
            transform: `scale(${2.4 - 1.4 * stamp}) rotate(${-14 + (1 - stamp) * -20}deg)`,
            background: 'rgba(57,255,136,0.08)',
          }}
        >
          <div style={{filter: svgGlow(GREEN, 0.9)}}>
            <CheckIcon size={78} color={GREEN} stroke={6} progress={lin(t, 1.84, 2.0)} />
          </div>
        </div>
      </div>

      {/* tag */}
      <div
        style={{
          position: 'absolute',
          left: 420,
          width: 580,
          top: 262,
          display: 'flex',
          justifyContent: 'center',
          opacity: Math.min(1, tag * 2),
          transform: `translateY(${(1 - tag) * 24}px)`,
        }}
      >
        <div
          style={{
            padding: '12px 30px 14px',
            borderRadius: 999,
            background: '#0D0F13',
            border: `3px solid ${GREEN}`,
            boxShadow: `${glow(GREEN, 0.5)}, 0 12px 26px rgba(0,0,0,0.35)`,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 38,
            letterSpacing: '0.06em',
            color: GREEN,
            textShadow: glow(GREEN, 0.6),
            whiteSpace: 'nowrap',
          }}
        >
          100% TALLER REAL
        </div>
      </div>
    </InsertFrame>
  );
};
