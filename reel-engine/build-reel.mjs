// Stage 4 edit engine: builds reel-engine/builds/<reel>/ (a HyperFrames project) for ANY story from
//   content/<reel>.json            voice-over script (beats), recorded by tools/voiceover.py
//   output/<reel>/timeline.json    word timings
//   content/<reel>-edit.mjs        the story's edit: scenes, word-cued motion and sound (see content/obsessed-reel-edit.mjs)
//   assets/<story>/                collected assets (stock/*-duo.jpg, icons/*.svg, lottie/*.json)
// Usage: node reel-engine/build-reel.mjs <reel> [content/<edit>.mjs]
//   edit file = 2nd arg, else "edit" in content/<reel>.json, else content/<reel>-edit.mjs
//
// The engine adds what every reel shares: moving background ring + sparkles, marigold wipe on every cut,
// word-timed captions (band at 1190 px), CU end card, voice + music + sfx tracks, and a whoosh per cut.
//
// Edit module exports:
//   title, assetsDir, order (beat ids = scene ids, in order), theme ({id: paper|midnight|ultraviolet, end: ...})
//   music?    path to a wav (default output/<reel>/music.wav, generated with tools/music.py if missing)
//   musicAt?  (h) => seconds the music enters (default 0)
//   body(h)   => { [sceneId]: html }     (absolute-positioned layout, 1080x1920, text above 1190 px)
//   skip?(h)  => [[from, to], ...]       caption gaps where the same words are big on screen
//   pushIn?   [[selector, sceneId, endScale], ...]  slow push-in on photo inner layers ("#x-i")
//   animate(h)                            word-cued GSAP motion via h.pop / h.slideUp / h.add
//   cues?(h)  => [{t, type, n?, dur?}]   sfx: whoosh pop tick click scratch riser chime send thud flip hit resolve
//   coverAt?(h) => seconds for the cover frame (default: first hook moment with no caption on screen)
//   blackBefore? seconds of black between the last line and the end card · hardCuts? scene ids entered with a hard cut
//   ground? CSS background for every scene (e.g. a texture image) instead of the theme colour
//   endBody?(h) => end-card html (must contain #e-logo and #e-url) · stock/*-duo.png (cut-outs) are copied like photos
// Helpers h: W(beat, word, nth) word start time · B beats · SC {id:{s,e}} scene times · DUR · T(n) fixed(3)
//   ACC accent per theme · icon(name, px, color) Lucide svg · lt(name, px, color, t, sceneId) Lottie that plays at t
//   ph(id, file, style) duotone photo card (inner layer id-i) · hl(text, id?) marigold highlight
//   pop(sel, t, fromScale?, y?) · slideUp(sel, t) · add(js) raw "tl." line · hidden Set of selectors starting hidden
// Scene CSS classes live in tools/reel-scene.css (.k headline, .m title, .lab, .pill, .bub, .chat/.msg, .card,
//   .chip, .tag, .list, .rows/.ch, .bigq, .chart, .cmt, .rays, .shade ...).
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SLUG = process.argv[2];
if (!SLUG) { console.error('Usage: node reel-engine/build-reel.mjs <reel> [content/<edit>.mjs]'); process.exit(1); }
const PROJ = path.join(HERE, 'builds', SLUG);
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, `output/${SLUG}/timeline.json`), 'utf8'));
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, `content/${SLUG}.json`), 'utf8'));
const editPath = path.resolve(ROOT, process.argv[3] || spec.edit || `content/${SLUG}-edit.mjs`);
const E = await import(pathToFileURL(editPath).href);
const A = path.join(ROOT, E.assetsDir);
const DUR = +tl.duration.toFixed(2);
const B = Object.fromEntries(tl.beats.map((b) => [b.id, b]));
// W(beat, word, nth): start time of a spoken word; matches the spoken word or (Hindi reels) its Hinglish caption word
const norm = (t = '') => t.toLowerCase().replace(/[.,!?…:;"'“”‘’।]/g, '');
const W = (beat, word, nth = 1) => { if (!B[beat]) throw new Error(`no beat "${beat}"`); let n = 0; for (const w of B[beat].words) if ((w.w.toLowerCase() === word.toLowerCase() || (w.c && norm(w.c) === norm(word))) && ++n === nth) return w.s; throw new Error(`no word "${word}" #${nth} in beat "${beat}"`); };

// ---- project scaffold + assets
fs.mkdirSync(path.join(PROJ, 'assets/stock'), { recursive: true });
fs.mkdirSync(path.join(PROJ, 'compositions'), { recursive: true });
const TPL = path.join(HERE, 'template'); // HyperFrames project config
fs.writeFileSync(path.join(PROJ, 'package.json'), fs.readFileSync(path.join(TPL, 'package.json'), 'utf8').replace('REEL_NAME', SLUG));
fs.copyFileSync(path.join(TPL, 'hyperframes.json'), path.join(PROJ, 'hyperframes.json'));
if (!fs.existsSync(path.join(PROJ, 'meta.json'))) fs.writeFileSync(path.join(PROJ, 'meta.json'), JSON.stringify({ id: SLUG, name: SLUG, createdAt: new Date(0).toISOString() }, null, 2));
fs.cpSync(path.join(ROOT, 'brand/fonts'), path.join(PROJ, 'assets/fonts'), { recursive: true });
if (fs.existsSync(path.join(A, 'stock'))) for (const f of fs.readdirSync(path.join(A, 'stock')).filter((f) => /-duo\.(jpg|png)$/.test(f))) fs.copyFileSync(path.join(A, 'stock', f), path.join(PROJ, 'assets/stock', f));
fs.copyFileSync(path.join(ROOT, 'node_modules/lottie-web/build/player/lottie_light.min.js'), path.join(PROJ, 'assets/lottie_light.min.js'));
fs.copyFileSync(path.join(ROOT, 'brand/logo/cu-logo-full.png'), path.join(PROJ, 'assets/cu-logo-full.png'));
fs.copyFileSync(path.join(ROOT, `output/${SLUG}/voiceover.mp3`), path.join(PROJ, 'assets/voiceover.mp3'));
const music = path.join(ROOT, E.music || `output/${SLUG}/music.wav`);
if (!fs.existsSync(music)) execFileSync(path.join(ROOT, '.venv/bin/python'), [path.join(ROOT, 'tools/music.py'), String(Math.ceil(DUR + 1)), music], { stdio: 'inherit' });
fs.copyFileSync(music, path.join(PROJ, 'assets/music.wav'));

// ---- scenes (cuts 0.3 s before each beat's first word; end card after the last line)
const ORDER = E.order; const THEME = { end: 'paper', black: 'midnight', ...E.theme };
for (const id of ORDER) if (!B[id]) throw new Error(`edit order has "${id}" but the timeline has no such beat`);
const scenes = ORDER.map((id, i) => [id, i === 0 ? 0 : B[id].start - 0.3, 0]);
const lastEnd = B[ORDER[ORDER.length - 1]].end + 0.25;
if (E.blackBefore) { scenes.push(['black', lastEnd, 0]); scenes.push(['end', lastEnd + E.blackBefore, DUR]); } // hard cut to black, then the end card
else scenes.push(['end', lastEnd, DUR]);
const HARD = new Set(E.hardCuts || []); // scenes entered by a hard cut: no wipe, no whoosh
scenes.forEach((s, i) => { if (i < scenes.length - 1) s[2] = scenes[i + 1][1]; });
const SC = Object.fromEntries(scenes.map(([id, s, e]) => [id, { s, e }]));
const ACC = { paper: '#5822d8', midnight: '#c380e9', ultraviolet: '#ffc53d' };

// ---- helpers
const icon = (name, px, color) => fs.readFileSync(path.join(A, 'icons', name + '.svg'), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  .replace(/width="24"\s+height="24"/, `width="${px}" height="${px}" style="color:${color};flex:none"`).replace(/\s*class="[^"]*"/, '');
const LOT = {}; let ltN = 0;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).concat(1);
const recolor = (o, c) => { if (Array.isArray(o)) return o.forEach((x) => recolor(x, c)); if (o && typeof o === 'object') { if ((o.ty === 'st' || o.ty === 'fl') && o.c && o.c.a === 0) o.c.k = c; Object.values(o).forEach((x) => recolor(x, c)); } };
// a Lottie that starts playing at absolute time t (its own timed composition), visible until scene end
const lt = (name, px, color, t, scene) => {
  const id = `lt${ltN++}`; const d = JSON.parse(fs.readFileSync(path.join(A, 'lottie', name + '.json'), 'utf8')); recolor(d, hex(color)); LOT[id] = d;
  return `<div class="lt" id="${id}" data-composition-id="${id}" data-start="${t.toFixed(3)}" data-duration="${(SC[scene].e - t).toFixed(3)}" style="width:${px}px;height:${px}px"></div>`;
};
const ph = (id, f, style) => `<div class="ph" id="${id}" style="${style}"><div class="ph-i" id="${id}-i" style="background-image:url(assets/stock/${f})"></div></div>`;
const hl = (t, id = '') => `<mark${id ? ` id="${id}"` : ''}>${t}</mark>`;
const bg = (id) => `<svg class="bgring" id="${id}-ring" viewBox="0 0 1000 1000" aria-hidden="true"><circle cx="500" cy="500" r="430"/><circle class="in" cx="500" cy="500" r="330"/></svg>
  <div class="fx" id="${id}-fx" data-layout-allow-overlap>${[[110, 1460, 30], [930, 1420, 22], [820, 1760, 34], [220, 1820, 20], [560, 1560, 24]].map(([x, y, s], k) => `<i id="${id}-fx-${k}" style="left:${x}px;top:${y}px;font-size:${s}px">✦</i>`).join('')}</div>`;
const js = []; const hidden = new Set(); const T = (n) => n.toFixed(3);
const pop = (sel, t, from = 0.7, y = 24) => { hidden.add(sel); js.push(`tl.fromTo("${sel}",{opacity:0,scale:${from},y:${y}},{opacity:1,scale:1,y:0,duration:0.34,ease:"back.out(2)"},${T(t)});`); };
const slideUp = (sel, t) => { hidden.add(sel); js.push(`tl.fromTo("${sel}",{opacity:0,y:120},{opacity:1,y:0,duration:0.5,ease:"power3.out"},${T(t)});`); };
const add = (s) => js.push(s);
const h = { W, B, SC, DUR, T, ACC, icon, lt, ph, hl, pop, slideUp, add, hidden };

// ---- scene bodies from the edit, plus the CU end card
const body = {
  ...E.body(h),
  black: '<div style="position:absolute;inset:0;background:#000"></div>',
  end: E.endBody ? E.endBody(h) : `<img id="e-logo" src="assets/cu-logo-full.png" alt="Creative Upaay" style="position:absolute;left:50%;top:700px;width:620px;margin-left:-310px">
    <p class="lab" id="e-url" style="top:960px;justify-content:center;left:0;right:0">creativeupaay.com</p>`,
};
for (const id of ORDER) if (!body[id]) throw new Error(`edit body() has no scene "${id}"`);

// ---- captions: word-timed groups; skipped where the same words are already the big on-screen text
const SKIP = E.skip ? E.skip(h) : [];
const skipped = (t) => SKIP.some(([a, b]) => t >= a && t < b);
const groups = [];
for (const b of tl.beats) {
  const toks = spec.beats.find((x) => x.id === b.id).vo.split(/\s+/); // Hindi reels carry the Hinglish caption on each word (w.c)
  let cur = [];
  b.words.forEach((w, i) => {
    if (skipped(w.s)) { if (cur.length) groups.push(cur); cur = []; return; }
    cur.push({ t: w.c ?? (toks.length === b.words.length ? toks[i] : w.w), s: w.s, e: w.e });
    if (cur.length >= 6 || /[.,?!…]$/.test(cur[cur.length - 1].t) || i === b.words.length - 1) { groups.push(cur); cur = []; }
  });
  if (cur.length) groups.push(cur);
}
groups.forEach((g, i) => { g.start = Math.max(0.15, g[0].s - 0.05); const nx = groups[i + 1]; g.end = nx && nx[0].s - g[g.length - 1].e < 0.4 ? nx[0].s - 0.05 : g[g.length - 1].e + 0.3; });

// ---- GSAP timeline
// moving background + slow drift on every scene
for (const [id, s, e] of scenes) {
  if (id === 'black') continue; // the black beat has no background decoration
  add(`tl.fromTo("#${id}-ring",{rotation:0},{rotation:${((e - s) * 6).toFixed(1)},duration:${T(e - s)},ease:"none"},${T(s)});`);
  for (let k = 0; k < 5; k++) add(`tl.fromTo("#${id}-fx-${k}",{y:0,opacity:0.25},{y:${-50 - k * 12},opacity:${0.45 + (k % 2) * 0.15},duration:${T(e - s)},ease:"sine.inOut"},${T(s)});`);
}
for (const [sel, sc, to] of E.pushIn || [])
  add(`tl.fromTo("${sel}",{scale:1},{scale:${to},duration:${T(SC[sc].e - SC[sc].s)},ease:"none"},${T(SC[sc].s)});`);
// marigold wipe across every cut: the outgoing scene is clipped away right-to-left over the marigold root,
// then the incoming scene is revealed the same way (no overlay ever covers text)
scenes.slice(1).forEach(([id, s], i) => {
  const prev = scenes[i][0];
  if (HARD.has(id)) return;
  add(`tl.fromTo("#sc-${prev}",{clipPath:"inset(0 0% 0 0)"},{clipPath:"inset(0 100% 0 0)",duration:0.25,ease:"power3.in",immediateRender:false},${T(s - 0.25)});`);
  add(`tl.fromTo("#sc-${id}",{clipPath:"inset(0 0 0 100%)"},{clipPath:"inset(0 0 0 0%)",duration:0.25,ease:"power3.out",immediateRender:false},${T(s)});`);
});
E.animate(h);
// end card
pop('#e-logo', SC.end.s + 0.3, 0.6); pop('#e-url', SC.end.s + 0.35);
// captions
groups.forEach((g, i) => {
  add(`tl.fromTo("#cap${i}",{opacity:0,y:12},{opacity:1,y:0,duration:0.12,ease:"power2.out"},${T(g.start)});`);
  g.forEach((w, k) => { add(`tl.set("#cap${i}-${k}",{attr:{class:"on"}},${T(w.s)});`); if (k < g.length - 1) add(`tl.set("#cap${i}-${k}",{attr:{class:""}},${T(g[k + 1].s)});`); });
  add(`tl.to("#cap${i}",{opacity:0,duration:0.1},${T(g.end - 0.1)});`); add(`tl.set("#cap${i}",{visibility:"hidden"},${T(g.end)});`);
});

// ---- sound design: a whoosh on each cut + the edit's hero sounds + the end-card resolve
const cues = [
  ...scenes.slice(1).filter(([id]) => !HARD.has(id)).map(([, s]) => ({ t: s - 0.05, type: 'whoosh' })),
  ...(E.cues ? E.cues(h) : []),
  { t: SC.end.s + 0.3, type: 'resolve' },
];
fs.writeFileSync(path.join(PROJ, 'assets/sfx-cues.json'), JSON.stringify({ duration: DUR, cues }, null, 1));
execFileSync(path.join(ROOT, '.venv/bin/python'), [path.join(ROOT, 'tools/sfx.py'), path.join(PROJ, 'assets/sfx-cues.json'), path.join(PROJ, 'assets/sfx.wav')], { stdio: 'inherit' });

// ---- cover moment: the edit's coverAt, else the first hook moment after 0.5 s with no caption on screen
const capAt = (t) => groups.some((g) => t >= g.start - 0.05 && t < g.end + 0.05);
let coverAt = E.coverAt ? E.coverAt(h) : null;
for (let t = 0.5; coverAt == null && t < SC[ORDER[0]].e - 0.3; t += 0.1) if (!capAt(t)) coverAt = +t.toFixed(2);
fs.writeFileSync(path.join(PROJ, 'assets/cover.json'), JSON.stringify({ t: coverAt ?? 0.5, captionFree: coverAt != null }));

// ---- page
const musicAt = E.musicAt ? E.musicAt(h) : 0;
const fontsCss = fs.readFileSync(path.join(PROJ, 'assets/fonts/fonts.css'), 'utf8');
const tokensCss = fs.readFileSync(path.join(ROOT, 'design-system/project/tokens.css'), 'utf8');
const sceneCss = fs.readFileSync(path.join(ROOT, 'tools/reel-scene.css'), 'utf8');
const html = `<!doctype html>
<html lang="en" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>${E.title}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/lottie_light.min.js"></script>
<style>
${fontsCss}
${tokensCss}
:root { --font-display: 'Bricolage Grotesque'; --font-text: 'DM Sans'; --font-mono: 'DM Mono'; }
${sceneCss}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: var(--brand-marigold); }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: var(--font-text); background: var(--brand-marigold); }
.scene { position: absolute; inset: 0; background: var(--ground); color: var(--ink); overflow: hidden; }${E.ground ? `
.scene:not(#sc-black) { background: ${E.ground}; }` : ''}
.ph { overflow: hidden; }
.ph-i { position: absolute; inset: 0; background-size: cover; background-position: center; }
.shade { position: absolute; left: 0; width: 1080px; background: linear-gradient(transparent, var(--ground)); }
.lt { display: inline-block; flex: none; }
.bgring { position: absolute; z-index: 0; left: 90px; top: 1380px; width: 900px; height: 900px; pointer-events: none; }
.bgring circle { fill: none; stroke: var(--motif); stroke-width: 40; stroke-dasharray: 60 40; opacity: .7; }
.bgring .in { stroke-width: 14; stroke-dasharray: 4 30; stroke-linecap: round; }
.fx { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.fx i { position: absolute; font-style: normal; color: var(--accent); opacity: .3; line-height: 1; }
.scene > *:not(.bgring):not(.fx) { z-index: 1; }
.lab { font-size: 30px; }
.chart .flat { stroke-dasharray: 960; } .chart .up { stroke-dasharray: 1000; }
.strike { background-size: 0% 10px; }
#wipe { position: absolute; z-index: 50; top: 0; left: 0; width: 1080px; height: 1920px; background: var(--brand-marigold); }
#caps { position: absolute; z-index: 40; left: 0; right: 0; top: 1190px; height: 140px; }
#caps .cap { position: absolute; left: 0; right: 0; top: 0; display: block; text-align: center; padding: 0 160px 0 80px; font: 700 54px/1.2 var(--font-text); color: var(--neutral-white); opacity: 0; text-shadow: 0 3px 18px rgba(18,18,74,.55); }
#caps .cap span { padding: 0 .12em; border-radius: 12px; }
#caps .cap span.on { background: var(--highlight); color: var(--on-highlight); text-shadow: none; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920">
${scenes.map(([id, s, e]) => `  <div class="scene clip" id="sc-${id}" data-theme="${THEME[id]}" data-start="${s.toFixed(3)}" data-duration="${(e - s).toFixed(3)}" data-track-index="0">
    ${id === 'black' ? '' : bg(id)}
    ${body[id]}
  </div>`).join('\n')}
  <div id="caps">
${groups.map((g, i) => {
  const theme = THEME[scenes.find(([, s, e]) => g.start >= s && g.start < e)[0]];
  return `    <p class="cap" id="cap${i}" style="${theme === 'paper' ? 'color:var(--neutral-ink);text-shadow:none' : ''}">${g.map((w, k) => `<span id="cap${i}-${k}">${w.t}</span>`).join(' ')}</p>`;
}).join('\n')}
  </div>
  <audio id="voice" class="clip" src="assets/voiceover.mp3" data-start="0" data-duration="${DUR}" data-volume="1" data-track-index="1"></audio>
  <audio id="music" class="clip" src="assets/music.wav" data-start="${T(musicAt)}" data-duration="${T(DUR - musicAt)}" data-volume="0.14" data-fade-in="1.5" data-fade-out="1.5" data-track-index="2"></audio>
  <audio id="sfx" class="clip" src="assets/sfx.wav" data-start="0" data-duration="${DUR}" data-volume="1" data-track-index="3"></audio>
</div>
<script>
const LOT = ${JSON.stringify(LOT)};
for (const id in LOT) lottie.loadAnimation({ container: document.getElementById(id), renderer: "svg", loop: false, autoplay: false, animationData: LOT[id] });
const tl = gsap.timeline({ paused: true });
gsap.set(${JSON.stringify([...hidden])}, { opacity: 0 });
${js.join('\n')}
tl.set({}, {}, ${DUR});
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(PROJ, 'index.html'), html);
console.log(`${SLUG}/index.html: ${scenes.length} scenes, ${Object.keys(LOT).length} lotties, ${groups.length} caption groups, ${cues.length} sfx cues, ${DUR}s`);
