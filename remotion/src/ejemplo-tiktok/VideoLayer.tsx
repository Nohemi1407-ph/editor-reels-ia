import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {easeOut, lin, spr, useT} from '../kit/theme';
import {CUTS, shake} from './kit';

// 3.788 must be a punch (a whip would slide the old burned caption out from under the cover plate)
const TYPES = ['punch', 'punch', 'whip', 'punch', 'whip'];

const PUSHES: [number, number, number][] = [
  // start, end, max scale
  [6.364, 10.273, 1.06],
  [12.0, 15.091, 1.05],
  [15.091, 20.3, 1.06],
];

export const VideoLayer: React.FC = () => {
  const t = useT();

  // slow push-ins (origin center-ish)
  let push = 1;
  for (const [a, b, m] of PUSHES) if (t >= a && t < b) push = lin(t, a, b, 1, m, (n) => n);

  // quick zoom-in on the fan at "ventilador" (0.18) -> eases back before the cut
  const fz = spr(t, 0.18, {damping: 14, stiffness: 120}) * (1 - lin(t, 1.7, 2.2, 0, 1));
  const fanZoom = 1 + 0.09 * fz;

  // cut transitions: alternate zoom-punch and whip
  let punch = 1;
  let blur = 0;
  let whipX = 0;
  let flash = 0;
  CUTS.forEach((c, i) => {
    if (t >= c - 0.001 && t < c + 0.3) {
      const p = lin(t, c, c + 0.24, 0, 1, easeOut);
      if (TYPES[i] === 'punch') {
        punch = 1.08 - 0.08 * p;
        flash = Math.max(flash, 0.22 * (1 - lin(t, c, c + 0.1)));
      } else {
        const q = lin(t, c, c + 0.133, 0, 1, easeOut); // 4 frames
        whipX = (1 - q) * 140 * (i === 2 ? -1 : 1);
        blur = (1 - q) * 14;
        punch = 1.05 - 0.05 * p;
        flash = Math.max(flash, 0.3 * (1 - lin(t, c, c + 0.1)));
      }
    }
  });

  const sh = shake(t, 0, 0.35, 10);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate(${whipX + sh.x}px, ${sh.y}px) scale(${push * punch})`,
          transformOrigin: '50% 45%',
          filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
        }}
      >
        <AbsoluteFill style={{transform: `scale(${fanZoom})`, transformOrigin: '62% 38%'}}>
          <OffthreadVideo
            src={staticFile('ejemplo-tiktok/aroll.mp4')}
            volume={1}
            style={{width: '100%', height: '100%', filter: 'contrast(1.04) saturate(1.05)'}}
          />
        </AbsoluteFill>
      </AbsoluteFill>
      {flash > 0.01 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
    </AbsoluteFill>
  );
};
