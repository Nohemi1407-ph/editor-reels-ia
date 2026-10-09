# 4. Estilos guardados

Un estilo es una "receta" escrita a partir de un reel de referencia que le gustó al cliente. Viven en
`~/.claude/skills/video-edit/references/styles/<nombre>.md` (el instalador los copia desde
`overlay/video-edit/references/styles/`). Las reglas de la casa siguen aplicando encima de cualquier estilo.

Para usarlo: **"edítalo con estilo Marca 2"**.

| Estilo | Para qué sirve | Rasgos |
|---|---|---|
| **Marca personal 1** (`marca-personal-1`) | marca personal rápida, conversacional | frase corta en una línea + palabra clave grande debajo (neón lima o rojo), tarjetas blancas de papel cuadriculado, blanco y negro en frases fuertes, B-roll, cortes cada 1-2 s, y siempre animaciones |
| **Video viral** (`video-viral`) | humor, sketches, POV, conversaciones | video en una ventana sobre negro, título fijo "POV: ..." todo el video, subtítulos con un color por persona, "Risas*", final en blanco y negro con emoji grande, pocos cortes, sin animaciones |
| **Marca 2** (`marca-2`) | videos tipo lista (3 tips, 3 errores) | parte de abajo que se funde a negro, subtítulo blanco con brillo + palabra en cursiva dorada/naranja neón, números 3D que vuelan por cada tip, tarjetas con ícono colgando de una línea de luz, partes en blanco y negro |
| **Marca 3** (`marca-3`) | explicador limpio tipo agencia/Apple | alterna la persona con un lienzo blanco con curvas negras: el video dentro de un celular, listas con X/✓, celulares inclinados conectados a un ícono, CTA gigante '"PALABRA"' en neón |

Las imágenes de referencia NO vienen en el repo (son cuadros del reel de otra persona). Cada archivo trae el
link del reel original para volver a generarlas si quieres.

## Crear un estilo nuevo
1. Consigue 1 a 3 reels de referencia que le gusten al cliente.
2. Descárgalos (solo para estudiarlos, nunca para republicarlos):
   - Con Apify: crea una cuenta gratis en apify.com, copia tu token y en la Terminal:
     ```bash
     export APIFY_TOKEN="tu_token"
     python3 scripts/descargar_reel_apify.py https://www.instagram.com/reel/XXXXXXX/
     ```
     (usa el actor `apify/instagram-scraper` con `directUrls`; devuelve un `videoUrl`). Si tienes Apify conectado
     en Claude, pídeselo directo. Instagram bloquea la navegación sin sesión, por eso no sirve abrir la página.
   - O descárgalo tú desde el celular y pásalo a la compu.
3. Haz la hoja de contacto: `python3 scripts/hoja_contacto.py referencias/XXXX.mp4`.
4. Pídele a Claude: *"Estudia este reel de referencia y crea el estilo 'Mi marca 4'. Lo que me gusta es ..."*.
   Claude revisa cuadro por cuadro (tipografía, colores, posición de textos, ritmo de cortes, transiciones,
   sonido) y escribe `references/styles/mi-marca-4.md`, traduciendo todo a las reglas de la casa.
5. Pruébalo con un video y ajusta el archivo con los comentarios del cliente.

Consejo: copia también el `.md` nuevo a `overlay/video-edit/references/styles/` de tu copia del repo, así no se
pierde si reinstalas.
