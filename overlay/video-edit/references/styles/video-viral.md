# Style "Video viral"

Source: a public Instagram reel (https://www.instagram.com/reel/DdckyZaNpsw/), 29.3s, 1080x1920, a
humorous "POV" skit between two people filmed by a camera operator at golden hour. Reference frames: not bundled in this repo (they are frames of someone else's reel). To rebuild them, download the reel (docs/04-estilos.md, Apify method) and run scripts/hoja_contacto.py on it, saving `video-viral_frames.jpg` next to this file. Use when the user says
"estilo Video viral". Reference for the editing language only: never reuse the creator's footage or words.

House rules in SKILL.md still apply (Spanish, error pass first, 2 typefaces, neon colour, nothing on the face,
CTA at the bottom). This style uses ONE sans family (Inter Tight) and no motion-graphic inserts by default.

## The feel
Cinematic, minimal, "film it and let it breathe". The hook is a permanent title; the people and the reactions do
the work. Works for humour, skits, POV situations, conversations, behind-the-scenes, two-person dialogues.

## Layout (the signature): letterbox window on black
- Whole frame black (#000). The footage sits in a full-width WINDOW of 1080 x ~972 (about 10:9) at y 474-1446,
  cropped/scaled from the source (cover, centred on the faces). Nothing outside the window except the title.
- The empty black band under the window (1446-1920) is exactly where Instagram's UI sits, so nothing important is
  lost; the CTA button (house rule) goes just above 1470 only if the video has a CTA.

## Permanent hook title (top black band)
- Two centred lines above the window, on screen the WHOLE video, never animated after a 0.2s fade-in:
  line 1 at y ~354, line 2 at y ~432, Inter Tight ~64px, white, letter-spacing -0.01em.
- Format: "POV: <situación>" with the lead-in ("POV:") in 800 weight and the rest 500, and the punch word alone on
  line 2 in 800 (e.g. "POV: Farmeás aura con los / **masivos**"). Ask the user for the hook line or propose 3.
- A neon accent is allowed on the punch word only if the client wants colour (house rule: neon lime #C8FF00 + glow).

## Captions (dialogue subtitles)
- One short phrase at a time (2-5 words), lowercase as spoken, Inter Tight 700 ~60px, centred in the window at
  y ~955 (window centre), soft dark shadow `0 2px 10px rgba(0,0,0,.6)`, no box.
- COLOUR = SPEAKER: person A white, person B neon yellow-lime (#C8FF00 house neon, light glow). With one speaker,
  white only and the neon colour for the punch word.
- Phrases swap on the spoken boundary with a hard cut (no pop). Non-speech tags in the same style with an asterisk:
  "Risas*", "Silencio*", "Grito*".
- Captions may sit over chests; never over eyes/mouth (move up/down inside the window if a face is there).

## Punchline treatment
- On the final punchline / biggest laugh: cut to BLACK AND WHITE (grayscale 1, contrast +10%) for the last
  1.5-3s, with one big emoji reaction (~110px, e.g. crying-laughing skull) centred in the window, popping in with a
  small bounce. The title stays. (B&W is allowed inside this style.)
- Optional: a short freeze-frame (0.3-0.5s) on the reaction face before the B&W ending.

## Camera, grade, cutting
- Grade: warm golden-hour, slightly lifted blacks, soft contrast, a touch of film softness; skin natural.
- Cutting follows the conversation: keep takes long enough for the reactions (2-6s), cut on the exchange, not on
  every word. Very few cuts compared with "Marca personal 1". No zoom punches, no whooshes.
- No music bed by default; original audio, laughs kept. SFX only for the emoji pop (soft).

## Build notes (HyperFrames template)
- Root background #000; put #stage inside a window div `position:absolute;left:0;top:474px;width:1080px;
  height:972px;overflow:hidden`, the base video `object-fit:cover` inside it (set object-position per shot if the
  faces sit off-centre). Captions/title are outside the stage so they never scale.
- Title = two static divs created at t=0. Captions = GROUPS with one line each (class `.vv-cap`, colour class per
  speaker). Emoji = a div with the emoji character (Apple emoji render fine) popped with back.out.
- B&W ending = `tl.set('.g',{filter:'grayscale(1) contrast(1.1)'})` at the punchline cut.
