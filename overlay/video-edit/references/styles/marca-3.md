# Style "Marca 3"

Source: a public Instagram reel (https://www.instagram.com/reel/DROXwfHjLWg/), 35s, 720x1280, a
content creator selling reel editing ("comenta REEL"), seated at a desk, Spanish. Reference frames: not bundled in this repo (they are frames of someone else's reel). To rebuild them, download the reel (docs/04-estilos.md, Apify method) and run scripts/hoja_contacto.py on it, saving `marca-3_frames.jpg` next to this file. Use when the user says "estilo
Marca 3". Editing language only: never reuse the creator's footage, phone screens or words.

House rules in SKILL.md still apply (Spanish, error pass first, 2 typefaces, neon with glow, nothing on the face,
CTA at the bottom, BIG type). This style already uses one sans + neon lime: a direct fit.

## The feel
Clean, "designer/agency" minimal: alternates between the talking head and a bright white studio CANVAS where the
ideas are laid out as UI objects (checklists, phone mockups, connectors). Feels like a premium Apple-style
explainer. White, black and ONE neon (lime).

## The white canvas (signature)
- Full-screen light canvas: off-white with a soft radial falloff (centre #f4f4f2 -> edges #d9d9d6), plus two thick
  BLACK S-CURVE strokes (~28px, round caps) entering from opposite corners (top-left and bottom-right), which drift
  slightly between canvases. No grid.
- OPENING: the talking-head video shrinks into a white phone mockup (rounded 60px, thick white bezel, soft
  shadow) and slides to the left of the canvas; social action icons (heart, comment, send, save) stack beside it
  in black outline circles; the line of text types next to them (small black Inter Tight 700, ~44px, with the last
  words bold/black 800). Use it for the hook ("publicas, publicas… pero nadie te presta atención").
- CHECKLIST canvas: dashed-border pills (white fill, 2px dashed #222, radius 22, soft shadow) that drop in one by
  one, each with a round X icon (problems) or a check (solutions), text Inter Tight 700 ~40px black; a heading
  above in small regular + bold big black ("y sin enfoque en / **lo que vende**").
- PHONE MOCKUPS canvas: 2 dark phone mockups tilted (-12deg / +10deg) floating, showing the client's own content;
  a dashed label pill above them listing benefits with bullets; a thin vertical connector line drops down to a
  round black icon (person+star = "tu cliente"), with a caption under it ("empiezas a vender más").

## Talking-head sections
- Natural warm grade, slight vignette, soft bottom fade to dark (lower 20%).
- Captions over the chest, centred: small white Inter Tight 600 ~50px with soft shadow; the KEY phrase on the second
  line in NEON LIME (#C8FF00, 800, ~70px, glow). Words appear quickly as spoken (0.1s fade/blur).
- AR inserts next to the speaker: floating mini phone cards (dark screens with neon lime/green outline glow,
  ~180x320) that pop up from the desk beside his hands when he mentions "publicaciones / cómo se ven".
- CTA: "comenta" small white + the keyword HUGE in neon lime with quotes ('"REEL"', Inter Tight 900 ~170px, glow),
  low-centre. House rule: the CTA button/keyword sits at the bottom, above y=1470.

## Transitions & sound
- Canvas <-> talking head with a quick white flash / scale push (the video scales into the phone frame), no
  whooshes needed; soft UI clicks when pills/icons drop in, a pop for the phone mockups.
- Cuts are few in the talking head (3-6s takes); the canvases carry the rhythm.

## Build notes (HyperFrames)
- Canvas = full-frame div (z above the stage) with the radial background + an inline SVG with two thick black
  cubic-bezier paths; elements are absolutely positioned divs/agent renders shown with tl.set + small pop tweens.
- Phone-mockup opening: animate #stage (the base video) to scale ~.45 and x -220 inside a rounded mask div with a
  thick white border; the icon column and text are canvas elements.
- Checklist pills / phone mockups / connector icons can be built directly in the page (CSS) or as agent renders.
- Client content for the phone screens must be the client's own reels or screenshots (ask); otherwise use
  abstract dark UI placeholders, never fake brands or numbers.
