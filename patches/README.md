# patches/

`video-edit.patch` = nuestras modificaciones al skill video-edit (versión 410c46e). `install.sh` lo aplica solo.

Qué cambia:
- `SKILL.md`: paso "pasada de errores" (find_errors.py), reglas de la casa y estilos guardados.
- `scripts/ingest.py` y `scripts/transcribe_cut.py`: Whisper multilingüe con `language='es'`.
- `scripts/assemble.py`: tamaño según rotación del celular, `setsar=1`, sin metadatos extra y unión con el filtro
  `concat` (el demuxer perdía cuadros).
- `scripts/headpos.py`: no falla si la cabeza está girada/cortada.

Los archivos NUEVOS están en `overlay/video-edit/` (se copian tal cual).

A mano:
```bash
git -C ~/.claude/skills/video-edit apply --check ~/editor-reels-ia/patches/video-edit.patch   # ¿aplica?
git -C ~/.claude/skills/video-edit apply ~/editor-reels-ia/patches/video-edit.patch           # aplicar
git -C ~/.claude/skills/video-edit apply -R ~/editor-reels-ia/patches/video-edit.patch        # deshacer
```
Para actualizar el parche después de mejorar el skill: `git -C ~/.claude/skills/video-edit diff > patches/video-edit.patch`
(y revisa que no queden nombres de clientes ni rutas personales).
