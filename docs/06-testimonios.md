# 6. Video de testimonios (desde llamadas largas de Zoom)

Convierte horas de llamadas con alumnos o clientes en un reel de 30-60 s con sus mejores frases, en tarjetas
animadas. Ejemplo: composición **EjemploTestimonios** en `remotion/src/ejemplo-testimonios/`.

> **Permiso primero.** Solo usa la imagen y voz de personas que aceptaron aparecer en un testimonio.

## Paso a paso
1. **Junta los videos** (grabaciones de Zoom/Meet, videos de WhatsApp) en una carpeta, por ejemplo `testimonios/`.
2. **Transcribe todo** (puede tardar; empieza por los más cortos y se va guardando):
   ```bash
   ~/.claude/skills/video-edit/.venv/bin/python scripts/transcribir.py testimonios/ --salida transcripciones
   ```
   Deja un `.txt` legible con tiempos por cada video.
3. **Elige las frases.** Pídele a Claude: *"Lee las transcripciones y propón las 8 frases más motivadoras:
   cambios de vida, primeros resultados, 'yo no sabía nada y ahora...'. Dame archivo, minuto y frase exacta."*
   Tú eliges cuáles van. Busca frases cortas (2-5 s) y con emoción.
4. **Corta y vuelve a transcribir cada frase** con un modelo más exacto (para subtítulos perfectos):
   ```bash
   ~/.claude/skills/video-edit/.venv/bin/python scripts/retranscribir_trozo.py testimonios/llamada1.mp4 1656 1697 --nombre t1
   ```
5. **Recorta el cuadrito de la persona** (en Zoom aparecen varios). Mira un cuadro con
   `python3 scripts/hoja_contacto.py`, anota x, y, ancho y alto, deja fuera la etiqueta con el nombre:
   ```bash
   bash scripts/recortar_participante.sh testimonios/llamada1.mp4 1656 1697 958 272 950 508 t1_recorte.mp4
   ```
   (En Remotion también se puede recortar con el objeto `CROP` de `data.ts`, sin crear archivos nuevos.)
6. **Arma las tarjetas en Remotion.** Copia los clips a `remotion/public/<tu-proyecto>/` y pídele a Claude que
   adapte `ejemplo-testimonios/data.ts`: un clip por frase con sus subtítulos página por página, la palabra clave
   resaltada, una etiqueta "— Alumna" / "— Cliente" (o el nombre si la persona lo autorizó), y entradas
   alternadas (deslizar, rebote, corte) para que no se note el salto.
7. **Final opcional:** un video pizarra o caricatura que cierre con la oferta/CTA (ver `08-pizarra-y-caricatura.md`).
8. Render, audio final (`09-audio.md`) y copia para el celular.

## Consejos
- Corrige a mano lo que Whisper oyó mal (los nombres propios y marcas siempre).
- Música suave de fondo (con licencia) a volumen ~0.06-0.1.
- Nunca cambies lo que la persona dijo para que suene mejor: si una frase no sirve, elige otra.
