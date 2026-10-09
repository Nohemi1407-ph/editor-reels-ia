import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {easeOut, lin, useT} from '../kit/theme';

export const CUTS = [2.198, 5.431, 10.698, 24.198, 25.165, 25.798, 28.765];

export const VideoLayer: React.FC = () => {
  const t = useT();
  let scale = 1;
  for (const c of CUTS) {
    if (t >= c && t < c + 0.28) {
      scale = 1 + 0.04 * (1 - lin(t, c, c + 0.28, 0, 1, easeOut));
    }
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 55%'}}>
        <OffthreadVideo
          src={staticFile('ejemplo-taller/aroll.mp4')}
          style={{width: '100%', height: '100%', filter: 'contrast(1.07) saturate(0.92)'}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
