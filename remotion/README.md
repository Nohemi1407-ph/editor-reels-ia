# Remotion — motion graphics con código

Remotion arma videos con React. Aquí hay 4 composiciones de 1080x1920 a 30 fps:

- **ReelTemplate** — plantilla limpia: video + subtítulo en píldora con palabra neón + tarjetas animadas abajo +
  botón CTA abajo. Se maneja con `src/reel-template/reel.json` y funciona aunque todavía no tengas video.
- **EjemploTaller** — talking head selfie (taller de reparación) con 7 tarjetas animadas y subtítulos.
- **EjemploTikTok** — video de producto estilo TikTok Shop: gancho, subtítulos palabra por palabra, flechas que
  señalan el producto, botón del carrito naranja.
- **EjemploTestimonios** — tarjetas de testimonios recortadas de llamadas de Zoom + un video pizarra al final.

Los 3 ejemplos necesitan sus videos (ver `public/README.md`).

## Comandos (dentro de esta carpeta)
```bash
npm install                                   # una vez (install.sh ya lo hace)
npx remotion studio                           # abre el editor visual en el navegador
npx remotion compositions                     # lista las composiciones
npx remotion render ReelTemplate out/reel.mp4 --props=src/reel-template/reel.json
node stills.mjs ReelTemplate 0 90 200         # fotos sueltas para revisar sin renderizar todo
```
Después del render: `bash ../scripts/terminar_audio.sh out/reel.mp4` (volumen para Instagram).

## Código compartido
`src/kit/theme.ts` (colores neón, brillo, resortes) y `src/kit/fonts.ts` (carga las 2 tipografías).

## Licencia de Remotion
Remotion es gratis para personas, organizaciones sin fines de lucro y empresas de hasta 3 personas. Empresas más
grandes necesitan una licencia de empresa: https://www.remotion.dev/license
