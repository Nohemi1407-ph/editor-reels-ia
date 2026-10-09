import React from 'react';
import {INK, LIME, lin, SANS, spr, svgGlow, useT, easeOut} from '../../kit/theme';

const ChainIcon: React.FC = () => (
  <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const LinkCTA: React.FC = () => {
  const t = useT();
  const start = 28.76;
  if (t < start) return null;
  const pop = spr(t, start, {damping: 10, stiffness: 200});
  const tapAt = 29.5;
  const press = t >= tapAt - 0.06 && t < tapAt + 0.12 ? Math.sin(((t - (tapAt - 0.06)) / 0.18) * Math.PI) : 0;
  const breathe = 1 + Math.sin(t * 5) * 0.015;
  // touch dot: glides in, taps at 29.50
  const dIn = lin(t, 29.1, 29.44, 0, 1, easeOut);
  const dx = 470 + (330 - 470) * dIn;
  const dy = 1460 + (1340 - 1460) * dIn;
  const dotScale = 1 - 0.3 * press;
  const ripple = lin(t, tapAt, tapAt + 0.4);
  return (
    <>
      {/* pill */}
      <div
        style={{
          position: 'absolute',
          left: 45,
          top: 1300,
          width: 380,
          height: 72,
          borderRadius: 999,
          background: LIME,
          boxShadow: `0 0 18px ${LIME}cc, 0 0 44px ${LIME}77, 0 14px 30px rgba(0,0,0,0.35)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          opacity: Math.min(1, pop * 2),
          transform: `scale(${(0.5 + 0.5 * pop) * breathe * (1 - 0.06 * press)})`,
          transformOrigin: '50% 50%',
        }}
      >
        <ChainIcon />
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: INK, letterSpacing: '-0.005em', whiteSpace: 'nowrap'}}>Toca el link</div>
      </div>
      {/* chevrons */}
      <svg width={380} height={92} style={{position: 'absolute', left: 45, top: 1378, overflow: 'visible'}}>
        {[0, 1, 2].map((i) => {
          const ph = (t * 2.2 - i * 0.22) % 1;
          const b = Math.sin(Math.max(0, ph) * Math.PI);
          const appear = spr(t, start + 0.12 + i * 0.07, {damping: 12, stiffness: 200});
          return (
            <path
              key={i}
              d={`M160,${6 + i * 27 + b * 6} L190,${24 + i * 27 + b * 6} L220,${6 + i * 27 + b * 6}`}
              fill="none"
              stroke={LIME}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={Math.min(1, appear) * (0.45 + 0.55 * b)}
              style={{filter: svgGlow(LIME, 0.8)}}
            />
          );
        })}
      </svg>
      {/* touch dot */}
      {t >= 29.1 && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
          {ripple > 0 && ripple < 1 && <circle cx={330} cy={1340} r={22 + ripple * 60} fill="none" stroke="#fff" strokeWidth={4} opacity={1 - ripple} />}
          <circle cx={dx} cy={dy} r={30 * dotScale} fill="#fff" fillOpacity={0.55 * dIn} stroke="#fff" strokeWidth={4} strokeOpacity={dIn} />
        </svg>
      )}
    </>
  );
};
