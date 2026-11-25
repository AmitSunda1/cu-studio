// Finish a reel built by build-reel.mjs: HyperFrames check -> render -> loudness to -14 LUFS -> cover + grid crop.
// Usage: node reel-engine/render-reel.mjs <reel> [--check-only]
// Writes output/<reel>/check.json, reel.mp4, cover.png (9:16 hook frame with no caption, see build-reel coverAt), cover-grid.png (3:4 crop), frames.png (24-frame sheet).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SLUG = process.argv[2]; const checkOnly = process.argv.includes('--check-only');
if (!SLUG) { console.error('Usage: node reel-engine/render-reel.mjs <reel> [--check-only]'); process.exit(1); }
const PROJ = path.join(HERE, 'builds', SLUG); const OUT = path.join(ROOT, 'output', SLUG);
fs.mkdirSync(OUT, { recursive: true });
const env = { ...process.env, HYPERFRAMES_TELEMETRY: '0' };
const npx = (args) => spawnSync('npx', ['hyperframes', ...args], { cwd: PROJ, env, encoding: 'utf8', maxBuffer: 1 << 28 });

// 1 check
const raw = npx(['check', '--json']).stdout; const rep = JSON.parse(raw.slice(raw.indexOf('{')));
const sections = ['lint', 'runtime', 'layout', 'motion', 'contrast', 'craft', 'audio'];
const summary = { ok: rep.ok, sections: Object.fromEntries(sections.map((k) => [k, { errors: rep[k]?.errorCount || 0, warnings: rep[k]?.warningCount || 0 }])),
  errors: sections.flatMap((k) => (rep[k]?.findings || []).filter((f) => f.severity === 'error').map((f) => `${k}: ${f.message || f.code || JSON.stringify(f).slice(0, 200)}`)) };
fs.writeFileSync(path.join(OUT, 'check.json'), JSON.stringify(summary, null, 1));
console.log(`check ${rep.ok ? 'OK' : 'FAILED'}: ` + sections.map((k) => `${k} ${summary.sections[k].errors}e/${summary.sections[k].warnings}w`).join(' · '));
for (const e of summary.errors) console.log('  error ' + e);
if (!rep.ok) process.exit(1);
if (checkOnly) process.exit(0);

// 2 render (HyperFrames writes renders/<slug>_<date>.mp4)
const t0 = Date.now(); const r = npx(['render']);
if (r.status !== 0) { console.error(r.stdout.slice(-2000), r.stderr.slice(-2000)); process.exit(1); }
const renders = path.join(PROJ, 'renders');
const src = fs.readdirSync(renders).filter((f) => f.endsWith('.mp4')).map((f) => path.join(renders, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
console.log(`rendered ${path.relative(ROOT, src)} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);

// 3 loudness: two-pass loudnorm to -14 LUFS / -1.5 dBTP (Instagram)
const ff = (args) => spawnSync('ffmpeg', ['-hide_banner', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
const m = JSON.parse(/\{[\s\S]*?\}/.exec(ff(['-i', src, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr.split('Parsed_loudnorm').pop())[0]);
const reel = path.join(OUT, 'reel.mp4');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', src, '-c:v', 'copy', '-af',
  `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
  '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', reel]);
const lufs = /I:\s+(-?[\d.]+) LUFS/.exec(ff(['-i', reel, '-af', 'ebur128', '-f', 'null', '-']).stderr.split('Summary:').pop())?.[1];

// 4 cover: the composed first frame, plus the 3:4 profile-grid crop
let cov = { t: 0.5 }; try { cov = JSON.parse(fs.readFileSync(path.join(PROJ, 'assets/cover.json'), 'utf8')); } catch {}
if (cov.captionFree === false) console.log('note: every hook moment has a caption on screen; cover taken at ' + cov.t + ' s (set coverAt or skip hook captions)');
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(cov.t), '-i', reel, '-frames:v', '1', path.join(OUT, 'cover.png')]);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(OUT, 'cover.png'), '-vf', 'crop=1080:1440:0:240', path.join(OUT, 'cover-grid.png')]);
const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', reel], { encoding: 'utf8' }).trim();
// 5 frame sheet for review: 24 evenly spaced frames
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', reel, '-vf', `fps=${(24 / +dur).toFixed(4)},scale=270:-1,tile=8x3:padding=8:color=0xe9ebed`, '-frames:v', '1', path.join(OUT, 'frames.png')]);
console.log(`reel -> ${path.relative(ROOT, reel)} (${(+dur).toFixed(1)} s, ${lufs} LUFS) + cover.png + cover-grid.png`);
