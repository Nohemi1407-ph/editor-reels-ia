# Ejemplos

## talking-head/build.py.patch
El `build.py` (HyperFrames) de un reel real: selfie de un taller de reparación de lavadoras y secadoras, en
español, con subtítulos en píldora, palabras neón, tarjetas animadas abajo y botón "Toca el link".

Está guardado como **diferencias** contra la plantilla del skill video-edit, porque esa plantilla es de su autor
y no la podemos redistribuir entera. Para obtener el archivo completo (después de `bash install.sh`):

```bash
patch -o build.py ~/.claude/skills/video-edit/assets/template/build.py examples/talking-head/build.py.patch
```

Úsalo como referencia de cómo se adapta la plantilla: qué se dejó (la maquinaria: cortes desde
`segments.json`, `S(t)`, guía de zona segura `--safe`, audio) y qué se reescribió (grupos de texto, tarjetas,
tiempos). No trae los videos ni los `segments.json`/`words.json` del cliente.
