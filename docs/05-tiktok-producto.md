# 5. Video de producto para TikTok (TikTok Shop / afiliados)

La persona muestra un producto y lo recomienda. Ejemplo listo para leer: composición **EjemploTikTok** en
`remotion/src/ejemplo-tiktok/`.

## La receta
1. **Gancho primero (0-2 s).** Lo más fuerte va al principio: título enorme que "golpea" ("NECESITAS ESTO") con
   una etiqueta tipo sticker ("PRODUCTO VIRAL") y un zoom rápido al producto. Si en el video crudo el gancho está
   en medio, se mueve al inicio.
2. **Ritmo 1.1x.** Se acelera todo el video un 10 % (`atempo=1.1` en el audio): suena natural y retiene más.
   `bash scripts/terminar_audio.sh video.mp4 final.mp4 --tiktok` lo hace junto con el audio final.
3. **Subtítulos palabra por palabra**, en MAYÚSCULAS, gruesos con contorno negro, centrados, y las palabras clave
   en color neón (naranja, lima, rojo para lo negativo). Cada palabra aparece cuando se dice.
4. **Señalar el producto.** Cuando se nombra una característica ("tiene trípode", "tres intensidades"), una flecha
   curva se dibuja desde una etiqueta con emoji hasta esa parte del producto.
5. **Emojis que saltan** en momentos clave (🔥, ⚡, 😱), pequeños y sin tapar el producto.
6. **CTA del carrito naranja** al final: botón naranja con 🛒 "Toca el carrito naranja", una mano 👆 que lo toca y
   un efecto de click. Va abajo, respetando la zona segura de TikTok.
7. **Transiciones en los cortes:** alternar zoom de golpe y barrido (whip), con un destello corto.
8. **Música baja** (volumen ~0.06-0.1, solo con licencia) para que la voz mande.

## Reglas importantes
- **Nunca inventar urgencia ni números:** nada de "quedan 5", "50 % OFF", "solo hoy", "+10 000 vendidos" si la
  persona no lo dijo o el cliente no lo confirmó. Una etiqueta "SE AGOTA" solo si se dijo en el video.
- Zona segura de TikTok: 150 px arriba, 480 px abajo y una columna de 140 px a la derecha desde y = 700
  (botones de like/comentar). Los subtítulos se centran un poco a la izquierda para no chocar.
- El producto debe verse: los textos nunca encima del producto.

## Cómo pedirlo
> Edita este video de producto para TikTok Shop con la receta de TikTok: gancho al inicio, 1.1x, subtítulos
> palabra por palabra, flechas a las características y CTA del carrito naranja. No inventes descuentos.
