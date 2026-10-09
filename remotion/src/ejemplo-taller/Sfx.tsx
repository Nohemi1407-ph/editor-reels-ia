import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {FPS} from '../kit/theme';

type S = [number, 'pop' | 'whoosh-short' | 'click' | 'click-soft' | 'sparkle' | 'impact-bass-1', number];

// [time s, file, volume]  — all <= 0.3
const CUES: S[] = [
  [0.0, 'pop', 0.22],
  [0.64, 'whoosh-short', 0.18],
  [1.48, 'pop', 0.24],
  [1.8, 'sparkle', 0.22],
  [2.24, 'whoosh-short', 0.16],
  [2.66, 'pop', 0.24],
  [3.66, 'whoosh-short', 0.14],
  [4.46, 'pop', 0.2],
  [4.98, 'pop', 0.18],
  [5.58, 'whoosh-short', 0.2],
  [7.06, 'pop', 0.22],
  [8.76, 'whoosh-short', 0.16],
  [9.52, 'pop', 0.22],
  [10.78, 'whoosh-short', 0.2],
  [12.08, 'click-soft', 0.25],
  [13.24, 'whoosh-short', 0.16],
  [14.06, 'pop', 0.22],
  [14.64, 'whoosh-short', 0.2],
  [14.84, 'click', 0.2],
  [15.5, 'whoosh-short', 0.16],
  [16.16, 'click', 0.22],
  [17.56, 'click', 0.24],
  [18.66, 'impact-bass-1', 0.26],
  [19.36, 'whoosh-short', 0.2],
  [20.54, 'pop', 0.22],
  [21.94, 'click-soft', 0.22],
  [23.84, 'pop', 0.2],
  [24.22, 'whoosh-short', 0.2],
  [27.0, 'pop', 0.22],
  [28.34, 'sparkle', 0.24],
  [28.76, 'whoosh-short', 0.16],
  [29.5, 'click', 0.24],
];

export const Sfx: React.FC = () => (
  <>
    {CUES.map(([at, file, vol], i) => (
      <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={Math.round(2.2 * FPS)} layout="none">
        <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
