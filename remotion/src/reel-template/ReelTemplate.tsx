/**
 * ReelTemplate — plantilla limpia para empezar un reel desde cero.
 *
 * Capas (de abajo hacia arriba):
 *   1. Video vertical 1080x1920 (o un fondo de ejemplo si `video` está vacío)
 *   2. Tarjetas animadas (inserts) en la banda BAJA (pecho / mesa), nunca sobre la cara
 *   3. Subtítulo en píldora oscura con UNA palabra clave en neón
 *   4. Botón CTA abajo, justo encima de la zona segura de Instagram (y = 1470)
 *   5. Música y efectos de sonido opcionales
 *
 * Todo se controla con props (ver reel.json). Para un render con otros datos:
 *   npx remotion render ReelTemplate out/mi-reel.mp4 --props=src/reel-template/mi-reel.json
 * Las rutas de `video`, `music` y `sfx` son relativas a la carpeta public/.
 */
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {loadFonts} from '../kit/fonts';
import {cardStyle, easeIn, easeOut, FPS, glow, GREEN, INK, LIME, lin, RED, SANS, SERIF, spr} from '../kit/theme';

loadFonts();

export type Caption = {start: number; end: number; text: string; key?: string};
export type Insert = {start: number; end: number; kicker?: string; big: string; small?: string; color?: 'lime' | 'red' | 'green'};
export type Cta = {start: number; end: number; text: string};
export type Sfx = {at: number; file: string; volume?: number};

export type ReelProps = {
  durationSec: number;
  video: string; // p. ej. "mi-reel/aroll.mp4" (dentro de public/). Vacío = fondo de ejemplo
  music?: string; // p. ej. "mi-reel/music.mp3" (solo música con licencia)
  musicVolume?: number;
  safeGuide?: boolean; // dibuja las zonas seguras en rojo (solo para revisar, nunca para el render final)
  captions: Caption[];
  inserts: Insert[];
  cta?: Cta | null;
  sfx?: Sfx[]; // nombres de public/sfx sin .mp3: pop, whoosh-short, click, click-soft, sparkle, impact-bass-1
};

const NEON = {lime: LIME, red: RED, green: GREEN};
const SAFE_BOTTOM = 1470; // 1920 - 450: debajo de esto Instagram pone el texto y los botones

const useT = () => useCurrentFrame() / FPS;

const Background: React.FC<{video: string}> = ({video}) => {
  if (video) {
    return <OffthreadVideo src={staticFile(video)} style={{width: '100%', height: '100%'}} />;
  }
  // sin video: fondo de ejemplo con una silueta donde iría la persona
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #23262E 0%, #0E1014 100%)'}}>
      <div style={{position: 'absolute', left: 340, top: 560, width: 400, height: 470, borderRadius: '50%', background: '#2E323C'}} />
      <div style={{position: 'absolute', left: 190, top: 1000, width: 700, height: 1000, borderRadius: '320px 320px 0 0', background: '#2A2E37'}} />
      <div style={{position: 'absolute', top: 480, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: '#8A90A0'}}>
        (aquí va tu video: pon la ruta en "video")
      </div>
    </AbsoluteFill>
  );
};

const CaptionPill: React.FC<{c: Caption}> = ({c}) => {
  const t = useT();
  if (t < c.start || t >= c.end) return null;
  const enter = spr(t, c.start, {damping: 14, stiffness: 220});
  const exit = lin(t, c.end - 0.08, c.end, 0, 1, easeIn);
  const words = c.text.split(/\s+/);
  const key = (c.key || '').toLowerCase();
  return (
    <div style={{position: 'absolute', top: 240, left: 35, width: 1010, display: 'flex', justifyContent: 'center',
      opacity: Math.min(1, enter * 2) * (1 - exit), transform: `scale(${0.85 + 0.15 * enter})`}}>
      <div style={{background: 'rgba(14,16,20,0.82)', borderRadius: 26, padding: '14px 32px 18px', display: 'flex', gap: 18,
        flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1010}}>
        {words.map((w, i) => {
          const isKey = key && w.toLowerCase().replace(/[.,!?¡¿]/g, '') === key.replace(/[.,!?¡¿]/g, '');
          return (
            <span key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: isKey ? 76 : 66, lineHeight: 1.1,
              color: isKey ? LIME : '#fff', textShadow: isKey ? glow(LIME, 0.8) : 'none'}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const InsertCard: React.FC<{c: Insert}> = ({c}) => {
  const t = useT();
  if (t < c.start || t >= c.end) return null;
  const col = NEON[c.color || 'lime'];
  const enter = spr(t, c.start, {damping: 12, stiffness: 180});
  const exit = lin(t, c.end - 0.25, c.end, 0, 1, easeIn);
  const W = 860;
  const H = 360;
  return (
    <div style={{...cardStyle, left: 540 - W / 2, top: SAFE_BOTTOM - 80 - H, width: W, height: H,
      opacity: Math.min(1, enter * 2) * (1 - exit), transform: `translateY(${(1 - enter) * 80 + exit * 40}px) scale(${0.9 + 0.1 * enter})`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 54px'}}>
      {c.kicker && (
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color: '#9AA0AE'}}>{c.kicker}</div>
      )}
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, lineHeight: 1.05, color: col, textShadow: glow(col, 1),
        transform: `scale(${0.8 + 0.2 * lin(t, c.start + 0.1, c.start + 0.5, 0, 1, easeOut)})`, transformOrigin: '0% 50%'}}>
        {c.big}
      </div>
      {c.small && <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, color: '#fff', marginTop: 6}}>{c.small}</div>}
    </div>
  );
};

const CtaButton: React.FC<{c: Cta}> = ({c}) => {
  const t = useT();
  if (t < c.start || t >= c.end) return null;
  const enter = spr(t, c.start, {damping: 10, stiffness: 200});
  const exit = lin(t, c.end - 0.2, c.end, 0, 1, easeIn);
  const pulse = 1 + 0.04 * Math.sin((t - c.start) * 6);
  const bob = Math.sin((t - c.start) * 5) * 8;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: SAFE_BOTTOM - 150, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: Math.min(1, enter * 2) * (1 - exit), transform: `scale(${enter * pulse})`}}>
      <div style={{background: LIME, color: INK, fontFamily: SANS, fontWeight: 800, fontSize: 60, padding: '18px 54px 22px', borderRadius: 999,
        boxShadow: `0 0 30px ${LIME}aa, 0 10px 30px rgba(0,0,0,0.4)`}}>
        {c.text}
      </div>
      <svg width={60} height={50} viewBox="0 0 60 50" style={{marginTop: 8, transform: `translateY(${bob}px)`}}>
        <path d="M8 10 L30 36 L52 10" fill="none" stroke={LIME} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** zonas seguras de Instagram: arriba 220, abajo 450, lados 35, derecha 100 desde y=1155 */
const SafeGuide: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 220, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 450, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', left: 0, top: 220, bottom: 450, width: 35, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', right: 0, top: 220, bottom: 450, width: 35, background: 'rgba(255,0,0,0.25)'}} />
    <div style={{position: 'absolute', right: 0, top: 1155, bottom: 450, width: 100, background: 'rgba(255,0,0,0.35)'}} />
  </AbsoluteFill>
);

export const ReelTemplate: React.FC<ReelProps> = (p) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Background video={p.video} />
      <AbsoluteFill>
        {p.inserts.map((c, i) => <InsertCard key={`i${i}`} c={c} />)}
        {p.captions.map((c, i) => <CaptionPill key={`c${i}`} c={c} />)}
        {p.cta ? <CtaButton c={p.cta} /> : null}
      </AbsoluteFill>
      {p.safeGuide && <SafeGuide />}
      {p.music ? <Audio src={staticFile(p.music)} volume={p.musicVolume ?? 0.06} /> : null}
      {(p.sfx || []).map((s, i) => (
        <Sequence key={`s${i}`} from={Math.floor(s.at * FPS)} durationInFrames={2 * FPS} layout="none">
          <Audio src={staticFile(`sfx/${s.file}.mp3`)} volume={Math.min(0.3, s.volume ?? 0.2)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
