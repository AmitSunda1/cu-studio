// Stage 3: one moodboard per scene (key frame + assets + palette + type + motion + sound).
// Usage: node tools/moodboard.mjs content/<reel>-moodboard.mjs output/<reel>/moodboards
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const { scenes, assetsDir } = await import(pathToFileURL(path.resolve(ROOT, process.argv[2])).href);
const outDir = path.resolve(ROOT, process.argv[3]); fs.mkdirSync(outDir, { recursive: true });
const A = path.join(ROOT, assetsDir); const url = (p) => pathToFileURL(p).href;
const fonts = path.join(ROOT, 'brand/fonts');

const icon = (name, px, color) => fs.readFileSync(path.join(A, 'icons', name + '.svg'), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  .replace(/width="24"\s+height="24"/, `width="${px}" height="${px}" style="color:${color};flex:none"`);
const lotties = new Set();
const h = {
  root: url(ROOT),
  ph: (f, style) => `<div class="ph" style="background-image:url(${url(path.join(A, 'stock', f))});${style}"></div>`,
  ic: icon,
  lt: (name, px) => { lotties.add(name); return `<i class="lt" data-l="${name}" style="width:${px}px;height:${px}px"></i>`; },
  hl: (t) => `<mark>${t}</mark>`,
};
const themes = { paper: ['#fafcfe', '#ffffff', '#212125', '#5822d8', '#ffc53d'], midnight: ['#12124a', '#1e1e62', '#fafcfe', '#c380e9', '#ffc53d'], ultraviolet: ['#5822d8', '#4a1bc0', '#ffffff', '#ffc53d', '#e8daff'] };
const thumb = (a) => a.endsWith('.jpg') || a.endsWith('.png') ? `<div class="th" style="background-image:url(${url(a.startsWith('brand') ? path.join(ROOT, a) : path.join(A, a))})"></div>`
  : a.endsWith('.svg') ? `<div class="th ic">${icon(path.basename(a, '.svg'), 64, '#5822d8')}</div>`
  : (lotties.add(path.basename(a, '.json')), `<div class="th ic"><i class="lt" data-l="${path.basename(a, '.json')}" style="width:72px;height:72px;color:#5822d8"></i></div>`);

const boards = scenes.map((s) => `
<section class="board" id="b${s.n}">
  <div class="frame"><div class="cu-reel" data-theme="${s.theme}">${s.frame(h)}<div class="safe"></div></div></div>
  <div class="notes">
    <div class="hd"><span class="num">${String(s.n).padStart(2, '0')}</span><div><div class="eyebrow">Scene · ${s.id} · ${s.time} s · theme ${s.theme}</div><div class="vo">“${s.vo}”</div></div></div>
    <div class="kw">${s.keywords.map((k) => `<span>${k}</span>`).join('')}</div>
    <h3>Assets</h3><div class="ths">${s.assets.map(thumb).join('')}</div>
    <h3>Palette &amp; type</h3><div class="pal">${themes[s.theme].map((c) => `<span style="background:${c}"></span>`).join('')}<div class="ty"><b>Bricolage 800</b> headline · <span>DM Sans 700</span> caption · <code>DM MONO 28+</code> labels</div></div>
    <div class="two"><div><h3>Motion</h3><ul>${s.motion.map((m) => `<li>${m}</li>`).join('')}</ul></div><div><h3>Sound</h3><ul>${s.sound.map((m) => `<li>${m}</li>`).join('')}</ul></div></div>
  </div>
</section>`).join('');

const css = `
@font-face{font-family:'Bricolage Grotesque';src:url(${url(fonts + '/BricolageGrotesque.woff2')})}
@font-face{font-family:'DM Sans';src:url(${url(fonts + '/DMSans.woff2')})}
@font-face{font-family:'DM Mono';src:url(${url(fonts + '/DMMono.woff2')})}
body{margin:0;background:#e9ebed;font-family:'DM Sans';--font-display:'Bricolage Grotesque';--font-text:'DM Sans';--font-mono:'DM Mono'}
.board{width:2000px;height:1240px;display:flex;gap:56px;padding:40px 56px;box-sizing:border-box;background:#fafcfe;margin-bottom:20px}
.frame{width:648px;height:1152px;flex:none;border-radius:28px;overflow:hidden;box-shadow:0 20px 50px #12124a33}
.frame .cu-reel{transform:scale(.6);transform-origin:0 0;position:relative;width:1080px;height:1920px;overflow:hidden;background:var(--ground);color:var(--ink)}
.safe{position:absolute;left:0;right:0;top:1330px;bottom:0;background:repeating-linear-gradient(135deg,#0000 0 22px,#ff3b3b14 22px 44px);border-top:3px dashed #ff3b3b66}
.safe::after{content:'IG UI ZONE: no text below 1330 px';position:absolute;left:40px;top:20px;font:500 28px 'DM Mono';color:#ff3b3baa}
${fs.readFileSync(path.join(ROOT, 'tools/reel-scene.css'), 'utf8')}
.notes{flex:1;display:flex;flex-direction:column;gap:22px;color:#212125;min-width:0}
.hd{display:flex;gap:28px;align-items:flex-start}.num{font:800 120px/0.8 'Bricolage Grotesque';color:#5822d8;letter-spacing:-.04em}
.eyebrow{font:500 22px 'DM Mono';letter-spacing:.1em;text-transform:uppercase;color:#626269;margin-bottom:10px}
.vo{font:700 44px/1.2 'Bricolage Grotesque';color:#12124a;letter-spacing:-.01em;text-wrap:balance}
.kw{display:flex;gap:10px;flex-wrap:wrap}.kw span{font:500 22px 'DM Mono';padding:8px 16px;border-radius:999px;background:#ffc53d;color:#12124a}
h3{font:500 20px 'DM Mono';letter-spacing:.14em;text-transform:uppercase;color:#5822d8;margin:6px 0 -8px}
.ths{display:flex;gap:14px;flex-wrap:wrap}.th{width:150px;height:150px;border-radius:18px;background:#e8daff center/cover;display:grid;place-items:center;border:1px solid #e9ebed}
.th.ic{background:#fff}
.pal{display:flex;gap:10px;align-items:center}.pal span{width:64px;height:64px;border-radius:14px;border:1px solid #d6d8da}.ty{margin-left:18px;font-size:22px;color:#626269}.ty b{font-family:'Bricolage Grotesque';color:#12124a}
.two{display:grid;grid-template-columns:1fr 1fr;gap:28px}ul{margin:14px 0 0;padding-left:24px;font-size:24px;line-height:1.4;color:#212125}li{margin-bottom:8px}`;

const L = Object.fromEntries([...lotties].map((n) => [n, JSON.parse(fs.readFileSync(path.join(A, 'lottie', n + '.json'), 'utf8'))]));
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${url(path.join(ROOT, 'design-system/project/tokens.css'))}"><style>${css}</style>
<script src="${url(path.join(ROOT, 'node_modules/lottie-web/build/player/lottie_svg.min.js'))}"></script></head><body>${boards}
<script>const L=${JSON.stringify(L)};
const rgb=(c)=>c.match(/[\\d.]+/g).slice(0,3).map((v)=>v/255).concat(1);
const recolor=(o,c)=>{if(Array.isArray(o))return o.forEach((x)=>recolor(x,c));if(o&&typeof o==='object'){if((o.ty==='st'||o.ty==='fl')&&o.c&&o.c.a===0)o.c.k=c;Object.values(o).forEach((x)=>recolor(x,c))}};
document.querySelectorAll('.lt').forEach((el)=>{const d=JSON.parse(JSON.stringify(L[el.dataset.l]));recolor(d,rgb(getComputedStyle(el).color));
const a=lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:d});a.goToAndStop(d.op-1,true)});</script></body></html>`;
const file = path.join(outDir, 'moodboards.html'); fs.writeFileSync(file, html);
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 2000, height: 1240 } });
await page.goto(url(file)); await page.waitForTimeout(1000);
for (const s of scenes) await page.locator('#b' + s.n).screenshot({ path: path.join(outDir, `scene-${String(s.n).padStart(2, '0')}-${s.id}.png`) });
await browser.close();
console.log(`${scenes.length} moodboards -> ${outDir}`);
