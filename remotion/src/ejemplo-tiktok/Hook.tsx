import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeIn, glow, lin, SANS, spr, useT} from '../kit/theme';
import {Emoji, LIME, ORANGE, RED, shake, StrokeText, TT_RED} from './kit';

/** 0 - 2.24 s : big hook title that slams in at frame 0 */
export const HookTitle: React.FC = () => {
  const t = useT();
  if (Math.round(t * 30) >= 67) return null;
  const s = spr(t, 0, {damping: 10, stiffness: 210, mass: 0.7});
  const sc = 1.12 - 0.12 * s;
  const sh = shake(t, 0.05, 0.4, 14);
  const l2 = spr(t, 0.12, {damping: 9, stiffness: 230, mass: 0.6});
  const verano = t >= 1.9;
  const vp = spr(t, 1.9, {damping: 8, stiffness: 300, mass: 0.5});
  const sticker = spr(t, 0.3, {damping: 9, stiffness: 240, mass: 0.5});
  const wob = Math.sin(t * 9) * 3;
  return (
    <div style={{position: 'absolute', left: 40, top: 160, width: 1000}}>
      {/* sticker */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `scale(${sticker}) rotate(${-6 + wob * 0.4}deg)`,
          transformOrigin: '0% 50%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 20px 9px 14px',
          borderRadius: 14,
          background: `linear-gradient(90deg, ${TT_RED}, ${ORANGE})`,
          boxShadow: `0 6px 18px rgba(0,0,0,0.4), 0 0 22px ${ORANGE}88`,
          border: '3px solid #fff',
        }}
      >
        <Emoji e="🔥" size={38} />
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: '0.03em'}}>
          PRODUCTO VIRAL
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 78,
          width: 1000,
          textAlign: 'left',
          transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${sc})`,
          transformOrigin: '30% 50%',
          wordSpacing: '0.12em',
        }}
      >
        <StrokeText size={112}>NECESITAS ESTO</StrokeText>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            transform: `scale(${0.6 + 0.4 * l2})`,
            transformOrigin: '0% 50%',
            opacity: Math.min(1, l2 * 2),
          }}
        >
          <StrokeText size={112} color={LIME} neon>
            ESTE VERANO
          </StrokeText>
          <Emoji
            e="🥵"
            size={108}
            style={{transform: `scale(${verano ? 1 + 0.35 * Math.max(0, 1 - vp) : 1}) rotate(${wob * 2}deg)`}}
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Opaque plate that hides the OLD burned caption: frames 67..190      */
/* (old text box: x 40-1000, y 289-490)                                */
/* ------------------------------------------------------------------ */
const PLATE = {left: 22, top: 246, width: 1036, height: 286};

const Thermo: React.FC<{level: number}> = ({level}) => (
  <svg width={110} height={250} viewBox="0 0 110 250">
    <rect x={38} y={14} width={34} height={170} rx={17} fill="#2a1410" stroke="#fff" strokeWidth={6} />
    <rect x={47} y={22 + 150 * (1 - level)} width={16} height={150 * level + 10} rx={8} fill={RED}
      style={{filter: `drop-shadow(0 0 8px ${RED})`}} />
    <circle cx={55} cy={204} r={34} fill={RED} stroke="#fff" strokeWidth={6}
      style={{filter: `drop-shadow(0 0 14px ${RED})`}} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={78} y={40 + i * 30} width={16} height={5} rx={2} fill="#fff" opacity={0.7} />
    ))}
  </svg>
);

const FanIcon: React.FC<{rot: number}> = ({rot}) => (
  <svg width={200} height={200} viewBox="-100 -100 200 200">
    <rect x={-92} y={-92} width={184} height={184} rx={44} fill="#111" stroke={ORANGE} strokeWidth={8}
      style={{filter: `drop-shadow(0 0 10px ${ORANGE})`}} />
    <rect x={-74} y={-74} width={148} height={148} rx={34} fill="none" stroke="#fff" strokeWidth={7}
      style={{filter: 'drop-shadow(0 0 10px #fff)'}} />
    <g transform={`rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M0 0 C 18 -14, 50 -26, 56 -6 C 44 4, 18 6, 0 0 Z" fill="#e8e8e8" transform={`rotate(${a})`} />
      ))}
      <circle r={12} fill={ORANGE} />
    </g>
  </svg>
);

export const CoverPlate: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  if (f < 67 || f > 197) return null;
  // entry: slams from LARGER to 1 (always covers the old text)
  const inS = spr(t, 67 / 30, {damping: 12, stiffness: 260, mass: 0.6});
  let scale = 1.12 - 0.12 * Math.min(1, inS) + (inS > 1 ? (inS - 1) * 0.15 : 0);
  // second beat at the 3.788 cut: tiny punch (still >= 1)
  const b2 = spr(t, 3.788, {damping: 12, stiffness: 280, mass: 0.5});
  if (t >= 3.788) scale *= 1 + 0.06 * (1 - Math.min(1, b2));
  // exit only AFTER the old caption is gone (frame 191+)
  const out = f >= 191 ? lin(f, 191, 197, 0, 1, easeIn) : 0;
  const sh = shake(t, 67 / 30, 0.3, 8);
  const phaseA = t < 3.788;

  const level = lin(t, 2.3, 3.4, 0.15, 0.95);
  const temp = Math.round(lin(t, 2.3, 3.4, 31, 43));
  const pFuerte = spr(t, 3.22, {damping: 8, stiffness: 300, mass: 0.5});
  const pPort = spr(t, 5.95, {damping: 8, stiffness: 300, mass: 0.5});
  const pVent = spr(t, 5.39, {damping: 9, stiffness: 260, mass: 0.5});
  const haze = (i: number) => Math.sin(t * 6 + i * 1.7) * 10;

  return (
    <div
      style={{
        position: 'absolute',
        ...PLATE,
        borderRadius: 34,
        overflow: 'hidden',
        transform: `translate(${sh.x}px, ${sh.y - out * 40}px) scale(${scale * (1 - out * 0.15)})`,
        opacity: 1 - out,
        transformOrigin: '50% 50%',
        background: phaseA
          ? 'linear-gradient(135deg, #4A0E06 0%, #1E0603 60%, #120302 100%)'
          : 'linear-gradient(135deg, #1A1C22 0%, #0C0D11 100%)',
        border: `4px solid ${phaseA ? RED : ORANGE}`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 34px ${phaseA ? RED : ORANGE}77`,
      }}
    >
      {phaseA ? (
        <>
          {/* heat haze lines */}
          <svg width={PLATE.width} height={PLATE.height} style={{position: 'absolute', inset: 0, opacity: 0.25}}>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M ${560 + i * 120} 280 C ${540 + i * 120 + haze(i)} 200, ${600 + i * 120 - haze(i)} 120, ${570 + i * 120} 20`}
                stroke={ORANGE}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div style={{position: 'absolute', left: 26, top: 14}}>
            <Thermo level={level} />
          </div>
          <div style={{position: 'absolute', left: 150, top: 40}}>
            <StrokeText size={84}>EL CALOR ESTÁ</StrokeText>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 150,
              top: 140,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              transform: `scale(${t >= 3.22 ? 0.5 + 0.5 * pFuerte : 0})`,
              transformOrigin: '0% 50%',
            }}
          >
            <StrokeText size={110} color={ORANGE} neon>
              FUERTE
            </StrokeText>
            <Emoji e="🥵" size={96} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: 26,
              top: 26,
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
              fontSize: 64,
              color: '#fff',
              textShadow: glow(RED, 0.8),
            }}
          >
            {temp}°C
          </div>
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: 30, top: 43}}>
            <FanIcon rot={t * 900} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 262,
              top: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 18px',
              borderRadius: 12,
              background: LIME,
              boxShadow: glow(LIME, 0.5),
            }}
          >
            <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 32, color: '#0E1014', letterSpacing: '0.04em'}}>
              ✓ TE LO RECOMIENDO
            </span>
          </div>
          <div style={{position: 'absolute', left: 262, top: 92, transform: `scale(${t >= 5.39 ? 0.7 + 0.3 * Math.min(1.1, pVent) : 1})`, transformOrigin: '0% 50%'}}>
            <StrokeText size={82}>MI VENTILADOR</StrokeText>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 262,
              top: 176,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: t >= 5.95 ? 1 : 0.0,
              transform: `scale(${t >= 5.95 ? 0.5 + 0.5 * pPort : 0.5})`,
              transformOrigin: '0% 50%',
            }}
          >
            <StrokeText size={92} color={LIME} neon>
              PORTÁTIL
            </StrokeText>
            <Emoji e="💨" size={80} />
          </div>
        </>
      )}
    </div>
  );
};
