# 2. Reglas de la casa (aplican a TODOS los videos)

Estas reglas salen de las revisiones reales con clientes. Claude las lee de `CLAUDE.md` y del skill video-edit,
pero conviene que tú también las conozcas para revisar.

1. **Español.** Se transcribe con Whisper multilingüe y `language='es'`. Subtítulos en español.
2. **Primero los errores.** Justo después del primer armado se corre la pasada de errores (`find_errors.py`):
   pausas, muletillas (eh, este, o sea), palabras repetidas, frases reiniciadas y sílabas cortadas. Se cortan
   ANTES de poner textos o animaciones (si no, todo se desfasa). Las palabras DUDOSAS (mal pronunciadas) no se
   arreglan cortando: se le preguntan a la persona. Un pedacito de menos de 0.5 s se une a la toma de al lado.
3. **Motion graphics que explican lo que se dice.** Cada idea importante lleva una animación: números,
   resultados, el problema tachado, la oferta, el CTA. Y si en la toma hay algo (un tablero de ajedrez, una
   herramienta, un producto), la animación lo usa (una pieza que avanza en "avanzar", el rey que cae en "jaque mate").
4. **Solo 2 tipografías:** Inter Tight (todo lo de palo seco) + DM Serif Display (palabras de golpe en cursiva).
   Nada de Inter, Montserrat, Caveat, etc.
5. **Color = neón con brillo.** Lima `#C8FF00` (acento), rojo `#FF2D55` (alertas), verde `#39FF88` (éxito).
   Nunca colores pastel planos.
6. **Animaciones ADELANTE, en la parte de abajo** (pecho, mesa, piernas). **Nunca tapan la cara.** Si llegan a
   la cara: más pequeñas (×0.85) y más abajo, sin bajar de y = 1470. Detrás de la persona solo si lo piden.
7. **Botones de CTA siempre ABAJO** ("Toca el link", "Agendar llamada", flechas), justo encima de la zona de
   Instagram, cerca del link real. Si la cara está abajo (selfie), el botón va al lado libre y más pequeño (×0.6),
   no arriba.
8. **Selfie:** si la cara llena la mitad de abajo, el espacio libre es ARRIBA: animaciones en y 225-565 y el
   subtítulo en una píldora oscura justo debajo.
9. **Letras GRANDES** (en un video de 1080 de ancho): frase ≥ 64 px (peso 700), palabra clave ≥ 130 px, palabra
   de pantalla completa ≥ 250 px, botón ≥ 56 px. Si no cabe, se achica la animación, nunca la letra.
10. **Volumen parejo** al final: compresor + `loudnorm` a −14 LUFS (estándar de Instagram). Los efectos nunca
    más fuertes que la voz (volumen ≤ 0.3). Ver `09-audio.md`.
11. **El zoom no empuja la cara** hacia los textos: después de cambiar un zoom se revisa de nuevo la posición.
12. **Nunca inventar números.** Ni resultados, ni precios, ni "quedan 3", ni "50% de descuento". Solo datos que
    dijo la persona o que el cliente confirmó. Si falta un dato, se pregunta.
13. **Nunca usar la cara, voz o nombre de alguien sin permiso.** Testimonios solo con autorización.

## Zonas seguras (lo que tapa la app)
Video de 1080 × 1920:

| | Arriba | Abajo | Lados | Columna derecha (botones de like) |
|---|---|---|---|---|
| **Instagram Reels** | 220 px | 450 px (nada abajo de y = 1470) | 35 px | 100 px, desde y = 1155 |
| **TikTok** | 150 px | 480 px | — | 140 px, desde y = 700 |

Para revisar: el skill tiene `build.py --safe` (pinta la zona en rojo, solo para fotos de revisión) y la
plantilla de Remotion tiene `"safeGuide": true`.
