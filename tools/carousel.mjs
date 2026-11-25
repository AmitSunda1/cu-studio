// Usage: node tools/carousel.mjs content/<story>.json
// Writes output/<story>/slide-01.png ... (1080 x 1350) and output/<story>/carousel.html
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { slide } from './slides.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const src = process.argv[2];
if (!src) { console.error('Usage: node tools/carousel.mjs content/<story>.json'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(src, 'utf8'));
const slug = path.basename(src, '.json');
const out = path.join(ROOT, 'output', slug);
fs.mkdirSync(out, { recursive: true });

const rel = (p) => path.relative(out, path.join(ROOT, p));
const ctx = {
  series: spec.series,
  assets: { icon: rel('brand/logo/cu-icon.png'), wordmark: rel('brand/logo/cu-wordmark-footer.svg') },
};
const n = spec.slides.length;
const html = `<!doctype html><html><head><meta charset="utf-8"><title>${slug}</title>
<link rel="stylesheet" href="${rel('design-system/project/tokens.css')}">
<link rel="stylesheet" href="${rel('design-system/project/components/bundle.css')}">
<style>body{margin:0;background:#888;display:flex;flex-wrap:wrap;gap:40px;padding:40px}</style></head>
<body>${spec.slides.map((s, i) => slide(s, i + 1, n, ctx)).join('\n')}</body></html>`;
const htmlPath = path.join(out, 'carousel.html');
fs.writeFileSync(htmlPath, html);

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
await page.goto('file://' + htmlPath);
await page.evaluate(() => document.fonts.ready);
const els = await page.$$('.cu-slide');
for (let i = 0; i < els.length; i++) {
  const f = path.join(out, `slide-${String(i + 1).padStart(2, '0')}.png`);
  await els[i].screenshot({ path: f });
}
await browser.close();
// contact sheet for quick review (needs ffmpeg)
try {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(out, 'slide-%02d.png'),
    '-vf', `scale=432:-1,tile=${els.length}x1:padding=16:color=0x888888`, '-frames:v', '1', path.join(out, '_contact-sheet.png')]);
} catch { console.warn('ffmpeg not found: skipped contact sheet'); }
console.log(`Rendered ${els.length} slides -> ${path.relative(ROOT, out)}/`);
