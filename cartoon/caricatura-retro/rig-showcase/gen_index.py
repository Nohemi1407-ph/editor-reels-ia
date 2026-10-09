# Generates rig-showcase/index.html (12 s rig showcase: every expression and pose).
# Run from cartoon/caricatura-retro:  python3 rig-showcase/gen_index.py   then  cd rig-showcase && npm run dev
import os
EXPR = ['neutral','happy','grin','worried','shout','annoyed','scared','tired','surprised','wink','proud']
POSES = ['idle','wave','point','pointUp','typing','holdPhone','handsOnHips','facepalm','shrug','armsUp','carryOverhead','thumbsUp','coffee','juggle']
POSE_FACE = {'idle':'neutral','wave':'happy','point':'proud','pointUp':'surprised','typing':'tired','holdPhone':'worried',
  'handsOnHips':'annoyed','facepalm':'tired','shrug':'annoyed','armsUp':'grin','carryOverhead':'worried','thumbsUp':'wink',
  'coffee':'happy','juggle':'scared'}
TALK = {'neutral','happy','worried','shout','annoyed','proud'}
labels = []
segs = []  # (id, text, kind, t0, t1)
t = 0.0
for e in EXPR:
    segs.append(('lx-'+e, e, 'Expresion', round(t,3), round(t+0.4,3))); t += 0.4
for p in POSES:
    segs.append(('lp-'+p, p, 'Pose', round(t,3), round(t+0.4,3))); t += 0.4
segs.append(('ls-slump', 'slump', 'Postura', 10.0, 10.9))
segs.append(('ls-jump', 'jump', 'Salto', 10.9, 12.0))
html_labels = ''.join(f'<div class="lab" id="{i}"><span class="k">{k}</span><span class="v">{v}</span></div>' for i,v,k,a,b in segs)

js = []
js.append("const tl = gsap.timeline({ paused: true });")
js.append("const g = Girl.create(document.getElementById('stage'), { id: 'host', x: 540, y: 1760, scale: 1.48 });")
js.append("document.querySelectorAll('.lab').forEach(el => gsap.set(el, { autoAlpha: 0 }));")
for i,v,k,a,b in segs:
    js.append(f"tl.set('#{i}', {{ autoAlpha: 1 }}, {max(a,0.0)});")
    js.append(f"tl.set('#{i}', {{ autoAlpha: 0 }}, {b-0.002:.3f});")
t = 0.0
for e in EXPR:
    if t > 0: js.append(f"g.face(tl, {t-0.06:.3f}, '{e}');")
    if e in TALK: js.append(f"g.talk(tl, {t+0.08:.3f}, {t+0.36:.3f});")
    t += 0.4
for p in POSES:
    js.append(f"g.pose(tl, {t:.3f}, '{p}', 0.25);")
    js.append(f"g.face(tl, {t:.3f}, '{POSE_FACE[p]}');")
    if p == 'wave': js.append(f"g.waveHand(tl, {t+0.25:.3f}, {t+0.4:.3f});")
    t += 0.4
js.append("g.pose(tl, 9.95, 'idle', 0.25); g.face(tl, 10.0, 'tired'); g.slump(tl, 10.0, true); g.slump(tl, 10.55, false);")
js.append("g.face(tl, 10.85, 'grin'); g.pose(tl, 10.85, 'armsUp', 0.2); g.jump(tl, 11.0, 70);")
js.append("g.autoBlink(tl, 0, 12);")
js.append("tl.set({}, {}, 12);")
js.append('window.__timelines = window.__timelines || {};')
js.append('window.__timelines["main"] = tl;')

html = f'''<!doctype html>
<html lang="es" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<link rel="stylesheet" href="assets/fonts/fonts.css" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script src="character.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:#FBF3DC}}
#root{{position:relative;width:1080px;height:1920px;overflow:hidden;background:#FBF3DC}}
#scene{{position:absolute;left:0;top:0;width:1080px;height:1920px}}
.title{{position:absolute;left:0;right:0;top:150px;text-align:center;font:400 64px 'DM Serif Display';color:#1d1b2e}}
.sub{{position:absolute;left:0;right:0;top:232px;text-align:center;font:600 28px 'Inter Tight';color:#6b6680;letter-spacing:.5px}}
.lab{{position:absolute;left:0;right:0;top:330px;text-align:center}}
.lab .k{{display:block;font:600 26px 'Inter Tight';color:#8a8399;text-transform:uppercase;letter-spacing:3px}}
.lab .v{{display:inline-block;margin-top:8px;padding:10px 28px;border-radius:99px;background:#1d1b2e;color:#FBF3DC;font:700 48px 'Inter Tight'}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="12" data-width="1080" data-height="1920">
  <svg id="scene" width="1080" height="1920" viewBox="0 0 1080 1920"><g id="stage"></g></svg>
  <div class="title">Host</div>
  <div class="sub">character rig test</div>
  {html_labels}
</div>
<script>
{chr(10).join(js)}
</script>
</body>
</html>
'''
import shutil
HERE = os.path.dirname(os.path.abspath(__file__))
UP = os.path.join(HERE, '..')
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(html)
for f in ('character.js', 'hyperframes.json', 'package.json'):
    shutil.copy(os.path.join(UP, f), HERE)
shutil.copytree(os.path.join(UP, 'assets', 'fonts'), os.path.join(HERE, 'assets', 'fonts'), dirs_exist_ok=True)
print('wrote rig-showcase/index.html')
print('ok')
