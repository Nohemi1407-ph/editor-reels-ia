// Textos de MUESTRA: reemplázalos por las frases reales de tus testimonios (con su permiso).
// Testimonial timeline + corrected captions (timings from words.json, text fixed by hand)
export type Kind = 'est' | 'man' | 'wa';
export type Enter = 'none' | 'slide' | 'bump' | 'cut';
/** [text, start seconds (clip-relative), highlight] */
export type W = [string, number, boolean?];

export type Clip = {
  id: string;
  frames: number; // clip length in frames
  kind: Kind;
  label: string;
  zoom: number; // base crop zoom (alternate to hide jump cuts)
  enter: Enter;
  pages: W[][];
};

export const CLIPS: Clip[] = [
  {
    id: 't1_est', frames: 142, kind: 'est', label: '— Alumna', zoom: 1.0, enter: 'none',
    pages: [
      [['Lo', 0], ['único', 0.44], ['que', 0.62], ['sabía', 0.86], ['era', 1.3]],
      [['lo', 2.85], ['normal', 3.1], ['de', 3.66], ['ChatGPT', 4.02, true]],
    ],
  },
  {
    id: 't2_est', frames: 141, kind: 'est', label: '— Alumna', zoom: 1.1, enter: 'bump',
    pages: [
      [['Ahora,', 0], ['cuando', 0.95], ['comencé', 1.12], ['con', 2.3], ['usted,', 2.68]],
      [['todo', 3.88], ['ha', 4.18], ['cambiado', 4.36, true]],
    ],
  },
  {
    id: 't3_est', frames: 70, kind: 'est', label: '— Alumna', zoom: 1.0, enter: 'bump',
    pages: [[['¡Wow!', 0.4], ['Pero', 1.04], ['yo', 1.2], ['puedo', 1.36], ['hacer', 1.52], ['todo', 1.84, true], ['esto', 2.06, true]]],
  },
  {
    id: 't4_man', frames: 95, kind: 'man', label: '— Alumno', zoom: 1.0, enter: 'slide',
    pages: [
      [['Era', 0], ['para', 0.26], ['yo', 1.0], ['aprender…', 1.18]],
      [['nunca', 1.74], ['pensé', 2.04], ['que', 2.44], ['iba', 2.54], ['a', 2.64], ['vender', 2.76, true]],
    ],
  },
  {
    id: 't5_man', frames: 82, kind: 'man', label: '— Alumno', zoom: 1.08, enter: 'bump',
    pages: [
      [['La', 0], ['primera', 0.38], ['que', 0.64], ['lancé', 0.8], ['contigo', 1.04]],
      [['es', 1.46], ['la', 1.58], ['que', 1.68], ['realmente', 1.86], ['me', 2.36], ['pegó', 2.5, true]],
    ],
  },
  {
    id: 't6_wa', frames: 148, kind: 'wa', label: '— Alumno de mentoría', zoom: 1.0, enter: 'slide',
    pages: [
      [['me', 0], ['ha', 0.24], ['permitido', 0.48], ['hoy', 1.66]],
      [['tener', 1.78], ['esta', 2.62], ['satisfacción,', 2.8, true]],
      [['la', 3.6], ['primera', 3.66], ['de', 3.9], ['muchas', 4.18]],
      [['en', 4.38], ['este', 4.5], ['camino', 4.7]],
    ],
  },
  {
    id: 't7a_est', frames: 62, kind: 'est', label: '— Alumna', zoom: 1.0, enter: 'slide',
    pages: [[['Nunca', 0], ['es', 0.4], ['tarde', 0.62, true], ['para', 1.35], ['aprender…', 1.62, true]]],
  },
  {
    id: 't7b_est', frames: 55, kind: 'est', label: '— Alumna', zoom: 1.12, enter: 'cut',
    pages: [[['pero', 0], ['yo', 0.44], ['estoy', 0.7], ['aprendiendo', 0.92, true]]],
  },
  {
    id: 't8a_est', frames: 36, kind: 'est', label: '— Alumna', zoom: 1.0, enter: 'bump',
    pages: [[['Que', 0], ['no', 0.14], ['lo', 0.28], ['piense', 0.48], ['dos', 0.74, true], ['veces…', 0.94, true]]],
  },
  {
    id: 't8b_est', frames: 107, kind: 'est', label: '— Alumna', zoom: 1.1, enter: 'cut',
    pages: [
      [['porque', 0], ['la', 0.48], ['oportunidad', 0.7, true]],
      [['y', 1.62], ['el', 2.36], ['futuro', 2.52, true], ['están', 2.78], ['en', 3.04], ['esto', 3.34]],
    ],
  },
];

export const STARTS: number[] = [];
{
  let acc = 0;
  for (const c of CLIPS) {
    STARTS.push(acc);
    acc += c.frames;
  }
}
export const TESTI_FRAMES = CLIPS.reduce((a, c) => a + c.frames, 0); // 938
/** pizarra length in frames — updated after the final render of the pizarra is probed */
export const PIZ_FRAMES = 2006;
export const TOTAL_FRAMES = TESTI_FRAMES + PIZ_FRAMES;

// card geometry
export const CARD_TOP = 304;
export const CARD_H = 940;
export const cardW = (k: Kind) => (k === 'est' ? 860 : 640);

/** source crop rect (in source pixels) per kind: [x, y, w, h], plus source size */
export const CROP: Record<Kind, {x: number; y: number; w: number; h: number; sw: number; sh: number}> = {
  // speaker tile x 958-1908, y 272-806; keep y < 780 (name label), card ratio 860/940
  est: {x: 1104, y: 272, w: 465, h: 508, sw: 1920, sh: 1080},
  // man tile x 1282-1582
  man: {x: 1282, y: 300, w: 300, h: 440, sw: 1920, sh: 1080},
  // vertical selfie 576x1024
  wa: {x: 0, y: 60, w: 576, h: 846, sw: 576, sh: 1024},
};
