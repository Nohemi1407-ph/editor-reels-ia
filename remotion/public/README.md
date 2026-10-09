# public/ — aquí van TUS archivos

Remotion solo puede usar archivos que estén dentro de esta carpeta. Nada de esto se sube a git.

| Carpeta | Qué poner | Lo usa |
|---|---|---|
| `fonts/` | Ya viene con Inter Tight y DM Serif Display (licencia OFL) | todas |
| `sfx/` | Efectos de sonido: los copia `install.sh` desde el skill video-edit | todas |
| `mi-reel/` (el nombre que quieras) | tu `aroll.mp4` (vertical 1080x1920) y, si quieres, `music.mp3` con licencia | `ReelTemplate` (pon la ruta en `reel.json`: `"video": "mi-reel/aroll.mp4"`) |
| `ejemplo-taller/aroll.mp4` | un talking head de ~30 s | `EjemploTaller` |
| `ejemplo-tiktok/aroll.mp4` + `music.mp3` | video de producto ~20 s | `EjemploTikTok` |
| `ejemplo-testimonios/<id>.mp4` + `pizarra.mp4` + `music.mp3` | clips de testimonios (ids en `src/ejemplo-testimonios/data.ts`) | `EjemploTestimonios` |

Los ejemplos se publicaron SIN sus videos originales (eran de clientes). Sirven para leer el código y copiar ideas;
para verlos en movimiento pon videos tuyos con esos nombres.
