# Editor de Reels con IA 🎬

Un sistema para editar videos cortos (Reels, TikTok, Shorts) **hablándole a Claude Code en español**.
Le das tus clips y le dices qué quieres; Claude corta los errores, pone subtítulos, animaciones, sonido y te
entrega el video listo para publicar.

Es el mismo sistema que usamos con clientes reales, empaquetado para que tú lo instales y obtengas la misma calidad.

## Qué videos puedes hacer

| Tipo | Ejemplo | Guía |
|---|---|---|
| **Persona hablando a cámara** | reel de marca personal o de negocio, con subtítulos, tarjetas animadas y botón de CTA | [docs/03](docs/03-flujo-talking-head.md) |
| **Producto para TikTok** | TikTok Shop / afiliados: gancho, subtítulos palabra por palabra, flechas al producto, carrito naranja | [docs/05](docs/05-tiktok-producto.md) |
| **Testimonios** | las mejores frases de llamadas de Zoom en tarjetas animadas | [docs/06](docs/06-testimonios.md) |
| **Pizarra** | video explicativo dibujado a mano con mascota | [docs/08](docs/08-pizarra-y-caricatura.md) |
| **Caricatura** | personaje animado que habla con tu voz (o voz clonada con permiso) | [docs/08](docs/08-pizarra-y-caricatura.md) |

Además: **estilos guardados** ("edítalo con estilo Marca 2") → [docs/04](docs/04-estilos.md).

## Requisitos
- Mac (Intel o Apple Silicon) o Linux. Windows: con WSL (recomendado) o `install.ps1`.
- [Claude Code](https://claude.com/claude-code) con sesión iniciada.
- git, ffmpeg, Node.js 22+, Python 3.10+ (el instalador te dice cómo instalar lo que falte).
- ~10 GB libres.

## Instalación en 3 pasos
```bash
git clone https://github.com/Nohemi1407-ph/editor-reels-ia ~/editor-reels-ia      # 1. descargar
cd ~/editor-reels-ia && bash install.sh              # 2. instalar (se puede repetir sin problema)
claude                                               # 3. abrir Claude Code aquí y pedir tu video
```
Detalles y problemas: [docs/01-instalacion.md](docs/01-instalacion.md).

## Cómo pedirle cada video a Claude
- **Reel hablando:** `/video-edit Edita los clips que dejé en Descargas. Es un reel para Instagram de mi taller. CTA: "toca el link para agendar".`
- **Con estilo:** `/video-edit Edita este video con estilo Marca personal 1.`
- **TikTok de producto:** `Edita este video de producto para TikTok Shop con la receta de TikTok. No inventes descuentos.`
- **Testimonios:** `Transcribe los videos de la carpeta testimonios y propón las 8 frases más motivadoras.`
- **Pizarra:** `Hazme un video pizarra de 60 segundos sobre el interés compuesto, vertical.`
- **Caricatura:** `Haz una caricatura de 45 segundos con la plantilla caricatura-retro y esta voz. Primero el storyboard.`

Más frases para copiar y pegar: [docs/prompts-ejemplo.md](docs/prompts-ejemplo.md).

## Qué hay en esta carpeta
```
CLAUDE.md            instrucciones que Claude lee solo al abrir esta carpeta (reglas de la casa)
install.sh/.ps1      instalador
patches/             nuestras mejoras al skill video-edit (español, pasada de errores, arreglos de ffmpeg)
overlay/video-edit/  archivos nuevos que se copian al skill (find_errors.py, track_crop.py, estilos)
remotion/            plantillas de motion graphics con Remotion (ReelTemplate + 3 ejemplos)
cartoon/             3 personajes de caricatura animables (HyperFrames)
scripts/             ayudantes: transcribir, recortar, hoja de contacto, audio final, copia para celular
examples/            un build.py real de referencia
docs/                guías paso a paso
```

## Las reglas de la casa (resumen)
Español · cortar errores primero · animaciones que explican lo que se dice · solo 2 tipografías (Inter Tight +
DM Serif Display) · colores neón con brillo · nada tapa la cara · CTA siempre abajo · letras grandes ·
volumen a −14 LUFS · **nunca inventar números**. Completas en [docs/02](docs/02-reglas-de-la-casa.md).

## Créditos
Este sistema se apoya en dos skills de otros autores. **No están copiados aquí**: el instalador los descarga
directamente de sus repositorios. Dales una estrella ⭐:
- **video-edit** de tenfoldmarc — https://github.com/tenfoldmarc/video-edit-skill
- **video-pizarra** de santmun (Horizontes IA) — https://github.com/santmun/video-pizarra

Y en herramientas abiertas: [HyperFrames](https://github.com/heygen-com/hyperframes),
[Remotion](https://www.remotion.dev), [faster-whisper](https://github.com/SYSTRAN/faster-whisper),
[FFmpeg](https://ffmpeg.org), [GSAP](https://gsap.com).

## Licencias y avisos importantes
- **Remotion** es gratis para personas, organizaciones sin fines de lucro y empresas de **hasta 3 personas**.
  Empresas más grandes necesitan comprar una licencia: https://www.remotion.dev/license
- Los skills de terceros tienen sus propios términos; se instalan desde sus repositorios originales. Nuestro
  parche solo contiene nuestros cambios.
- Las fuentes **Inter Tight** y **DM Serif Display** son de Google Fonts, licencia SIL Open Font License 1.1
  (ver `remotion/public/fonts/OFL.txt`).
- Los efectos de sonido son de Pixabay (se pueden usar en tus videos, no redistribuir sueltos): no vienen en el
  repo, los descarga el skill video-edit.
- **No se incluye música, ni videos, ni voces de clientes.** Usa solo material tuyo o con permiso y música con
  licencia. Clona una voz solo con permiso escrito de su dueña o dueño.
- Ver [NOTICE.md](NOTICE.md) para el detalle.
