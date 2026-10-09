# Avisos de licencia y origen

## Qué es nuestro (incluido en este repo)
Todo lo que está en `remotion/src`, `cartoon/`, `scripts/`, `docs/`, `install.sh`, `install.ps1`, `CLAUDE.md`,
`overlay/video-edit/scripts/find_errors.py`, `overlay/video-edit/scripts/track_crop.py` y los textos de
`overlay/video-edit/references/styles/*.md` fue escrito por el equipo dueño de este repositorio.

## Terceros que NO están copiados aquí
| Componente | Origen | Cómo llega a tu compu |
|---|---|---|
| Skill **video-edit** | https://github.com/tenfoldmarc/video-edit-skill (sin archivo de licencia publicado) | `install.sh` lo clona de su repositorio |
| Skill **video-pizarra** | https://github.com/santmun/video-pizarra (sin archivo de licencia publicado) | `install.sh` lo clona de su repositorio |
| Efectos de sonido | Pixabay Content License (vía el proyecto HyperFrames) | los descarga el setup de video-edit; `install.sh` los copia localmente |
| Remotion | https://www.remotion.dev — licencia propia: gratis para personas y empresas de hasta 3 personas; empresas más grandes necesitan licencia | `npm install` |
| HyperFrames | https://github.com/heygen-com/hyperframes | `npx` (lo usa video-edit) |
| GSAP | https://gsap.com (licencia de GSAP, gratuita) | se carga desde CDN en los HTML de `cartoon/` |

`patches/video-edit.patch` contiene solo NUESTROS cambios a archivos de video-edit (más unas líneas de contexto
para poder aplicarlo). `examples/talking-head/build.py.patch` es igual: diferencias contra la plantilla del skill.

## Fuentes incluidas
`remotion/public/fonts/` y `cartoon/*/assets/fonts/`: Inter Tight y DM Serif Display, de Google Fonts, bajo la
SIL Open Font License 1.1 (texto completo en `OFL.txt`). Se pueden usar, modificar y redistribuir, sin venderlas solas.

## Contenido excluido a propósito
No se incluyen videos, fotos, voces, música, transcripciones con nombres, ni datos de clientes. Las imágenes de
referencia de los estilos tampoco (eran cuadros de reels de otros creadores).
