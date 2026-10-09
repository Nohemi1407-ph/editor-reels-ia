import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {FPS} from '../kit/theme';

type S = [number, 'pop' | 'whoosh-short' | 'click' | 'click-soft' | 'sparkle' | 'impact-bass-1', number];

// [time s, file, volume] — all <= 0.25 (subtle)
const CUES: S[] = [
  [0.0, 'impact-bass-1', 0.22],
  [0.18, 'pop', 0.14],
  [0.3, 'click-soft', 0.14],
  [2.2, 'whoosh-short', 0.14],
  [2.24, 'impact-bass-1', 0.12],
  [2.4, 'pop', 0.13],
  [3.22, 'pop', 0.16],
  [3.75, 'whoosh-short', 0.13],
  [5.42, 'pop', 0.13],
  [5.95, 'sparkle', 0.14],
  [6.33, 'whoosh-short', 0.14],
  [7.76, 'pop', 0.14],
  [8.74, 'click-soft', 0.2],
  [9.93, 'click-soft', 0.2],
  [10.24, 'whoosh-short', 0.14],
  [10.87, 'sparkle', 0.15],
  [11.93, 'pop', 0.13],
  [12.62, 'click-soft', 0.2],
  [13.0, 'pop', 0.13],
  [13.96, 'click-soft', 0.2],
  [14.63, 'click-soft', 0.2],
  [15.06, 'whoosh-short', 0.14],
  [15.18, 'pop', 0.14],
  [16.1, 'pop', 0.14],
  [16.6, 'impact-bass-1', 0.18],
  [19.71, 'click', 0.25],
];

const DUR = 609;
const MUSIC_VOL = 0.105;

export const AudioLayer: React.FC = () => (
  <>
    <Audio
      src={staticFile('ejemplo-tiktok/music.mp3')}
      trimBefore={20 * FPS}
      volume={(f) =>
        interpolate(f, [0, 9, DUR - 18, DUR - 1], [0, MUSIC_VOL, MUSIC_VOL, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      }
    />
    {CUES.map(([at, file, vol], i) => (
      <Sequence key={i} from={Math.round(at * FPS)} durationInFrames={Math.min(Math.round(2 * FPS), DUR - Math.round(at * FPS))} layout="none">
        <Audio src={staticFile(`sfx/${file}.mp3`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
