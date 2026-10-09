#!/usr/bin/env bash
# =============================================================================
#  editor-reels-ia — instalador (macOS y Linux)
#
#  Uso:   bash install.sh                 revisa e instala lo que falta (seguro, puedes repetirlo)
#         bash install.sh --con-brew      además instala con Homebrew lo que falte (ffmpeg, node, python)
#         bash install.sh --sin-npm       no corre "npm install" en remotion/ (si tienes mala conexión)
#         bash install.sh --sin-setup     no corre el setup de video-edit (paso 4)
#
#  Qué hace:
#   1. Revisa ffmpeg, Node 22+, Python 3.10+ y git (solo te dice cómo instalarlos, salvo --con-brew)
#   2. Instala los 2 skills de terceros en ~/.claude/skills clonándolos de GitHub (si no están):
#        video-edit    https://github.com/tenfoldmarc/video-edit-skill
#        video-pizarra https://github.com/santmun/video-pizarra
#   3. Aplica nuestras mejoras a video-edit (patches/video-edit.patch) y copia nuestros archivos nuevos
#      (find_errors.py, track_crop.py y la librería de estilos)
#   4. Corre el setup del skill video-edit (crea su Python con Whisper y baja los efectos de sonido)
#   5. Copia esos efectos de sonido a remotion/public/sfx y a las plantillas de caricatura
#   6. Instala Remotion (npm install dentro de remotion/)
#  No borra nada tuyo. No sube nada a internet.
# =============================================================================
set -u

REPO="$(cd "$(dirname "$0")" && pwd)"
SKILLS="$HOME/.claude/skills"
VE="$SKILLS/video-edit"
VP="$SKILLS/video-pizarra"
VE_URL="https://github.com/tenfoldmarc/video-edit-skill"
VP_URL="https://github.com/santmun/video-pizarra"
# versiones con las que se probó este repo (el parche está hecho contra esta versión de video-edit)
VE_COMMIT="410c46eeb9d19f173650697bd581745235363038"
VP_COMMIT="dc6adc4198027f26c60f5980c956e0a678e05aed"

CON_BREW=0; SIN_NPM=0; SIN_SETUP=0
for a in "$@"; do
  case "$a" in
    --con-brew) CON_BREW=1 ;;
    --sin-npm) SIN_NPM=1 ;;
    --sin-setup) SIN_SETUP=1 ;;
    -h|--help) sed -n 2,23p "$0"; exit 0 ;;
    *) echo "Opción desconocida: $a"; exit 1 ;;
  esac
done

ok()   { printf "  \033[32m✔\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$1"; }
bad()  { printf "  \033[31m✘\033[0m %s\n" "$1"; }
step() { printf "\n\033[1m%s\033[0m\n" "$1"; }
FALTA=0

OS="$(uname -s)"
have() { command -v "$1" >/dev/null 2>&1; }
brew_or_tell() {   # $1 = paquete brew, $2 = comando para Linux
  if [ "$OS" = "Darwin" ] && have brew && [ $CON_BREW -eq 1 ]; then
    echo "    instalando $1 con Homebrew..."; brew install "$1" && return 0
  fi
  if [ "$OS" = "Darwin" ]; then
    if have brew; then warn "Instálalo con:  brew install $1   (o vuelve a correr: bash install.sh --con-brew)"
    else warn "Primero instala Homebrew (https://brew.sh) y luego:  brew install $1"; fi
  else
    warn "Instálalo con:  $2"
  fi
  FALTA=1; return 1
}

# ----------------------------------------------------------------------------- 1. requisitos
step "1/6  Revisando programas necesarios"
if have git; then ok "git"; else bad "Falta git"; brew_or_tell git "sudo apt install git"; fi

if have ffmpeg && have ffprobe; then ok "ffmpeg"; else bad "Falta ffmpeg"; brew_or_tell ffmpeg "sudo apt install ffmpeg"; fi

NODE_OK=0
if have node; then
  NV="$(node -v | sed 's/^v//; s/\..*//')"
  if [ "${NV:-0}" -ge 22 ] 2>/dev/null; then ok "Node $(node -v)"; NODE_OK=1
  else bad "Node $(node -v) es viejo: hace falta Node 22 o más nuevo"; brew_or_tell node "instala Node 22 LTS de https://nodejs.org (o: nvm install 22)"; fi
else bad "Falta Node.js"; brew_or_tell node "instala Node 22 LTS de https://nodejs.org (o: nvm install 22)"; fi

PY=""
for c in python3.12 python3.11 python3.10 python3 python; do
  if have "$c" && "$c" -c 'import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)' 2>/dev/null; then PY="$c"; break; fi
done
if [ -n "$PY" ]; then ok "Python $($PY -c 'import platform; print(platform.python_version())')"
else bad "Falta Python 3.10 o más nuevo"; brew_or_tell python@3.11 "sudo apt install python3 python3-venv"; fi

if [ $FALTA -eq 1 ] && { ! have git || [ -z "$PY" ]; }; then
  echo; bad "Instala lo que falta (arriba están los comandos) y vuelve a correr:  bash install.sh"; exit 1
fi

# ----------------------------------------------------------------------------- 2. skills de terceros
step "2/6  Skills de terceros en $SKILLS"
mkdir -p "$SKILLS"
clone_pinned() {  # $1 url, $2 dir, $3 commit
  git clone --quiet "$1" "$2" || return 1
  git -C "$2" -c advice.detachedHead=false checkout --quiet "$3" 2>/dev/null \
    || warn "No encontré la versión probada de $(basename "$2"); se queda en la última versión"
  return 0
}
if [ -d "$VE/.git" ]; then ok "video-edit ya estaba instalado"
elif [ -e "$VE" ]; then bad "$VE existe pero no es un repositorio git: renómbralo y vuelve a correr el instalador"; exit 1
else echo "    clonando video-edit..."; clone_pinned "$VE_URL" "$VE" "$VE_COMMIT" && ok "video-edit instalado" || { bad "No pude clonar $VE_URL"; exit 1; }; fi

if [ -d "$VP/.git" ] || [ -f "$VP/SKILL.md" ]; then ok "video-pizarra ya estaba instalado"
else echo "    clonando video-pizarra..."; clone_pinned "$VP_URL" "$VP" "$VP_COMMIT" && ok "video-pizarra instalado" || warn "No pude clonar $VP_URL (los videos pizarra no estarán disponibles)"; fi

# ----------------------------------------------------------------------------- 3. nuestras mejoras
step "3/6  Aplicando nuestras mejoras a video-edit"
PATCH="$REPO/patches/video-edit.patch"
if git -C "$VE" apply --reverse --check "$PATCH" >/dev/null 2>&1; then
  ok "El parche ya estaba aplicado"
elif git -C "$VE" apply --check "$PATCH" >/dev/null 2>&1; then
  git -C "$VE" apply "$PATCH" && ok "Parche aplicado (español, pasada de errores, reglas de la casa, arreglos de ffmpeg)"
else
  warn "El parche no aplica limpio (tu video-edit es de otra versión o lo modificaste)."
  warn "Para dejarlo como se probó:  git -C \"$VE\" stash && git -C \"$VE\" checkout $VE_COMMIT  y vuelve a correr el instalador"
  FALTA=1
fi
cp -R "$REPO/overlay/video-edit/." "$VE/" && ok "Copiados find_errors.py, track_crop.py y references/styles/"

# ----------------------------------------------------------------------------- 4. setup del skill
step "4/6  Preparando video-edit (Whisper, efectos de sonido) — la primera vez tarda varios minutos"
if [ $SIN_SETUP -eq 1 ]; then warn "Saltado (--sin-setup)"
elif [ -n "$PY" ]; then
  if "$PY" "$VE/scripts/setup.py"; then ok "video-edit listo"
  else warn "El setup de video-edit dijo NOT READY: lee arriba qué falta, instálalo y vuelve a correr"; FALTA=1; fi
fi

# ----------------------------------------------------------------------------- 5. efectos de sonido
step "5/6  Efectos de sonido"
SFX_SRC="$VE/assets/template/assets/sfx"
if ls "$SFX_SRC"/*.mp3 >/dev/null 2>&1; then
  for d in "$REPO/remotion/public/sfx" "$REPO/cartoon/nina/assets/sfx" "$REPO/cartoon/caricatura-retro/assets/sfx"; do
    mkdir -p "$d"; cp "$SFX_SRC"/*.mp3 "$d/"
  done
  ok "Copiados a remotion/public/sfx y a cartoon/*/assets/sfx (no se suben a git: licencia de Pixabay)"
else
  warn "Todavía no hay efectos en $SFX_SRC (los baja el setup del paso 4). Vuelve a correr el instalador después."
fi

# ----------------------------------------------------------------------------- 6. remotion
step "6/6  Remotion"
if [ $SIN_NPM -eq 1 ]; then warn "Saltado (--sin-npm). Cuando quieras:  cd remotion && npm install"
elif [ $NODE_OK -eq 1 ] && have npm; then
  if [ -d "$REPO/remotion/node_modules/remotion" ]; then ok "Remotion ya estaba instalado"
  else (cd "$REPO/remotion" && npm install --no-fund --no-audit) && ok "Remotion instalado" || { warn "npm install falló: revisa tu conexión y repite"; FALTA=1; }; fi
else warn "Sin Node 22+ no se puede instalar Remotion todavía"; fi

echo
if [ $FALTA -eq 0 ]; then
  printf "\033[32m\033[1mTODO LISTO.\033[0m Abre Claude Code en esta carpeta (cd \"%s\" && claude) y pide tu video.\n" "$REPO"
  echo "Frases de ejemplo: docs/prompts-ejemplo.md"
else
  printf "\033[33m\033[1mCASI LISTO.\033[0m Arregla los avisos marcados con ! y vuelve a correr:  bash install.sh\n"
fi
