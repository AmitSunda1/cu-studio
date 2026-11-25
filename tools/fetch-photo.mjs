// Download one Pexels photo into a reel's asset folder, make its CU duotone and log the credit.
// Usage: node tools/fetch-photo.mjs assets/<story> <short-name> <pexels photo page URL or numeric id>
//   -> assets/<story>/stock/<short-name>.jpg, <short-name>-duo.jpg, a row in assets/<story>/CREDITS.md
// Only pexels.com sources are accepted (Pexels licence: free for commercial use, no attribution required).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [dirArg, name, src] = process.argv.slice(2);
if (!dirArg || !name || !src) { console.error('Usage: node tools/fetch-photo.mjs assets/<story> <short-name> <pexels-photo-url|id>'); process.exit(1); }
if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) { console.error('short-name: lowercase letters, digits and dashes only'); process.exit(1); }
const dir = path.resolve(ROOT, dirArg);
if (!dir.startsWith(path.join(ROOT, 'assets') + path.sep)) { console.error('asset folder must be inside assets/'); process.exit(1); }

let id, page;
if (/^\d+$/.test(src)) { id = src; page = `https://www.pexels.com/photo/${id}/`; }
else {
  let u; try { u = new URL(src); } catch { console.error('not a URL or id: ' + src); process.exit(1); }
  if (!/(^|\.)pexels\.com$/.test(u.hostname)) { console.error('only pexels.com photos are allowed'); process.exit(1); }
  id = /(\d+)\/?$/.exec(u.pathname.replace(/\/$/, ''))?.[1] || /photos\/(\d+)/.exec(u.pathname)?.[1];
  if (!id) { console.error('could not find the photo id in ' + src); process.exit(1); }
  page = u.hostname.startsWith('images.') ? `https://www.pexels.com/photo/${id}/` : `https://www.pexels.com${u.pathname}`;
}

const stock = path.join(dir, 'stock'); fs.mkdirSync(stock, { recursive: true });
for (const d of ['icons', 'lottie']) fs.mkdirSync(path.join(dir, d), { recursive: true });
const out = path.join(stock, name + '.jpg');
const img = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;
const res = await fetch(img, { headers: { 'user-agent': 'Mozilla/5.0' } });
if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) { console.error(`download failed (${res.status}) for photo ${id}`); process.exit(1); }
fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
execFileSync(path.join(ROOT, '.venv/bin/python'), [path.join(ROOT, 'tools/duotone.py'), out, path.join(stock, name + '-duo.jpg')], { stdio: 'ignore' });
const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', out], { encoding: 'utf8' }).trim().split(',');

// credits: one row per file, replaced if the name is fetched again
const credits = path.join(dir, 'CREDITS.md');
if (!fs.existsSync(credits)) fs.writeFileSync(credits, `# ${path.basename(dir)}: asset credits and licences

\`-duo.jpg\` files are CU duotone versions made with \`tools/duotone.py\`.

## Stock photos: Pexels licence (free for commercial use, no attribution required; do not sell unaltered or imply endorsement)
| File | Source |
|---|---|

## Icons: Lucide (lucide-static), ISC licence
icons/*.svg copied unchanged; recoloured at render time.

## Lottie: react-useanimations@3.1.1, MIT licence (lottie/LICENSE-react-useanimations)
lottie/*.json extracted from the package; recoloured at render time. Player: lottie-web (MIT).
`);
let c = fs.readFileSync(credits, 'utf8').split('\n').filter((l) => !l.startsWith(`| stock/${name}.jpg |`));
const at = c.findIndex((l) => l.startsWith('|---|')); c.splice(at + 1, 0, `| stock/${name}.jpg | ${page} |`);
fs.writeFileSync(credits, c.join('\n'));
console.log(`photo ${name}: ${w}x${h} from ${page} -> ${path.relative(ROOT, out)} + ${name}-duo.jpg`);
