# Instrucciones para Claude Code — editor-reels-ia

Este repositorio es un sistema de edición de reels verticales para personas que hablan español y, en su mayoría,
no son técnicas. Lo usan estudiantes para editar videos propios y de sus clientes.

## Cómo hablar con la persona
- **Responde SIEMPRE en español**, simple, sin jerga técnica. Si tienes que usar un término (EDL, LUFS, render),
  explícalo en media línea la primera vez.
- Muestra resultados con frases cortas y listas. Cuando algo necesita su decisión (una palabra dudosa, un dato
  que falta, una toma), pregúntalo claramente con opciones.
- Antes de un render largo, di cuánto puede tardar.

## Dónde está cada cosa
- `~/.claude/skills/video-edit` — skill principal para reels de persona hablando (`/video-edit`). Ya tiene
  nuestro parche: transcripción en español, `find_errors.py`, `track_crop.py`, reglas de la casa y estilos en
  `references/styles/`. Sigue su `SKILL.md`.
- `~/.claude/skills/video-pizarra` — videos pizarra/dibujo animado. Sigue su `SKILL.md`.
- `remotion/` — Remotion 4 (React). `ReelTemplate` (plantilla con props en `src/reel-template/reel.json`) y
  ejemplos `EjemploTaller`, `EjemploTikTok`, `EjemploTestimonios`. Código compartido en `src/kit/`.
  Medios en `remotion/public/<proyecto>/`.
- `cartoon/` — personajes de caricatura HyperFrames (`nina`, `caricatura-retro`); ver su README.
- `scripts/` — transcribir videos largos, re-transcribir un trozo, hoja de contacto, recortar participante de
  Zoom, audio final, acortar pausas de voz, copia para celular, descargar reel con Apify.
- `docs/` — guías en español por tipo de video. Léelas cuando la persona pida ese tipo de video.
- Proyectos de trabajo: en `proyectos/<nombre>/` dentro de este repo (está en .gitignore) o donde el skill indique.
  Nunca guardes videos, voces o música del cliente dentro de carpetas que se suben a git.
- Python con faster-whisper: `~/.claude/skills/video-edit/.venv/bin/python`.

## Reglas de la casa (TODOS los videos; no las vuelvas a discutir)
1. **Español:** Whisper multilingüe con `language='es'`; subtítulos en español.
2. **Errores primero:** después del primer armado corre `find_errors.py <proyecto> --lang es`, muestra la lista en
   palabras simples, corta PAUSA / MULETILLA / REPETIDA / CORTADA y repite hasta que solo queden DUDOSAS (esas se
   le preguntan a la persona). Todo esto ANTES de poner subtítulos o animaciones. Pedazos < 0.5 s se unen a la toma vecina.
3. **Motion graphics que explican** cada idea clave (números, resultados, problema tachado, oferta, CTA) y que usan
   lo que hay físicamente en la toma. Inserts con sub-agentes en paralelo; Remotion para los complejos.
4. **Solo 2 tipografías:** Inter Tight (todo el palo seco) + DM Serif Display (palabras de golpe). Dilo en cada brief.
5. **Color = neón con brillo:** lima `#C8FF00`, rojo `#FF2D55`, verde `#39FF88`. Nunca pastel plano.
6. **Animaciones adelante y en la banda baja; nunca sobre la cara.** Si llegan a la cara: ×0.85 y más abajo (sin
   pasar y = 1470). Detrás de la persona solo si lo piden.
7. **CTA siempre abajo**, justo encima de y = 1470. Con la cara abajo (selfie): al lado libre y ×0.6, no arriba.
8. **Selfie:** inserts en y 225-565 y subtítulo en píldora oscura debajo.
9. **Letras grandes:** frase ≥ 64 px (700), clave ≥ 130 px, pantalla completa ≥ 250 px, botón ≥ 56 px. Se achica
   el insert, nunca la letra.
10. **Audio final:** `scripts/terminar_audio.sh` (highpass, afftdn, compresor, loudnorm −14 LUFS, limitador). SFX ≤ 0.3.
11. **Zoom:** tras cambiarlo, vuelve a correr `headpos.py` y revisa fotos.
12. **NUNCA inventes números, precios, descuentos, stock, urgencia, resultados ni testimonios.** Solo lo que la
    persona dijo o confirmó. Si falta, pregunta.
13. **Permisos:** caras, voces y nombres de terceros solo con permiso. Voz clonada solo con permiso de su dueño.
    Las referencias de otros creadores se estudian, nunca se reutiliza su material.

## Zonas seguras (1080 × 1920)
- **Instagram:** arriba 220, abajo 450 (nada importante debajo de y = 1470), lados 35, columna derecha 100 desde y = 1155.
- **TikTok:** arriba 150, abajo 480, columna derecha 140 desde y = 700.
Revisa siempre con fotos marcadas (`build.py --safe` o `"safeGuide": true` en ReelTemplate) antes del render.

## Flujos por tipo de video
- **Persona hablando:** `/video-edit` → ingest → mejores tomas → assemble → **find_errors** → transcribe_cut →
  cutout + headpos → inserts en paralelo → build → fotos con zona segura → render → terminar_audio → copia celular.
  Si piden "estilo X", lee `references/styles/<x>.md` antes de construir. Guía: `docs/03`.
- **TikTok producto:** gancho primero, 1.1x, subtítulos palabra por palabra en mayúsculas con palabras neón,
  flechas a las características, CTA del carrito naranja abajo, zona segura de TikTok. Guía: `docs/05`.
- **Testimonios:** `scripts/transcribir.py` → proponer frases → `retranscribir_trozo.py` → recortar el cuadro de
  la persona → tarjetas en Remotion (base `EjemploTestimonios`). Guía: `docs/06`.
- **Voz clonada:** Higgsfield `seed_audio` con la muestra como `audio_references`, `speech_rate -12`, guion entero
  en una toma, solo puntos, empezar con "Bueno escucha." y recortarlo, sin siglas. Luego
  `scripts/acortar_pausas_voz.sh`. Nunca escribas IDs de medios ni claves en archivos del repo. Guía: `docs/07`.
- **Pizarra:** skill video-pizarra. **Caricatura:** plantillas de `cartoon/`. Guía: `docs/08`.
- **Nuevo estilo:** descargar referencia (Apify `apify/instagram-scraper` con `directUrls`), hoja de contacto,
  estudiar cuadro por cuadro, preguntar qué le gusta, escribir `references/styles/<nombre>.md`. Guía: `docs/04`.

## Trampas conocidas
Concat con FILTRO, no demuxer · `setsar=1` · tamaño según rotación del celular · `-/filter_complex archivo` para
filtros largos en ffmpeg nuevo · `cutout.py` de a uno (1.5 GB RAM) · Mac Intel: PyTorch ≤ 2.2.2 (sin clonadores de
voz locales) · Instagram sin sesión bloquea páginas (usar Apify). Más en `docs/10-problemas-comunes.md`.

## Al terminar un video
Entrega: ruta del render final, la copia para celular, y un resumen de 3-5 líneas (duración, estilo, qué se cortó,
qué decisiones quedan pendientes). Sugiere un caption solo si lo piden.
