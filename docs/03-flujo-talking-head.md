# 3. Reel de persona hablando a cámara (talking head)

Es el video más común: la persona graba con el celular en vertical y Claude lo deja listo con cortes, subtítulos,
animaciones y sonido. Usa el skill **video-edit** (con nuestras mejoras).

## Antes de grabar (pásale esto a tu cliente)
- Vertical 9:16, en 4K si se puede (permite hacer zoom sin perder calidad).
- Luz de frente, fondo despejado, micrófono de solapa si hay.
- Puede repetir frases que le salieron mal: Claude elige la mejor toma de cada frase.
- Dejar 1 segundo quieto al inicio y al final.

## Cómo pedirlo
Pon los clips en una carpeta (por ejemplo Descargas) y en Claude Code escribe:

> /video-edit Edita los 3 clips que dejé en Descargas. Es un reel para Instagram de un taller de reparación.
> CTA: "toca el link para agendar".

Con estilo guardado: *"edítalo con estilo Marca 2"* (ver `04-estilos.md`).

## Qué hace Claude, paso a paso
1. **Ingesta** (`ingest.py`): copia los clips al proyecto, transcribe en español y arma hojas de contacto.
2. **Elige las mejores tomas** de cada frase y arma el corte (`edl.json`).
3. **Armado** (`assemble.py`): un solo `aroll.mp4` limpio a 30 fps + `segments.json` con los cortes exactos.
4. **Pasada de errores** (`find_errors.py --lang es`): te muestra en palabras simples las pausas, muletillas y
   repeticiones; las corta y repite hasta que solo quedan palabras DUDOSAS, que te pregunta a ti.
5. **Transcripción final** (`transcribe_cut.py`) → `words.json` con el tiempo de cada palabra.
6. **Recorte de la persona** (`cutout.py`, tarda: ~1.5 GB de RAM) y posición de la cabeza (`headpos.py`) para saber
   dónde NO poner cosas.
7. **Animaciones en paralelo**: varios sub-agentes construyen las tarjetas animadas al mismo tiempo.
8. **Construcción** (`build.py` → `index.html`), fotos de revisión con la zona segura, y render con HyperFrames.
9. **Audio final** (`scripts/terminar_audio.sh`) y copia para el celular (`scripts/exportar_celular.sh`).

## Seguir a la persona si se mueve
`track_crop.py` hace un recorte que sigue suavemente a la persona principal (gimnasio, cámara en mano, el
estilo "Video viral" en ventana):
```
PY ~/.claude/skills/video-edit/scripts/track_crop.py <proyecto> ventana.mp4 --w 900 --h 810
```

## Animaciones muy complejas: Remotion
Si una animación es difícil en HyperFrames (gráficas con datos, muchas piezas, transiciones), Claude puede
hacerla en `remotion/` y renderizarla como clip. Para empezar desde cero usa la composición **ReelTemplate**
(`remotion/README.md`).

## Revisión antes de entregar
- [ ] No hay pausas largas ni muletillas.
- [ ] Ninguna animación tapa la cara. Ningún texto cae en la zona de Instagram.
- [ ] Solo Inter Tight + DM Serif Display. Colores neón con brillo.
- [ ] Letras grandes. CTA abajo.
- [ ] Ningún número inventado.
- [ ] Volumen parejo; los efectos no tapan la voz.
