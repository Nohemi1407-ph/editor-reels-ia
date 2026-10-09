import React from 'react';
import {easeIn, easeOut, glow, lin, SANS, spr, useT} from '../kit/theme';
import {Emoji, LIME, ORANGE, TT_RED} from './kit';

const BTN = {left: 40, top: 1334, width: 740, height: 92};
const TAP = 19.71;

export const CartCTA: React.FC = () => {
  const t = useT();
  const at = 15.18;
  if (t < at - 0.05) return null;
  const p = spr(t, at - 0.05, {damping: 11, stiffness: 220, mass: 0.6});
  const exit = 0;
  const breathe = 1 + Math.sin((t - at) * 6) * 0.015;
  // press at TAP
  const press = t >= TAP - 0.06 && t < TAP + 0.2 ? Math.sin(lin(t, TAP - 0.06, TAP + 0.2) * Math.PI) : 0;
  const scale = (0.6 + 0.4 * p) * breathe * (1 - press * 0.07);
  const shine = ((t - at) * 0.7) % 1.6;

  // finger: travels in from bottom-right 19.2 -> 19.65, presses, leaves
  const fIn = lin(t, 19.25, TAP - 0.04, 0, 1, easeOut);
  const fOut = lin(t, TAP + 0.3, TAP + 0.5, 0, 1, easeIn);
  const tapX = 520;
  const tapY = 1358;
  const fx = tapX + (1 - fIn) * 260 + fOut * 200;
  const fy = tapY + (1 - fIn) * 120 + fOut * 80 - (press > 0 ? -10 * press : 0);
  const ripple = lin(t, TAP, TAP + 0.5, 0, 1, easeOut);

  // link sticker
  const lp = spr(t, 16.1, {damping: 9, stiffness: 260, mass: 0.5});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - exit}}>
      {/* button */}
      <div
        style={{
          position: 'absolute',
          ...BTN,
          borderRadius: 26,
          background: `linear-gradient(90deg, ${TT_RED} 0%, ${ORANGE} 100%)`,
          border: '4px solid #fff',
          boxShadow: `0 14px 30px rgba(0,0,0,0.45), 0 0 30px ${ORANGE}99`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          transform: `translateY(${(1 - Math.min(1, p)) * 60}px) scale(${scale})`,
          transformOrigin: '30% 50%',
          opacity: Math.min(1, p * 2),
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: `${-30 + shine * 100}%`,
            width: 90,
            height: 140,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
            transform: 'rotate(20deg)',
          }}
        />
        <Emoji e="🛒" size={58} />
        <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: '#fff', lineHeight: 1, textShadow: '0 2px 6px rgba(0,0,0,0.35)'}}>
          Toca el carrito naranja
        </span>
      </div>

      {/* bouncing down arrows */}
      <div style={{position: 'absolute', left: 802, top: 1300, width: 120, opacity: Math.min(1, p * 2)}}>
        {[0, 1, 2].map((i) => {
          const b = Math.sin((t - at) * 8 - i * 0.9);
          return (
            <svg key={i} width={110} height={46} viewBox="0 0 90 40"
              style={{display: 'block', marginTop: -6, transform: `translateY(${b * 6}px)`, opacity: 0.45 + 0.55 * Math.max(0, b)}}>
              <path d="M12 8 L45 32 L78 8" fill="none" stroke={LIME} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round"
                style={{filter: `drop-shadow(0 0 6px ${LIME})`}} />
            </svg>
          );
        })}
      </div>

      {/* link sticker */}
      {t >= 16.08 && (
        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 1282,
            transform: `scale(${lp}) rotate(${8 + Math.sin(t * 7) * 3}deg)`,
            padding: '6px 16px 8px',
            borderRadius: 14,
            background: '#fff',
            boxShadow: `0 6px 16px rgba(0,0,0,0.4), 0 0 18px ${LIME}88`,
            border: `3px solid ${LIME}`,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#0E1014', lineHeight: 1}}>LINK</span>
          <Emoji e="👇" size={36} />
        </div>
      )}

      {/* tap ripple */}
      {t >= TAP && ripple < 1 && (
        <div
          style={{
            position: 'absolute',
            left: tapX - 20 - 90 * ripple,
            top: tapY - 20 - 90 * ripple,
            width: 40 + 180 * ripple,
            height: 40 + 180 * ripple,
            borderRadius: '50%',
            border: `6px solid #fff`,
            opacity: 1 - ripple,
            boxShadow: glow('#ffffff', 0.5),
          }}
        />
      )}
      {/* finger */}
      {t >= 19.25 && fOut < 1 && (
        <div style={{position: 'absolute', left: fx - 30, top: fy - 14, transform: `scale(${1 - press * 0.12}) rotate(-12deg)`, opacity: 1 - fOut}}>
          <Emoji e="👆" size={96} />
        </div>
      )}
    </div>
  );
};
