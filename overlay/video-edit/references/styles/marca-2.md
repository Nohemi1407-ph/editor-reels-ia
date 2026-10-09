# Style "Marca 2"

Source: a public Instagram reel (https://www.instagram.com/reel/DI-Bn0GTE-_/), 52s, 720x1280,
a business coach giving "3 tips" (cruise travel), Spanish. Reference frames: not bundled in this repo (they are frames of someone else's reel). To rebuild them, download the reel (docs/04-estilos.md, Apify method) and run scripts/hoja_contacto.py on it, saving `marca-2_frames.jpg` next to this file. Use when the user says "estilo Marca 2". Editing language only: never
reuse the creator's footage, AI cruise B-roll or words.

House rules in SKILL.md still apply (Spanish, error pass first, 2 typefaces, neon colour with glow, nothing on the
face, CTA at the bottom, BIG type). This style maps cleanly onto them: sans = Inter Tight, script word = DM Serif
Display italic, accent = NEON ORANGE-GOLD (this style's neon; lime/red/green only as secondary).

## The feel
Premium "list" content (3 tips / 3 pasos / 3 errores): warm, glossy, cinematic, a lot of glow. Each point is a
chapter with its own big 3D number, often its own location/angle, and an icon card. Polished, not chaotic.

## Frame treatment
- Strong bottom fade: the footage fades into BLACK over the lower ~25% (linear-gradient from transparent at y~1250
  to #000 at y~1650). Captions sit right on that fade, so they always read. Slight warm grade, soft vignette.
- Light leaks: warm orange/gold flare washes (screen blend, 0.4-0.7s) on section changes and on the CTA, sweeping
  in from a corner or the bottom.

## Captions (the signature pair)
- Lower-middle of the frame on the fade (y ~1150-1350; never on the face). Two-line pair, centred:
  line 1 = white sans (Inter Tight 800, ~92px, -0.03em) with a soft white BLOOM glow
  (`0 0 12px rgba(255,255,255,.55),0 0 30px rgba(255,255,255,.25)`);
  line 2 = the key word in a flowing ITALIC SERIF (DM Serif Display italic ~110px) in neon orange-gold
  (#FFB01F -> #FF7A00 vertical gradient via background-clip:text, glow `0 0 14px rgba(255,150,30,.7)`).
- Words reveal one by one with a quick blur-to-sharp + fade (0.15s), the script word "writes" in left-to-right
  (clip-path wipe 0.25s). Phrases are short (1-4 words + 1 key word). Lowercase except where a word starts a sentence.
- Plain-subtitle variant for asides: small white Inter Tight 600 ~48px, no glow, lower third, used inside the B&W
  close-up sections.

## Chapter numbers (signature motion)
- On "tip 1 / 2 / 3" (or paso/error): a glossy 3D ORANGE rounded-square badge (gradient #FFC03A -> #FF7A00, inner
  highlight, outer glow) with a white bold numeral FLIES IN from in front of the camera: starts huge (scale ~5,
  rotated ~25deg, motion-blurred) and lands small above the speaker's head (~140px) in 0.35s, then the word "Tip"
  (Inter Tight 900 italic, white, slight bevel/glow) wipes in to its right. Holds ~1.5s, then exits up.
- Intro: "1 2 3" badges pop in a row + "TIPS" in huge white italic heavy type (~200px) with a metallic gradient.

## Icon cards (full-screen interruptions, ~1s)
- Blurred/coloured full-screen background (a defocused, colour-washed version of the shot), a single glossy 3D
  icon (checklist+pin in neon cyan, calendar in orange, etc.) that DROPS IN hanging from a thin glowing light line
  from the top of frame, with a bounce; under it the concept word in wide tracked caps (Inter Tight 800, ~90px,
  white with glow, sometimes italic-extended). Use one per tip for the key concept.

## B&W close-ups
- For the explanation inside a tip, cut to a second, closer angle in BLACK AND WHITE (grayscale, contrast +10%,
  dark vignette) with the plain small subtitles. Back to colour (and the bloom captions) for the next beat.

## B-roll & stickers
- Cinematic B-roll for the topic (client's own footage or licensed/generated with permission) with the caption
  pair over it.
- Small 3D stickers next to the caption on the CTA/outro (bookmark = "guarda este video", airplane = "tu próximo
  viaje"), popping in with a bounce and a soft shadow.

## Cutting & sound
- Cut on every sentence; each tip ideally in a different location/angle. Jump cuts with 1.0/1.15 zoom.
- Whoosh + soft impact on each number fly-in; shimmer on icon cards; light riser on the light leaks; music bed
  optional (low, warm), voice always on top.

## Build notes (HyperFrames)
- Bottom fade = a fixed gradient div above the stage (z 7). Light leak = a radial orange gradient div with
  mix-blend-mode:screen tweened in/out.
- Number badge = an agent-rendered transparent webm per number (or CSS: rounded square + gradient + inset
  highlight + box-shadow glow, numeral in Inter Tight 900 italic), fly-in tween scale 5 -> 1 with
  filter:blur(18px) -> 0 and rotation 25 -> -6 -> 0.
- Icon cards = agent renders (icon + light line + label) placed full screen over a blurred copy of the base video
  (`filter: blur(30px) saturate(1.4) brightness(.7)` on a second <video> of the same source, tl.set on/off).
