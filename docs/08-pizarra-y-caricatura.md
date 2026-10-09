# 8. Videos pizarra y caricaturas

## Pizarra (skill video-pizarra, de santmun)
Videos animados tipo pizarrón/dibujo a mano: una mascota que actúa, texto que se escribe solo con plumón, fondos
por escena, transiciones al ritmo de la música y final tipo storyboard. Trae además estilos acuarela, cuaderno y
minimal. Lo instala `install.sh` en `~/.claude/skills/video-pizarra`.

Cómo pedirlo:
> Hazme un video pizarra de 60 segundos explicando qué es el interés compuesto, vertical, con mi logo como
> mascota y colores de mi marca (#C8FF00 y negro).

El skill te entrevista (tema, formato, personaje, música, CTA) y te muestra el storyboard antes de producir.
Música: tu propia canción con licencia en `audio/music.mp3`, o con Suno (necesita una clave propia, ver el
README del skill). Tarda 20-40 min de trabajo del agente + 3-5 min de render por minuto de video.

Para usarlo dentro de otro video (por ejemplo al final de los testimonios), renderízalo y pon el MP4 en
`remotion/public/<proyecto>/pizarra.mp4`.

## Caricatura (nuestras plantillas HyperFrames)
En `cartoon/` hay 2 personajes listos (niña y caricatura retro) con objetos animados.
Todo el detalle en `cartoon/README.md`.

Flujo típico:
1. Guion corto (40-70 s) con frases cortas.
2. Voz: grabada por la persona o clonada (`07-voz-clonada.md`).
3. Transcribir la voz para tener el tiempo de cada palabra.
4. Storyboard escena por escena (mira `cartoon/caricatura-retro/STORYBOARD.md`): tiempo, frase, fondo, pose del
   personaje, objetos, texto en pantalla.
5. Claude adapta `build.py`, arma `index.html`, saca fotos de revisión y renderiza.

Cómo pedirlo:
> Haz una caricatura de 45 segundos con la plantilla caricatura-retro, con esta voz (assets/vo.wav) y este guion.
> Cambia los colores de la ropa a los de la marca: azul #2F4FC0 y amarillo #FFD93B.
