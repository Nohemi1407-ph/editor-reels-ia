# 10. Problemas comunes (y cómo se arreglaron)

## Instalación
| Problema | Solución |
|---|---|
| `command not found: ffmpeg / node / python3` | Instálalo (ver `01-instalacion.md`) y cierra y abre la Terminal. |
| El setup de video-edit dice NOT READY | Lee la línea STATUS que falla: trae el comando exacto. Arregla y corre `bash install.sh` otra vez. |
| "El parche no aplica limpio" | Tu video-edit es de otra versión o lo editaste. `git -C ~/.claude/skills/video-edit stash`, luego `git -C ~/.claude/skills/video-edit checkout 410c46eeb9d19f173650697bd581745235363038` y `bash install.sh`. |
| Node viejo aunque instalaste uno nuevo | Tienes varios Node. `nvm use 22` o `brew link --overwrite node`; el setup del skill encuentra el bueno. |
| Mac Intel: algo pide PyTorch nuevo (clonadores de voz locales) | En Mac Intel PyTorch llega solo a 2.2.2: esos proyectos no corren. Usa la opción en la nube (`07-voz-clonada.md`). |

## Video
| Problema | Causa | Solución (ya incluida en nuestro parche) |
|---|---|---|
| El video armado tiene la mitad de los cuadros o se congela | El *concat demuxer* de ffmpeg descarta cuadros cuando los clips tienen encabezados distintos (un 4K girado junto a uno 1080p) | Unir con el **filtro** `concat` (decodifica cada parte), no con `-f concat`. |
| Video estirado o con barras al unir | Clips con distinta forma de pixel | `setsar=1` después del escalado. |
| Clip del celular sale de lado o mal recortado | El celular guarda el video girado con una etiqueta de rotación | Leer `side_data rotation` y cambiar ancho/alto si es ±90° antes de calcular el recorte. |
| Metadatos/subtítulos raros del celular rompen la unión | Pistas extra | `-map_metadata -1 -sn -dn` en cada segmento. |
| `headpos.py` falla en un cuadro | Cabeza girada o cortada | Ya tiene respaldo; revisa ese cuadro a ojo. |
| Animación tapa la cara después de un zoom | El zoom bajó la cara | Vuelve a correr `headpos.py` y baja/achica la animación. |
| Un filtro de ffmpeg muy largo no entra en el comando | Límite de largo | En ffmpeg 7+ se lee de archivo con `-/filter_complex filtro.txt` (el viejo `-filter_complex_script` ya no existe en versiones nuevas). |
| `No such filter: 'drawtext'` | Tu ffmpeg no trae freetype | `hoja_contacto.py` sigue sin etiquetas de tiempo; o instala un ffmpeg completo. |
| Cortes con "flash" de medio segundo | Al quitar una pausa quedó un pedacito | Unirlo a la toma vecina (regla: nada menor a ~0.5 s). |
| Los textos se desfasan de la voz | Se cortaron errores DESPUÉS de poner textos | Siempre la pasada de errores primero; si no, rehacer tiempos. |
| `cutout.py` muy lento o se cierra | Usa ~1.5 GB de RAM | Uno a la vez, cierra otras apps. |
| Transcripción en inglés o con palabras raras | Modelo `.en` o sin idioma | Nuestro parche usa modelos multilingües con `language='es'`; agrega nombres y marcas en el *prompt* de `transcribe_cut.py`. |

## Remotion
| Problema | Solución |
|---|---|
| `Cannot find module 'remotion'` | `cd remotion && npm install`. |
| Error 404 de un archivo al renderizar | El video/música no está en `remotion/public/` con esa ruta exacta. |
| Las letras salen con otra fuente | Las fuentes cargan desde `public/fonts`; no borres esa carpeta. |
| Render muy lento | Normal en Mac Intel: prueba primero con `node stills.mjs` y renderiza al final. |

## Instagram / descargas
- Instagram bloquea ver páginas sin sesión: para referencias usa Apify (`scripts/descargar_reel_apify.py`).
- El render pesa mucho para mandarlo por WhatsApp: `bash scripts/exportar_celular.sh render.mp4` (crf 26-28).
  Guarda siempre el render grande.
