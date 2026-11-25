// Copy Lucide icons (lucide-static, ISC) or CU drawn assets (d-*, design-system/project/drawn) into a reel's asset folder.
// Usage: node tools/fetch-icon.mjs assets/<story> <icon-name> [more names...]
//        node tools/fetch-icon.mjs --search <word>      list icon names containing <word>
//        node tools/fetch-icon.mjs --drawn              list the CU drawn library (d-*)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'node_modules/lucide-static/icons'), DRAWN = path.join(ROOT, 'design-system/project/drawn');
const fromDir = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
const all = [...fromDir(SRC), ...fromDir(DRAWN)];
const file = (n) => path.join(n.startsWith('d-') ? DRAWN : SRC, n + '.svg');
const args = process.argv.slice(2);
if (args[0] === '--drawn') { console.log(fromDir(DRAWN).join(' ')); process.exit(0); }
if (args[0] === '--search') {
  const q = (args[1] || '').toLowerCase(); console.log(all.filter((n) => n.includes(q)).join('\n') || 'no match'); process.exit(0);
}
const [dirArg, ...names] = args;
if (!dirArg || !names.length) { console.error('Usage: node tools/fetch-icon.mjs assets/<story> <icon-name>...  |  --search <word>'); process.exit(1); }
const dir = path.resolve(ROOT, dirArg);
if (!dir.startsWith(path.join(ROOT, 'assets') + path.sep)) { console.error('asset folder must be inside assets/'); process.exit(1); }
for (const d of ['icons', 'stock', 'lottie']) fs.mkdirSync(path.join(dir, d), { recursive: true });
let bad = 0;
for (const n of names) {
  if (!all.includes(n)) { bad++; console.error(`no icon "${n}". Close matches: ${all.filter((x) => x.includes(n.split('-')[0])).slice(0, 12).join(', ') || 'none'}`); continue; }
  fs.copyFileSync(file(n), path.join(dir, 'icons', n + '.svg')); console.log('icon ' + n);
}
process.exit(bad ? 1 : 0);
