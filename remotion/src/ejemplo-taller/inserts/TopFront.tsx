import React from 'react';
import {cardStyle, LIME, lin, spr, useT} from '../../kit/theme';
import {TopLoadWasher, FrontLoad} from '../appliances';
import {InsertFrame, NeonLabel} from '../ui';

const CW = 490;
const CH = 340;

export const TopFront: React.FC = () => {
  const t = useT();
  const slide = spr(t, 8.76, {damping: 15, stiffness: 160});
  const leftX = 260 - 260 * slide;
  const dim = lin(t, 8.76, 9.05, 1, 0.45);
  const right = spr(t, 8.76, {damping: 12, stiffness: 180});
  const lidOpen = spr(t, 7.04, {damping: 9, stiffness: 120, mass: 0.8});
  const glowOn = lin(t, 7.06, 7.2);
  const ring = lin(t, 9.52, 9.62) * (0.85 + Math.sin(t * 9) * 0.15);
  const spin = t < 9.52 ? 0.35 : 1.1;
  // integrate spin so speed change doesn't jump
  const spinT = t < 9.52 ? t : 9.52 * (0.35 / 1.1) + (t - 9.52);
  const leftBreath = 1 + Math.sin(t * 3) * 0.01;
  return (
    <InsertFrame start={5.58} end={10.7}>
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
        <div style={{position: 'absolute', left: 40, top: 14, width: 410, height: 250}}>
          <TopLoadWasher open={lidOpen} glowAmt={glowOn * dim} t={t} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 272, display: 'flex', justifyContent: 'center'}}>
          <NeonLabel at={7.06} color={LIME} size={50}>
            TOP LOAD
          </NeonLabel>
        </div>
      </div>
      {t >= 8.74 && (
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
          <div style={{position: 'absolute', left: 50, top: 12, width: 390, height: 255}}>
            <FrontLoad t={spinT} spin={spin} ringGlow={ring} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 272, display: 'flex', justifyContent: 'center'}}>
            <NeonLabel at={9.52} color={LIME} size={50}>
              FRONT LOAD
            </NeonLabel>
          </div>
        </div>
      )}
    </InsertFrame>
  );
};
