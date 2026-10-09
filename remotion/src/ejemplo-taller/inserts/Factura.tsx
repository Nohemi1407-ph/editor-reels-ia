import React from 'react';
import {cardStyle, glow, lin, RED, SANS, spr, svgGlow, useT, easeOut} from '../../kit/theme';
import {InsertFrame} from '../ui';

const PHONE =
  'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z';

export const Factura: React.FC = () => {
  const t = useT();
  // phone card
  const slide = spr(t, 15.5, {damping: 15, stiffness: 160});
  const phoneX = 325 - 325 * slide;
  const dim = lin(t, 15.5, 15.8, 1, 0.5);
  const slash = lin(t, 14.84, 15.04, 0, 1, easeOut);
  const ringP = (t * 1.4) % 1;
  const callAlive = 1 - slash;
  const dots = Math.floor(t * 4) % 4;
  const wiggle = callAlive * Math.sin(t * 40) * 6 * (Math.sin(t * 6) > 0.3 ? 1 : 0);

  // receipt
  const rIn = spr(t, 15.5, {damping: 14, stiffness: 150});
  const up1 = lin(t, 16.16, 16.5, 0, 50, easeOut);
  const up2 = lin(t, 17.56, 17.9, 0, 50, easeOut);
  const val = Math.round(up1 + up2);
  const bump1 = spr(t, 16.16, {damping: 8, stiffness: 300, mass: 0.5});
  const bump2 = spr(t, 17.56, {damping: 8, stiffness: 300, mass: 0.5});
  const priceScale = 1 + 0.18 * (t >= 17.56 ? 1 - bump2 : t >= 16.16 ? 1 - bump1 : 0);
  const priceOn = lin(t, 16.1, 16.2);
  const stamp = spr(t, 18.64, {damping: 9, stiffness: 280, mass: 0.6});
  const shake = t > 18.66 && t < 18.9 ? Math.sin(t * 120) * 7 * (1 - (t - 18.66) / 0.24) : 0;
  const breathe = 1 + Math.sin(t * 3.2) * 0.008;

  return (
    <InsertFrame start={14.64} end={19.34}>
      {/* phone card */}
      <div
        style={{
          ...cardStyle,
          left: phoneX,
          top: 0,
          width: 360,
          height: 340,
          opacity: dim,
          transform: `scale(${1 - (1 - dim) * 0.12})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <svg width={360} height={230} style={{overflow: 'visible'}}>
          {[0, 0.5].map((o) => {
            const p = (ringP + o) % 1;
            return <circle key={o} cx={180} cy={120} r={62 + p * 60} fill="none" stroke="#fff" strokeWidth={3} opacity={(1 - p) * 0.35 * callAlive} />;
          })}
          <circle cx={180} cy={120} r={66} fill={slash > 0 ? '#2A2E36' : '#2BD46A'} />
          <g transform={`translate(${180 - 46 + wiggle * 0.3} ${120 - 46}) rotate(${wiggle} 46 46) scale(3.8)`}>
            <path d={PHONE} fill="#fff" />
          </g>
          {/* no-call slash */}
          <g style={{filter: svgGlow(RED, 1.1)}}>
            <circle cx={180} cy={120} r={84} fill="none" stroke={RED} strokeWidth={11} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - slash} transform="rotate(-135 180 120)" />
            <line x1={121} y1={61} x2={239} y2={179} stroke={RED} strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lin(t, 14.94, 15.08)} />
          </g>
        </svg>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#fff', marginTop: 8, whiteSpace: 'nowrap'}}>
          Llamando técnico<span style={{opacity: callAlive}}>{'.'.repeat(dots)}</span>
          <span style={{opacity: 0}}>{'.'.repeat(3 - dots)}</span>
        </div>
      </div>

      {/* receipt */}
      {t >= 15.48 && (
        <div
          style={{
            ...cardStyle,
            left: 390,
            top: 0,
            width: 620,
            height: 340,
            opacity: Math.min(1, rIn * 2),
            transform: `translateX(${(1 - rIn) * 220 + shake}px) rotate(${(1 - rIn) * 8 + shake * 0.15}deg) scale(${breathe})`,
            overflow: 'visible',
          }}
        >
          <div style={{position: 'absolute', left: 36, top: 26, fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: '0.22em', color: '#8C95A1'}}>
            FACTURA
          </div>
          <div style={{position: 'absolute', left: 36, top: 66, fontFamily: SANS, fontWeight: 700, fontSize: 44, color: '#fff', whiteSpace: 'nowrap'}}>
            Visita + diagnóstico
          </div>
          <div style={{position: 'absolute', left: 36, right: 36, top: 136, borderTop: '4px dashed rgba(255,255,255,0.25)'}} />

          <div style={{position: 'absolute', left: 36, top: 180, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '0.12em', color: '#C9CED6'}}>
            TOTAL
          </div>
          <div
            style={{
              position: 'absolute',
              right: 40,
              top: 146,
              fontFamily: SANS,
              fontWeight: 900,
              fontSize: 112,
              lineHeight: 1,
              color: RED,
              textShadow: glow(RED, 1),
              transform: `scale(${priceScale})`,
              transformOrigin: '100% 60%',
              opacity: 0.25 + 0.75 * priceOn,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${val}
          </div>
          {/* stamp */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 254, display: 'flex', justifyContent: 'center'}}>
            <div
              style={{
                padding: '8px 22px 10px',
                border: `5px solid ${RED}`,
                borderRadius: 14,
                background: 'rgba(13,15,19,0.94)',
                fontFamily: SANS,
                fontWeight: 900,
                fontSize: 44,
                letterSpacing: '0.02em',
                color: RED,
                textShadow: glow(RED, 0.7),
                boxShadow: `${glow(RED, 0.5)}`,
                whiteSpace: 'nowrap',
                opacity: Math.min(1, stamp * 3),
                transform: `rotate(-5deg) scale(${2.6 - 1.6 * stamp})`,
              }}
            >
              SOLO POR DIAGNOSTICAR
            </div>
          </div>
        </div>
      )}
    </InsertFrame>
  );
};
