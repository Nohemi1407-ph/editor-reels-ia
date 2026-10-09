# 1. Instalación (una sola vez)

## Qué necesitas
- Una Mac (Intel o Apple Silicon) o Linux. En Windows mira la sección de abajo.
- **Claude Code** instalado y con sesión iniciada (https://claude.com/claude-code).
- Unos 10 GB libres (modelos de transcripción, Remotion, renders).
- Internet la primera vez.

Programas (el instalador te dice si falta alguno y el comando exacto para instalarlo):

| Programa | Para qué | Mac (con Homebrew) |
|---|---|---|
| git | descargar los skills | `brew install git` |
| ffmpeg | cortar y unir video/audio | `brew install ffmpeg` |
| Node.js 22 o más nuevo | HyperFrames y Remotion | `brew install node` |
| Python 3.10 o más nuevo (mejor 3.11) | Whisper (transcribir) | `brew install python@3.11` |

¿No tienes Homebrew? Instálalo desde https://brew.sh (copias una línea en la Terminal).

## Los 3 pasos
```bash
# 1. Descarga este repositorio (o el link que te dio tu profesora)
git clone <link-del-repo> ~/editor-reels-ia

# 2. Entra a la carpeta y corre el instalador
cd ~/editor-reels-ia
bash install.sh            # si te falta algo y tienes Homebrew:  bash install.sh --con-brew

# 3. Abre Claude Code aquí y pide tu primer video
claude
```

El instalador se puede correr las veces que quieras: solo agrega lo que falta. La primera vez tarda (descarga
el modelo de Whisper y Remotion). Al final debe decir **TODO LISTO**.

## Qué instala y dónde
- `~/.claude/skills/video-edit` — skill de edición de reels (de tenfoldmarc), con nuestras mejoras encima.
- `~/.claude/skills/video-pizarra` — skill de videos pizarra/dibujo (de santmun).
- `remotion/node_modules` — Remotion para animaciones complejas.
- Efectos de sonido en `remotion/public/sfx` y `cartoon/*/assets/sfx`.

## Windows
Lo más fácil es usar **WSL** (Ubuntu dentro de Windows: `wsl --install` en PowerShell como administrador) y
seguir los pasos de Linux dentro de Ubuntu. También hay un `install.ps1` para PowerShell nativo
(`powershell -ExecutionPolicy Bypass -File install.ps1`), menos probado: instala con `winget` git, ffmpeg,
Node y Python si faltan.

## Actualizar
```bash
cd ~/editor-reels-ia && git pull && bash install.sh
```
