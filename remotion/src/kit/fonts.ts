import {continueRender, delayRender, staticFile} from 'remotion';

type F = {family: string; file: string; weight: string; style: string};
const FONTS: F[] = [
  {family: 'Inter Tight', file: 'fonts/InterTight-var-latin.woff2', weight: '400 700', style: 'normal'},
  {family: 'Inter Tight', file: 'fonts/InterTight-800-normal.woff2', weight: '800', style: 'normal'},
  {family: 'Inter Tight', file: 'fonts/InterTight-900-normal.woff2', weight: '900', style: 'normal'},
  {family: 'DM Serif Display', file: 'fonts/DMSerifDisplay-400-normal.woff2', weight: '400', style: 'normal'},
  {family: 'DM Serif Display', file: 'fonts/DMSerifDisplay-400-italic.woff2', weight: '400', style: 'italic'},
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    FONTS.map((f) => {
      const face = new FontFace(f.family, `url('${staticFile(f.file)}') format('woff2')`, {
        weight: f.weight,
        style: f.style,
      });
      return face.load().then((loaded) => {
        document.fonts.add(loaded);
      });
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Font load failed', err);
      continueRender(handle);
    });
};
