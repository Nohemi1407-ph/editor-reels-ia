import React from 'react';
import {easeIn, lin, spr, useT} from '../kit/theme';
import {Emoji} from './kit';

// [time, emoji, x(center), y(center), size, rotation]
type E = [number, string, number, number, number, number];
const POPS: E[] = [
  [0.18, '🌀', 860, 1080, 120, -12],
  [2.4, '☀️', 860, 1100, 120, 10],
  [3.25, '🥵', 860, 1100, 120, -10],
  [5.42, '🌀', 860, 1090, 120, 12],
  [7.76, '🚚', 860, 1100, 120, -8],
  [11.93, '💡', 860, 1100, 120, 10],
  [13.0, '⚡', 130, 1100, 120, -10],
  [16.62, '🔥', 860, 1070, 120, 8],
  [19.71, '🛒', 860, 1040, 120, -8],
];

const Pop: React.FC<{e: E}> = ({e}) => {
  const t = useT();
  const [at, em, x, y, size, rot] = e;
  const life = 0.85;
  if (t < at - 0.03 || t > at + life) return null;
  const p = spr(t, at - 0.03, {damping: 8, stiffness: 280, mass: 0.5});
  const exit = lin(t, at + life - 0.2, at + life, 0, 1, easeIn);
  const drift = (t - at) * -40;
  const wob = Math.sin((t - at) * 14) * 6 * (1 - Math.min(1, (t - at) / life));
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2 + drift,
        transform: `scale(${p * (1 - exit * 0.6)}) rotate(${rot + wob}deg)`,
        opacity: 1 - exit,
      }}
    >
      <Emoji e={em} size={size} />
    </div>
  );
};

export const EmojiPops: React.FC = () => (
  <>
    {POPS.map((e, i) => (
      <Pop key={i} e={e} />
    ))}
  </>
);
