# 9. Audio: que suene profesional

## Cadena final de la voz (siempre al terminar)
```bash
bash scripts/terminar_audio.sh render.mp4            # crea render-final.mp4
```
Lo que hace, en orden:
1. `highpass=f=90` — quita retumbes y golpes de graves.
2. `afftdn=nf=-30:nr=12` — baja el ruido de fondo (suave, para que la voz no suene robótica).
3. `acompressor=threshold=-24dB:ratio=3:attack=10:release=200` — empareja partes bajitas y fuertes.
4. `loudnorm=I=-14:TP=-1.5:LRA=9` — volumen estándar de Instagram/TikTok (−14 LUFS).
5. `alimiter=limit=0.89` — evita que algo se sature.

El video se copia sin recodificar. Con `--tiktok` además acelera todo a 1.1x.

## Efectos de sonido
- Archivos: whoosh-short, pop, sparkle, click, click-soft, impact-bass-1 (Pixabay; los copia el instalador).
- Volumen entre 0.1 y 0.3: deben sentirse, no escucharse por encima de la voz.
- Un efecto por evento visual (aparece tarjeta = pop/whoosh, toque de botón = click, golpe de número = impact).
  No pongas efectos en cada palabra.

## Música
- Solo música con licencia para uso comercial (bibliotecas de pago, la biblioteca de la app al publicar, o música
  generada con un servicio que te dé derechos). **Este repo no trae música.**
- Volumen de fondo 0.06-0.1 bajo la voz; súbela un poco solo donde no hay voz (intro, final).
- Si publicas en Instagram/TikTok, otra opción es exportar sin música y agregar un audio de la app al publicar.

## Revisar el volumen
```bash
ffmpeg -i final.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
```
Más o menos: `mean_volume` entre −16 y −12 dB y `max_volume` por debajo de −1 dB.
