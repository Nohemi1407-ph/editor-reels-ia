import React from 'react';
import {glow, LIME, lin, easeIn, SANS, SERIF, spr, useT} from '../kit/theme';

type W = [string, number, boolean?]; // text, start, key
type Phrase = {start: number; end: number; words: W[]};

const P = (start: number, end: number, words: W[]): Phrase => ({start, end, words});

export const PHRASES: Phrase[] = [
  P(5.58, 8.28, [['ya', 5.58], ['sea', 5.78], ['una', 6.08], ['lavadora', 6.34, true]]),
  P(8.28, 10.7, [['ya', 8.28], ['sea', 8.46], ['una', 8.76], ['lavadora', 9.0, true]]),
  P(10.78, 13.24, [['una', 10.94], ['secadora', 11.24], ['NO', 11.8, true], ['CALIENTA', 12.08, true]]),
  P(13.24, 14.6, [['o', 13.24], ['la', 13.3], ['lavadora', 13.46], ['NO', 13.8, true], ['DRENA', 14.06, true]]),
  P(14.64, 15.5, [['NO', 14.64, true], ['llames', 14.84], ['a', 14.96], ['un', 15.14], ['técnico', 15.2]]),
  P(15.5, 17.3, [['que', 15.5], ['te', 15.62], ['va', 15.72], ['a', 15.84], ['quitar', 15.92], ['$50', 16.16, true]]),
  P(17.3, 18.12, [['o', 17.3], ['hasta', 17.3], ['$100', 17.56, true], ['dólares', 17.82]]),
  P(18.12, 19.34, [['solo', 18.12], ['por', 18.42], ['DIAGNOSTICAR', 18.66, true]]),
  P(19.36, 21.38, [['aquí', 19.36], ['te', 19.58], ['dejo', 19.76], ['una', 20.2], ['HERRAMIENTA', 20.54, true]]),
  P(21.38, 23.34, [['con', 21.38], ['años', 21.7], ['de', 21.86], ['EXPERIENCIA', 21.94, true]]),
  P(23.34, 24.2, [['en', 23.34], ['este', 23.64], ['TALLER', 23.84, true]]),
  P(24.22, 25.26, [['te', 24.22], ['voy', 24.38], ['a', 24.5], ['enseñar', 24.56, true]]),
  P(25.26, 26.58, [['a', 25.26], ['saber', 25.5], ['DÓNDE', 25.8, true], ['está', 26.2]]),
  P(26.58, 28.76, [['el', 26.58], ['PROBLEMA', 27.0, true], ['y', 27.86], ['repararlo', 28.34]]),
  P(28.76, 29.9, [['aquí', 28.76], ['te', 28.98], ['dejo', 29.12], ['el', 29.38], ['LINK', 29.5, true]]),
];

const CaptionPill: React.FC<{p: Phrase}> = ({p}) => {
  const t = useT();
  const enter = spr(t, p.start, {damping: 14, stiffness: 220});
  const exit = lin(t, p.end - 0.08, p.end, 0, 1, easeIn);
  const len = p.words.map((w) => w[0]).join(' ').length;
  const size = Math.max(64, Math.min(76, Math.floor(1900 / len)));
  return (
    <div
      style={{
        position: 'absolute',
        top: 585,
        left: 35,
        width: 1010,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: size * 0.26,
          alignItems: 'baseline',
          padding: `${size * 0.14}px ${size * 0.42}px ${size * 0.18}px`,
          borderRadius: 999,
          background: 'rgba(10,11,15,0.66)',
          border: '1.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          transform: `translateY(${(1 - enter) * 18 - exit * 10}px) scale(${0.86 + 0.14 * enter})`,
          opacity: Math.min(1, enter * 1.8) * (1 - exit),
          whiteSpace: 'nowrap',
        }}
      >
        {p.words.map(([w, at, key], i) => {
          const on = t >= at - 0.02;
          const pop = spr(t, at - 0.02, {damping: 10, stiffness: 260, mass: 0.5});
          const isKey = !!key;
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontWeight: isKey ? 900 : 700,
                fontSize: size,
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                color: on && isKey ? LIME : '#FFFFFF',
                textShadow: on && isKey ? glow(LIME, 0.7) : '0 3px 10px rgba(0,0,0,0.75)',
                opacity: on ? 1 : 0.38,
                display: 'inline-block',
                transform: `scale(${on ? 1 + 0.1 * Math.max(0, 1 - pop) : 1}) translateY(${
                  on ? (1 - Math.min(1, pop)) * 8 : 0
                }px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const CaptionPills: React.FC = () => {
  const t = useT();
  const p = PHRASES.find((ph) => t >= ph.start && t < ph.end);
  return p ? <CaptionPill key={p.start} p={p} /> : null;
};

/* ---------------- big shop-tour captions 2.20 - 5.58 ---------------- */
const plate: React.CSSProperties = {
  background: 'rgba(12,13,17,0.86)',
  borderRadius: 28,
  boxShadow: '0 18px 44px rgba(0,0,0,0.35)',
  border: '1.5px solid rgba(255,255,255,0.08)',
  display: 'inline-block',
};

const BigLine: React.FC<{at: number; children: React.ReactNode; style: React.CSSProperties; plateStyle?: React.CSSProperties}> = ({
  at,
  children,
  style,
  plateStyle,
}) => {
  const t = useT();
  const p = spr(t, at - 0.02, {damping: 10, stiffness: 200, mass: 0.6});
  return (
    <div
      style={{
        ...plate,
        ...plateStyle,
        opacity: Math.min(1, p * 2),
        transform: `scale(${0.5 + 0.5 * p}) rotate(${(1 - p) * -4}deg)`,
      }}
    >
      <div style={style}>{children}</div>
    </div>
  );
};

const Block: React.FC<{start: number; end: number; children: React.ReactNode}> = ({start, end, children}) => {
  const t = useT();
  if (t < start - 0.05 || t >= end) return null;
  const exit = lin(t, end - 0.12, end, 0, 1, easeIn);
  const float = Math.sin(t * 2.2) * 3;
  return (
    <div
      style={{
        position: 'absolute',
        left: 35,
        top: 225,
        width: 1010,
        height: 340,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        opacity: 1 - exit,
        transform: `translateY(${float - exit * 30}px) scale(${1 - exit * 0.06})`,
      }}
    >
      {children}
    </div>
  );
};

const white: React.CSSProperties = {
  fontFamily: SANS,
  fontWeight: 800,
  color: '#fff',
  letterSpacing: '-0.015em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
};

export const ShopTourCaptions: React.FC = () => {
  const t = useT();
  const breathe = 1 + Math.sin(t * 5) * 0.012;
  return (
    <>
      <Block start={2.22} end={3.66}>
        <BigLine at={2.24} style={{...white, fontSize: 96, padding: '14px 34px 18px'}}>
          un taller
        </BigLine>
        <BigLine at={2.66} style={{...white, fontWeight: 900, fontSize: 200, color: LIME, textShadow: glow(LIME, 1.1), padding: '6px 44px 16px', transform: `scale(${breathe})`}}>
          REAL
        </BigLine>
      </Block>
      <Block start={3.64} end={4.98}>
        <BigLine at={3.66} style={{...white, fontSize: 92, padding: '14px 34px 18px'}}>
          reparaciones de
        </BigLine>
        <BigLine at={4.46} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: LIME, textShadow: glow(LIME, 1), lineHeight: 1, padding: '4px 46px 26px', whiteSpace: 'nowrap', transform: `scale(${breathe})`}}>
          lavadoras
        </BigLine>
      </Block>
      <Block start={4.96} end={5.6}>
        <BigLine at={4.98} style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 170, color: LIME, textShadow: glow(LIME, 1), lineHeight: 1, padding: '10px 50px 30px', whiteSpace: 'nowrap', transform: `scale(${breathe})`}}>
          <span style={{color: '#fff', textShadow: 'none'}}>y </span>secadoras
        </BigLine>
      </Block>
    </>
  );
};
