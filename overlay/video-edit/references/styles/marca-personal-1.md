# Style "Marca personal 1"

Source: a public Instagram reel (https://www.instagram.com/reel/DdeyIElpX10/), 47.7s, 720x1280, a creator
talking while driving, Spanish. Reference frames: not bundled in this repo (they are frames of someone else's reel). To rebuild them, download the reel (docs/04-estilos.md, Apify method) and run scripts/hoja_contacto.py on it, saving `marca-personal-1_frames.jpg` next to this file. Use when the user says "estilo Marca personal 1".
This is a reference for the editing language only: never reuse the creator's footage, words or face.

The house rules in SKILL.md still apply on top (Spanish, error pass first, 2 typefaces, neon accents, nothing on
the face, CTA buttons at the bottom). This style is compatible: it is one sans family + a neon yellow accent.

## Client adjustments (after the first reel made with this style) - these override the reference where they differ
- Do NOT scatter the words: show the whole short phrase on ONE small line with its key word directly below it,
  both centred, tight (no left/right offsets, no third line below).
- Add the motion-graphic inserts anyway (one per idea, as in the house rules): this style + animations. Put them
  where the face is not (selfie: top band y 225-525) with the caption pair right under them.
- The CTA card ("envíame RETO") gets a chat/DM animation plus the neon CTA pill at the bottom.

## The feel
Fast, conversational, "friend explaining it straight". Minimal, clean, lots of air. Very little text on screen at
any moment. The rhythm comes from cuts, grade flips and full-screen interruptions, not from flashy caption motion.

## Captions (the core of the look)
- One sans family, Inter Tight. Lowercase, tight tracking (-0.03em), white with a soft dark shadow
  (`0 2px 12px rgba(0,0,0,.55)`). No pills, no boxes, no outlines.
- Only 1-3 words on screen at a time, swapped with HARD CUTS on the spoken word (no blur-pop, no bounce). At most a
  70-100ms fade/scale 1.04->1 on the keyword.
- Default line: small, Inter Tight 600, ~42px (at 1080 wide), centred over the chest (y ~ 1000-1100), slightly
  off-centre toward the empty side of the frame is fine.
- KEYWORD stack (the signature): a 3-line cluster: small word(s) above (~40px, 500-600), the KEY word big and heavy
  (~95-110px, 800-900, letter-spacing -0.04em), small word(s) below (~40px). The small words appear first, the key
  word lands on its spoken frame. Lines are left-aligned to a shared axis or loosely staggered (above-left,
  key centred, below-right), not a rigid centred block.
- Key word colour: white for emphasis, NEON YELLOW-LIME (house `#C8FF00`, glow `0 0 10px rgba(200,255,0,.7)`) for
  the topic / positive words (e.g. "dropshipping", "segundo"), NEON RED (`#FF2D55`) for negative or provocative
  words (e.g. the censored swear word, "problema", "estafa"). Censor swear words with an asterisk ("mierd*").
- Big numbers ("300", "5%", "2024") are their own key word: white, 900, ~150px, centred.

## Interruption cards (white grid paper)
- Full-screen cards of ~0.6-1.2s that cut in between speaker shots: light grey-white background with a radial
  vignette (centre #f4f4f4 -> edges #cfcfcf) and a thin dark grid (~1.5px lines, ~130px cells) with a slight
  barrel/bulge distortion (SVG or CSS perspective so the grid bows outward in the centre).
- Black text in the same keyword-stack layout (small regular word + huge black 900 key word + small word), built
  word by word on the voice. Optional small 3D-ish sticker/icon next to the key word (e.g. a phone with shopping
  bags) popping in with a slight rotation.
- Variant: plain white card with one huge number in soft grey with a glow, then cut back to the speaker with the
  same number as the key word.
- Use 2-4 of these per 45s, on the punchline or a concept word.

## Grade flips
- Normal shots: natural, bright, slightly warm, a touch of contrast.
- Switch to BLACK AND WHITE (desaturate fully, contrast +10%) for the provocative / negative lines or a "real talk"
  aside, for 1-3 sentences, then back to colour on the next cut. (This overrides the old "no B&W" default only
  inside this style.)

## Cutting & B-roll
- Cut every 1-2 seconds: jump cuts with a zoom change (1.0 / 1.15 / 1.3), no transitions, no whooshes needed.
- Full-screen B-ROLL interrupts for 1-2s whenever the line names something concrete (boxes, deliveries, a phone
  dashboard with numbers, a printer spitting labels). Captions continue over the B-roll in the same style.
  B-roll must be the client's own footage or screen recordings; if they have none, ask for it, or replace the
  B-roll beat with an animated insert / a grid card. Never fake a sales dashboard with invented numbers.
- No music bed required; keep the voice dominant. Light SFX only on the grid cards and numbers.

## Build notes (HyperFrames template)
- Reuse dude_words() machinery with hard-cut timing: fromTo duration .08, no blur; remove the scale 1.22 pop.
- New CSS classes: `.mp-sm` (600 42px), `.mp-key` (900 104px, -.04em), `.mp-num` (900 150px), `.mp-y` neon lime,
  `.mp-r` neon red. Each caption group = up to 3 absolutely positioned lines around one anchor point.
- Grid card = a full-frame div (z above the stage) with an inline SVG grid + radial gradient, shown with tl.set.
- B&W = `tl.set('.g',{filter:'grayscale(1) contrast(1.1)'})` at the cut, back to the normal grade at the next cut.
