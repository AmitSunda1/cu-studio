// Add the user's OWN photo to a story's asset folder (or change its look).
// Usage: node tools/own-photo.mjs assets/<story> <short-name> <image file> <tint|original|face>
//        node tools/own-photo.mjs assets/<story> <short-name> --look <tint|original>
// Writes stock/<name>.jpg (original, auto-rotated, max 1600 px wide) and stock/<name>-duo.jpg (the look used in
// reels and carousels: CU duotone, or the original colours), and records it in own-photos.json + CREDITS.md.
// face: a cast member's head for character reels -> stock/<name>-duo.png. A PNG that already has a transparent
// background is kept as is (trimmed); any other photo becomes an oval "sticker" head with a white outline.
// Accepts JPG, PNG, WEBP and iPhone HEIC.
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url'; import os from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [dirArg, name, src, look] = process.argv.slice(2);
const usage = 'Usage: node tools/own-photo.mjs assets/<story> <short-name> <image|--look> <tint|original>';
if (!dirArg || !name || !src || !['tint', 'original', 'face'].includes(look)) { console.error(usage); process.exit(1); }
if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) { console.error('short-name: lowercase letters, digits and dashes only'); process.exit(1); }
const dir = path.resolve(ROOT, dirArg);
if (!dir.startsWith(path.join(ROOT, 'assets') + path.sep)) { console.error('asset folder must be inside assets/'); process.exit(1); }
const stock = path.join(dir, 'stock'); for (const d of ['stock', 'icons', 'lottie']) fs.mkdirSync(path.join(dir, d), { recursive: true });
const orig = path.join(stock, name + '.jpg'), duo = path.join(stock, name + '-duo.jpg');

let input = src === '--look' ? null : path.resolve(src);
if (input && /\.hei[cf]$/i.test(input)) { // ffmpeg can't read HEIC; macOS sips can
  const tmp = path.join(os.tmpdir(), `own-${process.pid}.jpg`);
  execFileSync('sips', ['-s', 'format', 'jpeg', input, '--out', tmp], { stdio: 'ignore' }); input = tmp;
}
if (look === 'face') {
  if (!input) { console.error('face needs an image file'); process.exit(1); }
  const out = path.join(stock, name + '-duo.png');
  // does it already have a real transparent background? (sample the alpha channel small)
  let transparent = false;
  try {
    const a = execFileSync('ffmpeg', ['-v', 'error', '-i', input, '-vf', 'format=rgba,alphaextract,scale=48:48', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1 << 20 });
    transparent = Math.min(...a) < 40;
  } catch {}
  if (transparent) execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', input, '-vf', "scale='min(700,iw)':-2", out]);
  else execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', input, '-vf',
    "crop='min(iw,ih*0.8)':'min(iw,ih*0.8)/0.8',scale=480:600,format=rgba," +
    "geq=r='if(gt(pow((X-240)/232,2)+pow((Y-300)/292,2),0.9),255,r(X,Y))':g='if(gt(pow((X-240)/232,2)+pow((Y-300)/292,2),0.9),255,g(X,Y))':b='if(gt(pow((X-240)/232,2)+pow((Y-300)/292,2),0.9),255,b(X,Y))':a='255*lte(pow((X-240)/232,2)+pow((Y-300)/292,2),1)'", out]);
  console.log(`face ${name}: ${transparent ? 'cut-out kept' : 'oval sticker head'} -> ${path.relative(ROOT, out)}`);
  process.exit(0);
}
if (input) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', input, '-vf', "scale='min(1600,iw)':-2", '-q:v', '3', orig]);
}
if (!fs.existsSync(orig)) { console.error(`no photo "${name}" in ${dirArg}`); process.exit(1); }
if (look === 'tint') execFileSync(path.join(ROOT, '.venv/bin/python'), [path.join(ROOT, 'tools/duotone.py'), orig, duo], { stdio: 'ignore' });
else fs.copyFileSync(orig, duo);

const reg = path.join(dir, 'own-photos.json');
const list = fs.existsSync(reg) ? JSON.parse(fs.readFileSync(reg, 'utf8')) : {};
list[name] = { look, addedAt: list[name]?.addedAt || new Date().toISOString() };
fs.writeFileSync(reg, JSON.stringify(list, null, 2));
const credits = path.join(dir, 'CREDITS.md');
let c = fs.existsSync(credits) ? fs.readFileSync(credits, 'utf8') : `# ${path.basename(dir)}: asset credits and licences\n`;
if (!c.includes('## Your own photos')) c += `\n## Your own photos (provided by Creative Upaay)\n| File | Look |\n|---|---|\n`;
c = c.split('\n').filter((l) => !l.startsWith(`| stock/${name}.jpg | ${'tint'} |`) && !l.startsWith(`| stock/${name}.jpg | original |`) && !l.startsWith(`| stock/${name}.jpg | CU duotone |`)).join('\n');
c = c.replace(/(## Your own photos[^\n]*\n\| File \| Look \|\n\|---\|---\|\n)/, `$1| stock/${name}.jpg | ${look === 'tint' ? 'CU duotone' : 'original'} |\n`);
fs.writeFileSync(credits, c);
const [w, h] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', orig], { encoding: 'utf8' }).trim().split(',');
console.log(`own photo ${name}: ${w}x${h}, ${look === 'tint' ? 'CU duotone' : 'original colours'} -> ${path.relative(ROOT, duo)}`);
