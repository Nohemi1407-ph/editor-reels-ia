# 7. Voz clonada (videos narrados sin grabarse)

Para caricaturas, pizarras o explicadores, la narración puede hacerse con la voz clonada del cliente.

> **Solo con permiso explícito de la persona dueña de la voz.** Guarda ese permiso por escrito. Nunca clones la
> voz de alguien famoso ni de otra persona "de broma".

## Lo que funcionó: Higgsfield "Seed Audio" con referencia de voz
Se usa el modelo `seed_audio` de Higgsfield (conectado a Claude como conector/MCP) pasando una muestra de la voz
como referencia. No hace falta "guardar" la voz: en el plan básico no deja crear voces fijas, pero sí usar una
muestra como referencia en cada generación.

1. **Muestra de voz:** 1-3 minutos de la persona hablando sola, natural, sin música ni ruido (por ejemplo un
   tramo de un video de YouTube suyo). Recórtala con ffmpeg y guárdala como `.wav`.
2. **Súbela una vez** a Higgsfield (Claude lo hace: `media_upload`) y anota el `media_id` que devuelve en un
   archivo privado tuyo, **fuera de este repositorio** (no se comparte).
3. **Generar:** `generate_audio` con `model: seed_audio`, `medias: [{value: <media_id>, role: "audio_references"}]`,
   formato `wav`, 44100 Hz, y **`speech_rate: -12`** (la velocidad normal suena apurada).
   Costo aproximado: ~0.9 créditos por frase corta; un video de 60 s ≈ 6-8 créditos.

## Cómo escribir el texto para que suene natural
- **Todo el guion en UNA sola generación.** Por frases suena cortado y cambia el tono. Solo si falla por largo,
  partir en párrafos grandes.
- **Solo puntos.** Un punto al final de cada oración. Sin comas, sin puntos suspensivos, sin ¡! ni ¿?. Sin ningún
  punto suena corriendo; con muchas comas suena entrecortado.
- **Frases cortas.**
- **Truco del arranque:** los primeros segundos a veces no suenan como la persona. Empieza el texto con
  **"Bueno escucha."** y después recórtalo (o recorta 0.5-1 s del inicio). Escucha siempre el arranque.
- **Pronunciación:** evita siglas (escribe "Inteligencia Artificial", no "IA") y nombres que la voz dice mal
  (algunos nombres de estados o ciudades en inglés). Escribe números en palabras si los lee raro.
- No hagas que la voz diga el nombre de la persona ("soy ...") salvo que ella lo pida. Cierra con el CTA o
  "...y sígueme".

## Después de generar
Acorta solo las pausas largas (sin acelerar la voz) y nivela el volumen:
```bash
bash scripts/acortar_pausas_voz.sh voz.wav voz-lista.wav 1.2     # 1.2 = segundos a recortar ("Bueno escucha.")
```
(Por dentro: `silenceremove` deja las pausas de más de 0.75 s en 0.55 s, compresor y `loudnorm` a −14 LUFS.)
Luego transcribe la voz lista para tener `words.json` y sincronizar textos y personaje.

## Alternativas locales (sin pagar créditos)
Proyectos como VoiceStudio corren en tu computadora, pero necesitan PyTorch moderno. En **Mac Intel** PyTorch
llega solo hasta la versión 2.2.2, así que esos proyectos **no funcionan**. En Mac Apple Silicon o PC con
tarjeta NVIDIA sí se pueden probar.
