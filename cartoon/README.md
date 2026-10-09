# Caricaturas animadas (HyperFrames)

Plantillas para videos explicativos con un personaje de caricatura que habla, hace gestos y usa objetos.
Todo es código: SVG (el dibujo) + GSAP (las animaciones) + HyperFrames (lo convierte en MP4).
HyperFrames ya lo instala el skill video-edit (se usa con `npx hyperframes@0.8.34`).

| Carpeta | Personaje | Estilo |
|---|---|---|
| `nina/` | niña caricatura (cola de caballo, chaqueta magenta) | plano y colorido, sin contornos. Trae solo el personaje (`character.js`) y los objetos (`props.js`): para armar el video copia el `build.py` de `caricatura-retro/` y cambia el personaje |
| `caricatura-retro/` | personaje retro con contorno grueso | caricatura plana retro, fondo crema que cambia de color por escena; trae `STORYBOARD.md` de ejemplo |

Cada carpeta tiene:
- `character.js` — el muñeco (rig). API: `Girl.create(grupoSvg, {id, x, y, scale})` y luego
  `face(tl,t,'happy')`, `talk(tl,t0,t1)`, `autoBlink`, `pose(tl,t,'wave')`, `waveHand`, `bob`, `jump`, `prop`...
  (la lista exacta de expresiones y poses está al inicio de cada archivo).
- `props.js` — objetos animables (laptop, celular, gráficas, billetes, relojes...).
- `build.py` — arma `index.html` con los textos, escenas, efectos y tiempos. **Aquí cambias el contenido.**
- `words.json` — los tiempos de cada palabra de la voz (el ejemplo trae los de un guion de muestra).

## Cómo hacer un video nuevo con una plantilla
1. Copia la carpeta a tu proyecto, por ejemplo `proyectos/mi-caricatura/` (esa carpeta no se sube a git).
2. Pon tu voz en `assets/vo.wav` (grabada o clonada, ver `docs/07-voz-clonada.md`).
3. Saca los tiempos de las palabras:
   `~/.claude/skills/video-edit/.venv/bin/python ../../scripts/transcribir.py assets/vo.wav --salida .`
   y convierte el resultado a `words.json` (Claude lo hace: lista de `{"text","start","end"}`; `caricatura-retro`
   usa las claves `s` y `e`).
4. Pídele a Claude que reescriba `GROUPS` (textos), escenas y efectos en `build.py` según tu guion.
5. `python3 build.py` → `index.html`. Revisa con `npm run dev` (vista previa) y renderiza con `npm run render`.
   Los efectos de sonido están en `assets/sfx/` (los copia `install.sh`).
   La duración y `data-duration` del audio están escritas en `build.py` (FRAMES / DUR): cámbialas al largo de tu voz.

## Cambiar el personaje a la marca de tu cliente
- **Colores:** al inicio de `character.js` hay un objeto `C = { skin, hair, blazer, ... }`. Cambia esos hex por los
  colores de la marca (ropa con el color principal, accesorios con el de acento). Nada más se toca.
- **Peinado / accesorios:** pídele a Claude "cambia el pelo a corto y rizado" o "quítale los lentes"; las piezas
  están separadas por funciones con nombre (pelo, lentes, aretes...).
- **Que se parezca a una persona real:** solo con su permiso. Pasa una foto de referencia a Claude y pide que adapte
  colores de piel, pelo y ropa; mantén el estilo plano para que se pueda animar.
- **Ver todas las poses:** en `caricatura-retro/` corre `python3 rig-showcase/gen_index.py` y luego
  `cd rig-showcase && npm run dev`: un video de 12 s con cada expresión y pose.
- **Tipografías:** las 2 de la casa (Inter Tight + DM Serif Display) ya están en `assets/fonts/` (licencia OFL).

Reglas que también aplican aquí: texto arriba (y 260-700), personaje abajo-centro, nada importante debajo de
y = 1470 (zona de Instagram) salvo el cuerpo del personaje, letras de color en neón con contorno.
