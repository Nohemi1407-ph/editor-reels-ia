import React from 'react';
import {cardStyle, lerpColor, lin, RED, spr, svgGlow, useT, easeOut} from '../../kit/theme';
import {FrontLoad} from '../appliances';
import {InsertFrame, NeonLabel} from '../ui';

const ICE = '#7FE3FF';
const CW = 490;
const CH = 340;

const Snowflake: React.FC<{x: number; y: number; s: number; rot: number; o: number}> = ({x, y, s, rot, o}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o} style={{filter: svgGlow(ICE, 0.6)}}>
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <line x1={-12} y1={0} x2={12} y2={0} stroke={ICE} strokeWidth={2.6} strokeLinecap="round" />
        <line x1={7} y1={0} x2={10} y2={-4} stroke={ICE} strokeWidth={2} strokeLinecap="round" />
        <line x1={7} y1={0} x2={10} y2={4} stroke={ICE} strokeWidth={2} strokeLinecap="round" />
        <line x1={-7} y1={0} x2={-10} y2={-4} stroke={ICE} strokeWidth={2} strokeLinecap="round" />
        <line x1={-7} y1={0} x2={-10} y2={4} stroke={ICE} strokeWidth={2} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

export const Fallas: React.FC = () => {
  const t = useT();
  const slide = spr(t, 13.24, {damping: 15, stiffness: 160});
  const leftX = 260 - 260 * slide;
  const dim = lin(t, 13.24, 13.5, 1, 0.45);
  const right = spr(t, 13.24, {damping: 12, stiffness: 180});

  // thermometer: drop at "calienta" 12.08
  const drop = lin(t, 12.08, 12.75, 0, 1, easeOut);
  const level = 0.86 - 0.74 * drop;
  const merc = lerpColor(RED, ICE, drop);
  const heat = 1 - lin(t, 12.0, 12.25);
  const frost = lin(t, 12.2, 12.6);

  // drain: X at "drena" 14.06
  const xPop = spr(t, 14.04, {damping: 9, stiffness: 260, mass: 0.6});
  const flow = t < 14.06 ? (t * 60) % 40 : (14.06 * 60) % 40;
  const leftBreath = 1 + Math.sin(t * 3) * 0.01;

  return (
    <InsertFrame start={10.78} end={14.6}>
      {/* LEFT: dryer + thermometer */}
      <div
        style={{
          ...cardStyle,
          left: leftX,
          top: 0,
          width: CW,
          height: CH,
          opacity: dim,
          transform: `scale(${(1 - (1 - dim) * 0.1) * leftBreath})`,
          filter: `saturate(${0.4 + 0.6 * dim})`,
        }}
      >
        <div style={{position: 'absolute', left: 6, top: 12, width: 300, height: 255}}>
          <FrontLoad t={t} spin={0.5} ringGlow={frost * 0.9} ringColor={ICE} water={0} dryer />
        </div>
        <svg width={CW} height={280} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {/* heat waves */}
          {[110, 155, 200].map((x, i) => {
            const ph = (t * 1.6 + i * 0.33) % 1;
            return (
              <path
                key={x}
                d={`M${x},${40 - ph * 26} q8,-8 0,-16 q-8,-8 0,-16`}
                stroke={RED}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                opacity={heat * (1 - ph) * 0.9}
                style={{filter: svgGlow(RED, 0.6)}}
              />
            );
          })}
          {/* frost on door */}
          <circle cx={156} cy={170} r={46} fill={ICE} opacity={frost * 0.28} />
          <Snowflake x={128} y={150} s={0.9 * frost} rot={t * 30} o={frost} />
          <Snowflake x={182} y={190} s={0.7 * frost} rot={-t * 40} o={frost} />
          <Snowflake x={380} y={60} s={1.2 * frost} rot={t * 25} o={frost} />
          <Snowflake x={440} y={150} s={0.9 * frost} rot={-t * 30} o={frost} />
          <Snowflake x={92} y={44} s={1 * frost} rot={t * 35} o={frost} />
          {/* thermometer */}
          <g transform="translate(330 22)">
            <rect x={14} y={0} width={44} height={196} rx={22} fill="#1A1E25" stroke="#E4E8EC" strokeWidth={4} />
            <circle cx={36} cy={208} r={30} fill="#1A1E25" stroke="#E4E8EC" strokeWidth={4} />
            <rect x={28} y={14} width={16} height={190} rx={8} fill="#0B0D10" />
            <rect x={28} y={14 + (1 - level) * 176} width={16} height={190 - (1 - level) * 176} rx={8} fill={merc} style={{filter: svgGlow(merc, 0.8)}} />
            <circle cx={36} cy={208} r={20} fill={merc} style={{filter: svgGlow(merc, 0.9)}} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={60} x2={72} y1={24 + i * 38} y2={24 + i * 38} stroke="#E4E8EC" strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 272, display: 'flex', justifyContent: 'center'}}>
          <NeonLabel at={12.08} color={RED} size={48} dim={1}>
            NO CALIENTA
          </NeonLabel>
        </div>
      </div>

      {/* RIGHT: washer + blocked drain */}
      {t >= 13.22 && (
        <div
          style={{
            ...cardStyle,
            left: 520,
            top: 0,
            width: CW,
            height: CH,
            opacity: Math.min(1, right * 2),
            transform: `translateX(${(1 - right) * 80}px) scale(${0.7 + 0.3 * right})`,
          }}
        >
          <div style={{position: 'absolute', left: 4, top: 12, width: 300, height: 255}}>
            <FrontLoad t={t} spin={0} ringGlow={0} water={0.78} waterWobble={0.5} clothes />
          </div>
          <svg width={CW} height={280} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {/* drain pipe */}
            <path d="M232,236 L300,236 Q330,236 330,206 L330,150 Q330,126 354,126 L452,126" fill="none" stroke="#C9D0D7" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M232,236 L300,236 Q330,236 330,206 L330,150 Q330,126 354,126 L452,126" fill="none" stroke="#0B0D10" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.0} />
            <path
              d="M232,236 L300,236 Q330,236 330,206 L330,150 Q330,126 354,126 L452,126"
              fill="none"
              stroke="#4FB4FF"
              strokeWidth={9}
              strokeLinecap="round"
              strokeDasharray="14 26"
              strokeDashoffset={-flow}
              opacity={0.9}
            />
            {/* red X */}
            <g transform={`translate(392 126) scale(${2.2 - 1.2 * xPop}) rotate(${(1 - xPop) * 30})`} opacity={Math.min(1, xPop * 3)} style={{filter: svgGlow(RED, 1.1)}}>
              <circle r={36} fill="#0D0F13" stroke={RED} strokeWidth={6} />
              <line x1={-17} y1={-17} x2={17} y2={17} stroke={RED} strokeWidth={9} strokeLinecap="round" />
              <line x1={17} y1={-17} x2={-17} y2={17} stroke={RED} strokeWidth={9} strokeLinecap="round" />
            </g>
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 272, display: 'flex', justifyContent: 'center'}}>
            <NeonLabel at={14.06} color={RED} size={48}>
              NO DRENA
            </NeonLabel>
          </div>
        </div>
      )}
    </InsertFrame>
  );
};
