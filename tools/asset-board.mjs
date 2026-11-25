// Contact sheet of collected assets for a reel: photos (original + CU duotone), icons, Lottie (3 frames each).
// Usage: node tools/asset-board.mjs assets/<slug>
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const dir = path.resolve(ROOT, process.argv[2]);
const rel = (p) => pathToFileURL(p).href;
const fonts = path.join(ROOT, 'brand/fonts');

const photos = fs.readdirSync(path.join(dir, 'stock')).filter((f) => f.endsWith('.jpg') && !f.includes('-duo')).sort();
const icons = fs.readdirSync(path.join(dir, 'icons')).filter((f) => f.endsWith('.svg')).sort();
const cutouts = fs.readdirSync(path.join(dir, 'stock')).filter((f) => f.endsWith('-duo.png')).sort();
const lotties = fs.readdirSync(path.join(dir, 'lottie')).filter((f) => f.endsWith('.json')).sort();
const svg = (f) => fs.readFileSync(path.join(dir, 'icons', f), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/stroke="currentColor"/, 'stroke="#5822d8"').replace(/width="24"\s+height="24"/, 'width="64" height="64"');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Bricolage Grotesque';src:url(${rel(fonts + '/BricolageGrotesque.woff2')})}
@font-face{font-family:'DM Sans';src:url(${rel(fonts + '/DMSans.woff2')})}
@font-face{font-family:'DM Mono';src:url(${rel(fonts + '/DMMono.woff2')})}
body{margin:0;background:#fafcfe;color:#212125;font-family:'DM Sans';padding:56px;width:1888px}
h1{font-family:'Bricolage Grotesque';font-size:64px;margin:0 0 8px;color:#12124a}
h2{font-family:'DM Mono';font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:#5822d8;margin:48px 0 16px}
.sub{color:#626269;font-size:24px}
.grid{display:grid;gap:16px}
.ph{grid-template-columns:repeat(4,1fr)} .ph figure{margin:0;background:#fff;border:1px solid #e9ebed;border-radius:20px;overflow:hidden}
.pair{display:grid;grid-template-columns:1fr 1fr} .pair img{width:100%;height:220px;object-fit:cover;display:block}
figcaption{font-family:'DM Mono';font-size:18px;padding:10px 14px;color:#626269}
.ic{grid-template-columns:repeat(9,1fr)} .ic div{color:#5822d8;background:#fff;border:1px solid #e9ebed;border-radius:16px;padding:18px 6px 8px;text-align:center;font-family:'DM Mono';font-size:14px;color:#626269}
.lt{grid-template-columns:repeat(6,1fr)} .lt>div{background:#e8daff;border-radius:16px;padding:12px;text-align:center;font-family:'DM Mono';font-size:16px;color:#12124a}
.lt .fr{display:flex;justify-content:center;gap:4px}.lt .fr div{width:76px;height:76px}
</style><script src="${rel(path.join(ROOT, 'node_modules/lottie-web/build/player/lottie_svg.min.js'))}"></script></head><body>
<h1>${path.basename(dir)} · asset board</h1><div class="sub">${photos.length} photos (original → CU duotone) · ${icons.length} Lucide icons · ${lotties.length} Lottie animations (start · middle · end)</div>
<h2>Stock photos · Pexels</h2><div class="grid ph">${photos.map((f) => `<figure><div class="pair"><img src="${rel(path.join(dir, 'stock', f))}"><img src="${rel(path.join(dir, 'stock', f.replace('.jpg', '-duo.jpg')))}"></div><figcaption>${f.replace('.jpg', '')}</figcaption></figure>`).join('')}</div>
${cutouts.length ? `<h2>Cut-outs · yours</h2><div class="grid ic" style="grid-template-columns:repeat(6,1fr)">${cutouts.map((f) => `<div style="background:#f6dcf6"><img src="${rel(path.join(dir, 'stock', f))}" style="height:150px"><br>${f.replace('-duo.png', '')}</div>`).join('')}</div>` : ''}
<h2>Icons · Lucide (ISC) + drawn (d-*)</h2><div class="grid ic">${icons.map((f) => `<div>${svg(f)}<br>${f.replace('.svg', '')}</div>`).join('')}</div>
<h2>Lottie · react-useanimations (MIT)</h2><div class="grid lt">${lotties.map((f, i) => `<div><div class="fr"><div id="l${i}a"></div><div id="l${i}b"></div><div id="l${i}c"></div></div>${f.replace('.json', '')}</div>`).join('')}</div>
<script>
const L=${JSON.stringify(lotties.map((f) => JSON.parse(fs.readFileSync(path.join(dir, 'lottie', f), 'utf8'))))};
const recolor=(o)=>{if(Array.isArray(o))return o.forEach(recolor);if(o&&typeof o==='object'){if((o.ty==='st'||o.ty==='fl')&&o.c&&o.c.k&&o.c.a===0)o.c.k=[0.345,0.133,0.847,1];Object.values(o).forEach(recolor)}};
L.forEach((d,i)=>['a','b','c'].forEach((s,j)=>{const data=JSON.parse(JSON.stringify(d));recolor(data);const a=lottie.loadAnimation({container:document.getElementById('l'+i+s),renderer:'svg',loop:false,autoplay:false,animationData:data});a.goToAndStop(Math.round((d.op-1)*[0.1,0.5,1][j]),true)}));
</script></body></html>`;
const out = path.join(dir, '_board.html'); fs.writeFileSync(out, html);
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 2000, height: 1000 } });
await page.goto(rel(out)); await page.waitForTimeout(800);
await page.screenshot({ path: path.join(dir, '_contact-sheet.png'), fullPage: true });
await browser.close(); console.log('board ->', path.join(dir, '_contact-sheet.png'));
