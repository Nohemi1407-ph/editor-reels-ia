// Saca fotos (stills) de una composición para revisar sin renderizar todo el video.
// Uso:  node stills.mjs <Composicion> <frame1> <frame2> ...     ej: node stills.mjs ReelTemplate 0 90 200
// Las imágenes quedan en out/still-<Composicion>-<frame>.png (a media resolución).
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

const [id, ...rest] = process.argv.slice(2);
if (!id || rest.length === 0) {
  console.log('Uso: node stills.mjs <Composicion> <frame1> <frame2> ...');
  process.exit(1);
}
const frames = rest.map(Number);
const root = process.cwd();
fs.mkdirSync(path.join(root, 'out'), {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browser = await openBrowser('chrome');
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
for (const f of frames) {
  const output = path.join(root, `out/still-${id}-${f}.png`);
  await renderStill({composition, serveUrl, frame: f, output, puppeteerInstance: browser, scale: 0.5});
  console.log('listo', output);
}
await browser.close({silent: true});
