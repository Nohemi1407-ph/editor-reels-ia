import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Freeze,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {loadFonts} from '../kit/fonts';
import {easeIn, easeOut, FPS, glow, LIME, SANS} from '../kit/theme';
import {CARD_H, CARD_TOP, CLIPS, Clip, CROP, cardW, PIZ_FRAMES, STARTS, TESTI_FRAMES, TOTAL_FRAMES, W} from './data';

loadFonts();

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EXIT = 8; // frames an outgoing card stays (frozen) while sliding away
const T = TESTI_FRAMES; // pizarra starts here
const MUSIC_START_S = 7; // track already building at 7 s (RMS ~ -20 dB)

const spr = (f: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  f < 0 ? 0 : spring({frame: f, fps: FPS, config: {damping: 14, stiffness: 180, mass: 0.7, ...cfg}});

/* ---------------- background ---------------- */
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const b1x = 160 + Math.sin(t * 0.35) * 90;
  const b1y = 420 + Math.cos(t * 0.27) * 70;
  const b2x = 900 + Math.cos(t * 0.3) * 80;
  const b2y = 1480 + Math.sin(t * 0.22) * 90;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg, #070B16 0%, #0A1226 45%, #05070E 100%)'}}>
      <div
        style={{
          position: 'absolute', left: b1x - 380, top: b1y - 380, width: 760, height: 760, borderRadius: '50%',
          background: `radial-gradient(circle, ${LIME}55 0%, ${LIME}18 40%, transparent 70%)`, filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute', left: b2x - 420, top: b2y - 420, width: 840, height: 840, borderRadius: '50%',
          background: `radial-gradient(circle, ${LIME}40 0%, ${LIME}12 42%, transparent 70%)`, filter: 'blur(50px)',
        }}
      />
      <div
        style={{
          position: 'absolute', left: 540 - 500, top: 760 - 500, width: 1000, height: 1000, borderRadius: '50%',
          background: 'radial-gradient(circle, #2A4BFF22 0%, transparent 65%)', filter: 'blur(30px)',
        }}
      />
      {/* grain */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

/* ---------------- pill ---------------- */
const Pill: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [T - 8, T], [0, 1], clamp);
  const pulse = 0.85 + 0.15 * Math.sin(f / 9);
  return (
    <div
      style={{
        position: 'absolute', top: 228, left: 0, right: 0, display: 'flex', justifyContent: 'center',
        opacity: 1 - out, transform: `translateY(${-40 * out}px)`,
      }}
    >
      <div
        style={{
          fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: '#fff',
          padding: '12px 28px', borderRadius: 999, background: 'rgba(10,16,30,0.75)',
          border: `2px solid ${LIME}`, boxShadow: `0 0 ${18 * pulse}px ${LIME}66, inset 0 0 12px ${LIME}22`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <span style={{fontSize: 28}}>⭐</span>
        <span>TESTIMONIOS <span style={{color: LIME}}>REALES</span></span>
      </div>
    </div>
  );
};

/* ---------------- stars ---------------- */
const Stars: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', top: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10}}>
    {[0, 1, 2, 3, 4].map((i) => {
      const s = spr(f - 2 - i * 3, {damping: 9, stiffness: 220});
      const tw = 1 + 0.08 * Math.sin((f - i * 6) / 6);
      return (
        <span
          key={i}
          style={{
            fontSize: 54, lineHeight: 1, color: LIME, display: 'inline-block',
            transform: `scale(${s * tw}) rotate(${(1 - s) * -90}deg)`, opacity: Math.min(1, s * 1.5),
            textShadow: glow(LIME, 0.8),
          }}
        >
          ★
        </span>
      );
    })}
  </div>
);

/* ---------------- card ---------------- */
const CardVideo: React.FC<{clip: Clip; f: number}> = ({clip, f}) => {
  const w = cardW(clip.kind);
  const c = CROP[clip.kind];
  const s = w / c.w;
  const push = interpolate(f, [0, clip.frames], [1, 1.06], clamp);
  const zoom = clip.zoom * push;
  const src = staticFile(`ejemplo-testimonios/${clip.id}.mp4`);
  const style: React.CSSProperties = {
    position: 'absolute', left: -c.x * s, top: -c.y * s, width: c.sw * s, height: c.sh * s, maxWidth: 'none',
  };
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 42%'}}>
      {f < clip.frames ? (
        <OffthreadVideo src={src} style={style} />
      ) : (
        <Freeze frame={clip.frames - 1}>
          <OffthreadVideo src={src} style={style} muted />
        </Freeze>
      )}
    </div>
  );
};

const Card: React.FC<{clip: Clip; i: number}> = ({clip, i}) => {
  const f = useCurrentFrame();
  const w = cardW(clip.kind);
  const next = CLIPS[i + 1];
  const last = i === CLIPS.length - 1;

  // enter
  let tx = 0, sc = 1, rot = 0, op = 1, edge = 0;
  if (clip.enter === 'slide') {
    const p = spr(f, {damping: 16, stiffness: 200});
    tx = (1 - p) * 1000;
    rot = (1 - p) * 8;
    sc = 0.86 + 0.14 * p;
  } else if (clip.enter === 'bump') {
    const p = spr(f, {damping: 10, stiffness: 260});
    sc = 0.93 + 0.07 * p;
    edge = interpolate(f, [0, 6], [1, 0], clamp);
  } else if (clip.enter === 'cut') {
    edge = interpolate(f, [0, 4], [0.5, 0], clamp);
  }
  // exit
  if (next && next.enter === 'slide' && f >= clip.frames) {
    const q = interpolate(f, [clip.frames, clip.frames + EXIT], [0, 1], {...clamp, easing: easeIn});
    tx += -1050 * q;
    rot += -8 * q;
    sc *= 1 - 0.14 * q;
  }
  let flyY = 0;
  if (last) {
    const q = interpolate(f, [clip.frames - 7, clip.frames + 5], [0, 1], {...clamp, easing: easeIn});
    flyY = -1500 * q;
    rot += 10 * q;
    sc *= 1 + 0.12 * q;
    op = 1 - interpolate(q, [0.6, 1], [0, 1], clamp);
  }

  const glowPulse = 0.8 + 0.2 * Math.sin((STARTS[i] + f) / 10);
  return (
    <div
      style={{
        position: 'absolute', top: CARD_TOP, left: 540 - w / 2, width: w, height: CARD_H, opacity: op,
        transform: `translate(${tx}px, ${flyY}px) rotate(${rot}deg) scale(${sc})`,
        transformOrigin: '50% 60%',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: 40, overflow: 'hidden', background: '#0B0F18',
          border: `3px solid ${LIME}`,
          boxShadow: `0 0 ${22 * glowPulse}px ${LIME}88, 0 0 ${60 * glowPulse}px ${LIME}33, 0 40px 80px rgba(0,0,0,0.6)`,
        }}
      >
        <CardVideo clip={clip} f={f} />
        {/* soft vignettes inside the card */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.45) 100%)'}} />
        {edge > 0 && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.35 * edge}} />}
        {i === 0 && <Stars f={f} />}
      </div>
      {/* label chip */}
      <div
        style={{
          position: 'absolute', left: 34, bottom: -26, padding: '10px 24px', borderRadius: 999,
          background: '#0A0F1C', border: `2px solid ${LIME}aa`, fontFamily: SANS, fontWeight: 700, fontSize: 32,
          color: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
        }}
      >
        {clip.label}
      </div>
    </div>
  );
};

/* ---------------- captions ---------------- */
const Caption: React.FC<{clip: Clip; i: number}> = ({clip, i}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const pages = clip.pages;
  let pi = 0;
  for (let k = 0; k < pages.length; k++) if (k === 0 || t >= pages[k][0][1] - 0.03) pi = k;
  const page = pages[pi];
  const last = i === CLIPS.length - 1;
  const out = last ? interpolate(f, [clip.frames - 4, clip.frames + 2], [0, 1], clamp) : 0;
  return (
    <div
      style={{
        position: 'absolute', top: 1290, left: 60, width: 920, display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', alignContent: 'flex-start', columnGap: 20, rowGap: 0,
        fontFamily: SANS, fontWeight: 900, fontSize: 78, lineHeight: 1.08, color: '#fff', letterSpacing: -1,
        opacity: 1 - out, transform: `translateY(${out * 40}px)`,
      }}
    >
      {page.map(([text, start, hl]: W, k) => {
        const lf = f - Math.round(start * FPS) + 3; // captions lead the voice by 0.1 s (and frame 0 hook shows text)
        const p = spr(lf, {damping: 12, stiffness: 260});
        if (lf < 0) return null; // unrevealed words take no space -> line stays centered
        return (
          <span
            key={`${pi}-${k}`}
            style={{
              display: 'inline-block', opacity: Math.min(1, 0.35 + p * 1.2),
              transform: `translateY(${(1 - p) * 26}px) scale(${0.8 + 0.2 * p})`,
              color: hl ? LIME : '#fff',
              textShadow: hl ? glow(LIME, 0.9) : '0 4px 18px rgba(0,0,0,0.6)',
            }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
};

/* ---------------- transition + pizarra ---------------- */
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [T - 2, T + 1, T + 12], [0, 1, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: '#fff', opacity: o}} />;
};

const Pizarra: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 14], [1.08, 1], {...clamp, easing: easeOut});
  return (
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <OffthreadVideo src={staticFile('ejemplo-testimonios/pizarra.mp4')} style={{width: 1080, height: 1920}} />
    </AbsoluteFill>
  );
};

/* ---------------- audio ---------------- */
const MusicAndSfx: React.FC = () => {
  const swaps = CLIPS.map((c, i) => (c.enter === 'slide' ? STARTS[i] : -1)).filter((x) => x > 0);
  return (
    <>
      <Audio
        src={staticFile('ejemplo-testimonios/music.mp3')}
        trimBefore={MUSIC_START_S * FPS}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, T - 10, T + 15, TOTAL_FRAMES - 45, TOTAL_FRAMES - 1],
            [0, 0.1, 0.1, 0.06, 0.06, 0],
            clamp,
          )
        }
      />
      {swaps.map((s) => (
        <Sequence key={s} from={s - 3} durationInFrames={30} layout="none">
          <Audio src={staticFile('sfx/whoosh-short.mp3')} volume={0.08} />
        </Sequence>
      ))}
      <Sequence from={T - 8} durationInFrames={40} layout="none">
        <Audio src={staticFile('sfx/whoosh-short.mp3')} volume={0.2} />
      </Sequence>
    </>
  );
};

export const EjemploTestimonios: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#05070E'}}>
      <Sequence durationInFrames={T + 14} layout="none">
        <Background />
        <Pill />
      </Sequence>
      {CLIPS.map((c, i) => {
        const ext = i === CLIPS.length - 1 || CLIPS[i + 1]?.enter === 'slide' ? EXIT : 0;
        return (
          <React.Fragment key={c.id}>
            <Sequence from={STARTS[i]} durationInFrames={c.frames + ext} layout="none" name={c.id}>
              <Card clip={c} i={i} />
            </Sequence>
          </React.Fragment>
        );
      })}
      {/* captions above cards (separate pass so a sliding-in card never covers text) */}
      {CLIPS.map((c, i) => (
        <Sequence key={`cap-${c.id}`} from={STARTS[i]} durationInFrames={c.frames + (i === CLIPS.length - 1 ? 3 : 0)} layout="none">
          <Caption clip={c} i={i} />
        </Sequence>
      ))}
      <Sequence from={T} durationInFrames={PIZ_FRAMES} name="pizarra">
        <Pizarra />
      </Sequence>
      <Flash />
      <MusicAndSfx />
    </AbsoluteFill>
  );
};
