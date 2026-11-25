// Extract animated icons (Lottie JSON) from react-useanimations@3.1.1 (MIT) into a reel's asset folder.
// Usage: node tools/fetch-lottie.mjs assets/<story> <name> [more names...]
//        node tools/fetch-lottie.mjs --list
// The package is downloaded once into .cache/ with npm pack (no install, no scripts run).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VER = '3.1.1';
const CACHE = path.join(ROOT, '.cache', `react-useanimations-${VER}`);
const LIB = path.join(CACHE, 'package/lib');
if (!fs.existsSync(LIB)) {
  fs.mkdirSync(CACHE, { recursive: true });
  execFileSync('npm', ['pack', `react-useanimations@${VER}`, '--silent', '--ignore-scripts', '--pack-destination', CACHE], { stdio: 'ignore' });
  const tgz = fs.readdirSync(CACHE).find((f) => f.endsWith('.tgz'));
  execFileSync('tar', ['xzf', path.join(CACHE, tgz), '-C', CACHE]);
}
const require = createRequire(import.meta.url);
const all = fs.readdirSync(LIB).filter((f) => f.endsWith('.js') && f !== 'index.js' && !/^[A-Z_]/.test(f))
  .map((f) => f.slice(0, -3)).filter((n) => { try { return !!require(path.join(LIB, n + '.js')).default?.animationData; } catch { return false; } });
const args = process.argv.slice(2);
if (args[0] === '--list') { console.log(all.join(' ')); process.exit(0); }
const [dirArg, ...names] = args;
if (!dirArg || !names.length) { console.error('Usage: node tools/fetch-lottie.mjs assets/<story> <name>...  |  --list'); process.exit(1); }
const dir = path.resolve(ROOT, dirArg);
if (!dir.startsWith(path.join(ROOT, 'assets') + path.sep)) { console.error('asset folder must be inside assets/'); process.exit(1); }
for (const d of ['lottie', 'icons', 'stock']) fs.mkdirSync(path.join(dir, d), { recursive: true });
const lic = path.join(CACHE, 'package/LICENSE');
if (fs.existsSync(lic)) fs.copyFileSync(lic, path.join(dir, 'lottie/LICENSE-react-useanimations'));
let bad = 0;
for (const n of names) {
  if (!all.includes(n)) { bad++; console.error(`no animation "${n}". Available: ${all.join(' ')}`); continue; }
  const d = require(path.join(LIB, n + '.js')).default.animationData;
  fs.writeFileSync(path.join(dir, 'lottie', n + '.json'), JSON.stringify(d));
  console.log(`lottie ${n} (${(d.op / d.fr).toFixed(1)} s)`);
}
process.exit(bad ? 1 : 0);
