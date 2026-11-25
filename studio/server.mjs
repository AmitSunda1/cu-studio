// CU Studio: local web UI for the story -> carousel -> reel workflow.
// Usage: npm run studio   (or node studio/server.mjs), then open http://localhost:4321
// Each story keeps one Claude Code conversation (claude -p --resume) that does the creative work one step at a time.
// The user approves, requests changes, or answers Claude's questions from the browser; approving a step starts the next.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process'; import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(HERE, 'data');
const PORT = +process.env.PORT || 4321;
fs.mkdirSync(DATA, { recursive: true });

export const STAGES = [
  { id: 'carousel', name: 'Carousel' }, { id: 'script', name: 'Script & voice' }, { id: 'breakdown', name: 'Breakdown' },
  { id: 'assets', name: 'Assets' }, { id: 'moodboards', name: 'Moodboards' }, { id: 'edit', name: 'Edit' }, { id: 'final', name: 'Final' },
];
const VOICES = [
  ['en-US-AndrewMultilingualNeural', 'Andrew (US, warm) · default'], ['en-US-BrianMultilingualNeural', 'Brian (US, casual)'],
  ['en-IN-PrabhatNeural', 'Prabhat (Indian English, male)'], ['en-IN-NeerjaExpressiveNeural', 'Neerja (Indian English, female)'],
  ['en-US-AvaMultilingualNeural', 'Ava (US, female)'], ['en-US-EmmaMultilingualNeural', 'Emma (US, female)'],
  ['hi-IN-MadhurNeural', 'Madhur (Hindi, male) · Hindi default'], ['hi-IN-SwaraNeural', 'Swara (Hindi, female)'],
];
const DEFAULT_VOICE = { en: 'en-US-AndrewMultilingualNeural', hi: 'hi-IN-MadhurNeural' };
const RATES = ['+0%', '+4%', '+8%', '+12%', '+16%', '+18%'];
const ENGINE = 'reel-engine';

// ---------- per-story file names
function P(st) {
  const S = st.slug, R = st.reel || `${S}-reel`, A = st.assets || `assets/${S}`, f = st.files || {};
  return {
    S, R, A,
    carousel: `content/${S}.json`, script: `content/${R}.json`, timeline: `output/${R}/timeline.json`, voice: `output/${R}/voiceover.mp3`,
    breakdown: f.breakdown || `content/${R}-breakdown.md`, moodboardSrc: `content/${R}-moodboard.mjs`, moodboards: f.moodboards || `output/${R}/moodboards`,
    edit: `content/${R}-edit.mjs`, reel: f.reel || `output/${R}/reel.mp4`, check: `output/${R}/check.json`, frames: `output/${R}/frames.png`,
    cover: f.cover || `output/${R}/cover.png`, coverGrid: f.coverGrid || `output/${R}/cover-grid.png`, caption: f.caption || `output/${R}/caption.txt`,
    direction: `studio/data/${S}/direction.md`, cast: `studio/data/${S}/cast.json`, ownPhotos: `${A}/own-photos.json`,
  };
}

// ---------- Claude Code runner
const SYSTEM = `You are running inside CU Studio, a local web UI for this project. The user does not see this chat:
they see the files you produce, your final message and any questions you ask. Rules:
- Follow CLAUDE.md and the CU Social brand book (design-system/project/README.md). Facts only from the user's story or creativeupaay.com.
- Never add details the story does not contain: no new phrases presented as the author's words, no example names,
  numbers, quotes or specifics. Paraphrase or cut instead; keep visuals generic.
- Do ONLY the step you are asked for, then stop. Never start the next step.
- Work only inside this project folder. Run commands from the project root exactly as shown (no cd, no && chains).
- If files for this step already exist from an earlier pass, update them to match the latest approved steps.
- Be quick: don't re-read files you already read earlier in this conversation unless they changed.
- ASKING THE USER: when a choice is genuinely the user's (taste, a fact you don't know, two good directions), you may
  ask. Do the work you can first, then end your final message with ONE fenced block exactly like this:
  \`\`\`questions
  [{"question": "Which hook should open the reel?", "options": ["Hook A: ...", "Hook B: ..."], "multi": false}]
  \`\`\`
  At most 3 questions, 2-4 short options each, your recommended option first. The user picks (or writes their own)
  in the UI and their answers come back to you in this conversation. Don't ask about things you can decide yourself.
- Your final message (outside the questions block) is shown in the UI: plain English, under 150 words, short bullets.`;

const BASE = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash(ls *)'];
const TOOLS = {
  carousel: [...BASE, 'Bash(node tools/carousel.mjs *)', 'WebFetch(domain:creativeupaay.com)', 'WebFetch(domain:www.creativeupaay.com)'],
  script: [...BASE, 'Bash(.venv/bin/python tools/voiceover.py *)'],
  breakdown: [...BASE, 'Bash(node tools/fetch-lottie.mjs --list)', 'Bash(node tools/fetch-icon.mjs --search *)', 'Bash(node tools/fetch-icon.mjs --drawn)'],
  assets: [...BASE, 'WebSearch', 'Bash(node tools/fetch-photo.mjs *)', 'Bash(node tools/fetch-icon.mjs *)', 'Bash(node tools/fetch-lottie.mjs *)', 'Bash(node tools/asset-board.mjs *)'],
  moodboards: [...BASE, 'Bash(node tools/moodboard.mjs *)'],
  edit: [...BASE, `Bash(node ${ENGINE}/build-reel.mjs *)`, `Bash(node ${ENGINE}/render-reel.mjs *)`],
  final: [...BASE],
};

// what every step must know about this story: language, cast (dialogue reels), visual direction, the user's own photos
function context(st, p) {
  const out = [];
  if (st.lang === 'hi') out.push(`LANGUAGE: HINDI reel. The voice speaks Hindi; ALL on-screen text (slides, headlines, captions, labels,
Instagram caption) is Hinglish (Hindi in Roman letters, e.g. "Maine apni team se ek sawaal poocha"; English words stay
English). Never put Devanagari on screen. Timed words carry their Hinglish word, so h.W(beat, word) takes the Hinglish word.`);
  const cast = readJson(p.cast);
  if (cast?.length) out.push(`DIALOGUE REEL with a cast (${p.cast}): ${cast.map((c) => `${c.name} = voice ${c.voice}${c.face ? `, face ${p.A}/stock/${c.face}` : ''}`).join('; ')}.
Script beats carry "who" (cast name, or "all" for group lines spoken by ${cast[0].name}'s voice) and "voice" (that person's voice).
Visual style: cartoon big-head characters, their faces on drawn bodies with comic stickers for expressions. Follow
content/gta6-reel-moodboard.mjs and content/gta6-reel-edit.mjs (person() helper, speaking ring, stickers). Drawn parts
come from the shared library: node tools/fetch-icon.mjs ${p.A} d-body-plain d-body-folded d-body-controller d-body-thumbsup d-sweat ...
(full list: node tools/fetch-icon.mjs --drawn).`);
  if (readText(p.direction).trim()) out.push(`VISUAL DIRECTION from the user is in ${p.direction}: follow it (it overrides your own taste).`);
  const own = readJson(p.ownPhotos);
  if (own && Object.keys(own).length) out.push(`THE USER'S OWN PHOTOS are in ${p.A}/stock/ (${Object.keys(own).map((n) => `${n}-duo.jpg`).join(', ')}).
Use them first, ahead of stock photos. In a carousel use them on "photo" slides with "src": "../../${p.A}/stock/<name>-duo.jpg".`);
  return out.length ? '\n\n' + out.join('\n\n') : '';
}

const PROMPTS = {
  carousel: (st, p) => `New story. Slug "${p.S}", title "${st.title}". Read studio/data/${p.S}/story.md.
Step: CAROUSEL.
1. Read CLAUDE.md, design-system/project/README.md and the example content/obsessed.json.
2. Write ${p.carousel}: series, 6-10 slides, "caption" (Instagram caption with hashtags, max 2 emoji). Keep the author's words.
3. Run: node tools/carousel.mjs ${p.carousel}
4. Look at output/${p.S}/_contact-sheet.png; fix overflow or crowding and re-render until clean.
Final message: one line per slide.`,

  script: (st, p) => {
    const cast = readJson(p.cast);
    return `Step: REEL SCRIPT & VOICE for "${st.title}" (approved carousel ${p.carousel}).
1. Read the example ${cast?.length ? 'content/gta6-reel.json (dialogue)' : 'content/obsessed-reel-fast.json'} and the brand book's reel arc.
2. Write ${p.script}: {"voice": "${DEFAULT_VOICE[st.lang || 'en']}", "rate": "+8%", "gap": 0.25, "beats": [...], "endCard": 2.6}.
   - 6-15 beats {"id", "vo"${st.lang === 'hi' ? ', "cap"' : ''}${cast?.length ? ', "who", "voice"' : ''}, "pauseAfter"?}; ids short lowercase single words, unique, first "hook".
   - About 120-170 spoken words (40-60 s). Hook stops the scroll in 1.5 s. Last beat is the one-line ask or the punchline.${st.lang === 'hi' ? `
   - HINDI: "vo" = spoken Devanagari; "cap" = the same line in Hinglish with EXACTLY the same number of words.
     Acronyms spoken letter by letter join with "~" in "vo" so they stay one caption word (ई~ओ~डी = EOD).` : ''}
3. Run: .venv/bin/python tools/voiceover.py ${p.script}   (it reports any vo/cap word-count mismatch)
Final message: total length and the script beat by beat.`;
  },

  breakdown: (st, p) => `Step: SCRIPT BREAKDOWN for reel "${p.R}".
1. Read ${p.script}, ${p.timeline} and the example ${readJson(p.cast)?.length ? 'content/gta6-reel-breakdown.md' : 'content/obsessed-reel-breakdown.md'}.
2. Write ${p.breakdown}: header (length, voice, HyperFrames, 1080x1920), rules (no third-party logos, no invented facts,
   CU logo only from brand/logo/), the table | # | Time | Voice-over | Keywords | What we see | Assets | Sound | (one row per
   beat + END), "Running elements" and a "Shopping list". Photos: Pexels only. Icons: Lucide (node tools/fetch-icon.mjs --search <word>).
   Animated icons: names from node tools/fetch-lottie.mjs --list. Sounds: whoosh pop tick click scratch riser chime send thud flip hit resolve.
Final message: one line per beat with its key visual.`,

  assets: (st, p) => `Step: ASSET HUNT for reel "${p.R}". Collect the shopping list in ${p.breakdown} into ${p.A}/.
- Photos: WebSearch (allowed_domains ["pexels.com"]), pick photo page URLs, then node tools/fetch-photo.mjs ${p.A} <short-name> <url>.
  Real-looking people, no brand logos, room for text. Skip stock where the user's own photos or cast faces fit.
- Icons (Lucide or drawn d-*): node tools/fetch-icon.mjs ${p.A} <name>...   Animated: node tools/fetch-lottie.mjs ${p.A} <name>...
- Then node tools/asset-board.mjs ${p.A}, look at ${p.A}/_contact-sheet.png and replace anything off-topic.
Final message: per beat, which assets it uses, and any gaps.`,

  moodboards: (st, p) => `Step: MOODBOARDS for reel "${p.R}": one board per scene.
1. Read ${readJson(p.cast)?.length ? 'content/gta6-reel-moodboard.mjs' : 'content/obsessed-reel-moodboard.mjs'} (format), tools/reel-scene.css, ${p.breakdown}, ${p.timeline}, the files in ${p.A}/.
2. Write ${p.moodboardSrc} (assetsDir '${p.A}', one scene per beat in order). 1080x1920 key frames: text above 1190 px,
   nothing important below 1330 px; one marigold highlight per scene; only files that exist in ${p.A}/.
3. Run: node tools/moodboard.mjs ${p.moodboardSrc} ${p.moodboards}
4. Look at every scene PNG; fix overlaps, overflow and empty areas, re-render.
Final message: one line per scene.`,

  edit: (st, p) => `Step: EDIT for reel "${p.R}": build the video from the approved moodboards.
1. Read the header of ${ENGINE}/build-reel.mjs (API), ${readJson(p.cast)?.length ? 'content/gta6-reel-edit.mjs' : 'content/obsessed-reel-edit.mjs'} (example), tools/reel-scene.css,
   ${p.moodboardSrc} and ${p.timeline}.
2. Write ${p.edit}: layouts from the boards, every element entering on its spoken word via h.W(beat, word), one hero sound
   per scene, captions skipped where the same words are big on screen, a composed hook for the cover (or coverAt).
3. Run: node ${ENGINE}/build-reel.mjs ${p.R}   then   node ${ENGINE}/render-reel.mjs ${p.R}
   If the check fails, read ${p.check}, fix and repeat.
4. Look at ${p.frames}; fix anything clipped, overlapping or empty, then rebuild and render.
Final message: length, loudness, and what happens per scene.`,

  final: (st, p) => `Step: FINAL for reel "${p.R}".
1. Write ${p.caption}: the reel's Instagram caption, a shorter version of the carousel caption in ${p.carousel}
   (same hashtags, max 2 emoji, the author's voice).
2. Look at ${p.cover}; say if it isn't a finished, readable thumbnail.
Final message: the caption's first line and anything to check before posting.`,
};
const REDO = {
  carousel: (p) => `edit ${p.carousel}, re-run node tools/carousel.mjs ${p.carousel}, check the contact sheet`,
  script: (p) => `edit ${p.script}, re-run .venv/bin/python tools/voiceover.py ${p.script}`,
  breakdown: (p) => `edit ${p.breakdown}`,
  assets: (p) => `add or replace assets in ${p.A}/ with the fetch tools, delete unused ones, re-run node tools/asset-board.mjs ${p.A}`,
  moodboards: (p) => `edit ${p.moodboardSrc}, re-run node tools/moodboard.mjs ${p.moodboardSrc} ${p.moodboards}, check the scenes`,
  edit: (p) => `edit ${p.edit}, re-run node ${ENGINE}/build-reel.mjs ${p.R} and node ${ENGINE}/render-reel.mjs ${p.R}, check ${p.frames}`,
  final: (p) => `edit ${p.caption}`,
};
const stagePrompt = (stage, st, p) => PROMPTS[stage](st, p) + context(st, p);
const changesPrompt = (st, p, stage, notes) => `The user reviewed the ${stage.toUpperCase()} step of "${st.title}" and asked for these changes:

${notes}

Make them (${REDO[stage](p)}). Stay on the ${stage} step. Final message: what you changed.` + context(st, p);
const answersPrompt = (st, p, stage, answers) => `The user answered your questions on the ${stage.toUpperCase()} step:

${answers.map((a) => `- ${a.question}\n  → ${a.answer}`).join('\n')}

Apply their answers (${REDO[stage](p)}). Stay on the ${stage} step. Final message: what you did.` + context(st, p);

const running = new Map(); // slug -> child process
const stopped = new Set(); // slugs the user stopped (no auto-retry)
const listeners = new Map(); // slug -> Set(res)

function emit(slug, ev) {
  ev.t = Date.now();
  fs.appendFileSync(path.join(DATA, slug, 'log.jsonl'), JSON.stringify(ev) + '\n');
  for (const res of listeners.get(slug) || []) res.write(`data: ${JSON.stringify(ev)}\n\n`);
}
const short = (s, n = 140) => (s = String(s ?? '').replace(/\s+/g, ' ').trim()).length > n ? s.slice(0, n - 1) + '…' : s;
const rel = (p) => (p ? path.relative(ROOT, String(p)) || p : '');
function describeTool(name, input = {}) {
  if (name === 'Bash') return input.description || short(input.command);
  if (['Read', 'Write', 'Edit'].includes(name)) return `${name} ${rel(input.file_path)}`;
  if (name === 'WebFetch') return `Fetch ${input.url}`;
  if (name === 'WebSearch') return `Search “${input.query}”`;
  if (name === 'Glob' || name === 'Grep') return `${name} ${input.pattern}`;
  return name;
}
// a final message may end with a ```questions [...]``` block: split it off for the UI
function splitQuestions(text = '') {
  const m = /```questions\s*([\s\S]*?)```/.exec(text);
  if (!m) return { summary: text.trim(), questions: null };
  let qs = null;
  try { qs = JSON.parse(m[1]).filter((q) => q && q.question).slice(0, 3).map((q) => ({ question: String(q.question), options: (q.options || []).map(String).slice(0, 4), multi: !!q.multi })); } catch {}
  return { summary: text.replace(m[0], '').trim(), questions: qs?.length ? qs : null };
}

// one job at a time per story: Claude (creative work) or a plain tool (voice re-record)
function startJob(slug, stage, child, label, parse, finish) {
  running.set(slug, child); stopped.delete(slug);
  const st = load(slug); setStage(st, stage, { status: 'working', summary: '', questions: null, startedAt: Date.now() }); st.job = { stage, pid: child.pid, startedAt: Date.now() }; save(st);
  emit(slug, { kind: 'status', stage, status: 'working', msg: label });
  let buf = '', err = '';
  child.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); parse(line); } });
  child.stderr.on('data', (d) => { err += d; });
  child.on('close', (code) => {
    running.delete(slug);
    const s = load(slug); s.job = null;
    const r = finish(code, err, s);
    if (r.retry) { save(s); emit(slug, { kind: 'status', stage, status: 'working', msg: 'That attempt failed; retrying once automatically' }); return r.retry(); }
    const took = Date.now() - (s.stages[stage]?.startedAt || Date.now());
    const status = !r.ok ? 'error' : r.questions ? 'question' : 'review';
    setStage(s, stage, { status, summary: r.summary, questions: r.questions || null, took });
    save(s);
    emit(slug, { kind: 'status', stage, status, msg: { review: 'Ready for your review', question: 'Claude has a question for you', error: 'Something went wrong' }[status] });
  });
}

function runClaude(slug, stage, prompt, retried = false) {
  const st = load(slug);
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--append-system-prompt', SYSTEM];
  if (st.sessionId) args.push('--resume', st.sessionId); else { st.sessionId = randomUUID(); args.push('--session-id', st.sessionId); save(st); }
  args.push('--allowedTools', ...TOOLS[stage]);
  const env = { ...process.env }; for (const k of Object.keys(env)) if (k.startsWith('CLAUDE_CODE_') || k === 'CLAUDECODE') delete env[k];
  const child = spawn('claude', args, { cwd: ROOT, env, stdio: ['pipe', 'pipe', 'pipe'] });
  child.stdin.end(prompt);
  let result = null;
  startJob(slug, stage, child, retried ? `Retrying: ${stageName(stage)}` : `Claude started: ${stageName(stage)}`, (line) => {
    let m; try { m = JSON.parse(line); } catch { return; }
    if (m.type === 'assistant') for (const c of m.message?.content || []) {
      if (c.type === 'text' && c.text.trim()) emit(slug, { kind: 'text', msg: splitQuestions(c.text).summary });
      if (c.type === 'tool_use') emit(slug, { kind: 'tool', msg: describeTool(c.name, c.input) });
    }
    if (m.type === 'result') result = m;
  }, (code, err, s) => {
    if (result?.session_id) s.sessionId = result.session_id;
    const ok = code === 0 && result && !result.is_error;
    if (ok) return { ok, ...splitQuestions(result.result || '') };
    const why = short(result?.result || err || `claude exited with code ${code}`, 1500);
    // auto-retry once (not when the user pressed Stop)
    if (!retried && !stopped.has(slug)) return { retry: () => runClaude(slug, stage, `${prompt}\n\n(The previous attempt at this step failed: ${why}. Check what was already done and finish the step.)`, true) };
    return { ok: false, summary: why };
  });
}

function runVoice(slug) {
  const st = load(slug); const p = P(st);
  const child = spawn(path.join(ROOT, '.venv/bin/python'), ['tools/voiceover.py', p.script], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  let last = '';
  startJob(slug, 'script', child, 'Re-recording the voice-over', (line) => { if (line.trim()) { last = line.trim(); emit(slug, { kind: 'tool', msg: last }); } }, (code, err) => {
    const spec = readJson(p.script) || {};
    return code === 0 ? { ok: true, summary: `Re-recorded with **${voiceName(spec.voice)}** at **${spec.rate}**. ${last}` } : { ok: false, summary: short(err, 1500) };
  });
}

// ---------- story state
const dir = (slug) => path.join(DATA, slug);
function load(slug) { return JSON.parse(fs.readFileSync(path.join(dir(slug), 'state.json'), 'utf8')); }
function save(st) { st.updatedAt = Date.now(); fs.writeFileSync(path.join(dir(st.slug), 'state.json'), JSON.stringify(st, null, 2)); }
function setStage(st, id, patch) { st.stages[id] = { ...(st.stages[id] || {}), ...patch, updatedAt: Date.now() }; }
const exists = (slug) => fs.existsSync(path.join(dir(slug), 'state.json'));
const stageName = (id) => STAGES.find((s) => s.id === id)?.name || id;
const voiceName = (v) => VOICES.find(([id]) => id === v)?.[1].split(' (')[0] || v;
const safeName = (s, n = 24) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, n);

function slugify(title) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 5).join('-') || 'story';
  let s = base, n = 2;
  while (exists(s) || ['content', 'output', 'assets'].some((d) => fs.existsSync(path.join(ROOT, d, s)) || fs.existsSync(path.join(ROOT, d, s + '.json')))) s = `${base}-${n++}`;
  return s;
}

// a job that was running when the server stopped can't be resumed
function recover() {
  for (const slug of fs.readdirSync(DATA)) if (exists(slug)) {
    const st = load(slug);
    if (st.job) { setStage(st, st.job.stage, { status: 'error', summary: 'Interrupted: the studio was closed while this step was running. Press "Run this step again".' }); st.job = null; save(st); }
  }
}

// ---------- views
const abs = (r) => path.join(ROOT, r);
const has = (r) => fs.existsSync(abs(r));
const ver = (r) => { try { return Math.round(fs.statSync(abs(r)).mtimeMs); } catch { return 0; } };
const url = (r) => (has(r) ? `/files/${r}?v=${ver(r)}` : null);
const readJson = (r) => { try { return JSON.parse(fs.readFileSync(abs(r), 'utf8')); } catch { return null; } };
const readText = (r) => { try { return fs.readFileSync(abs(r), 'utf8'); } catch { return ''; } };
const list = (r, re) => (has(r) ? fs.readdirSync(abs(r)).filter((f) => re.test(f)).sort() : []);

const VIEWS = {
  carousel: (st, p) => {
    const spec = readJson(p.carousel);
    return { slides: list(`output/${p.S}`, /^slide-\d+\.png$/).map((f) => url(`output/${p.S}/${f}`)), caption: spec?.caption || '', series: spec?.series || '' };
  },
  script: (st, p) => {
    const spec = readJson(p.script); const tl = readJson(p.timeline);
    if (!spec) return { beats: [] };
    const T = Object.fromEntries((tl?.beats || []).map((b) => [b.id, b]));
    return { voice: spec.voice || DEFAULT_VOICE[st.lang || 'en'], rate: spec.rate || '+8%', voices: VOICES, rates: RATES, duration: tl?.duration || null, audio: url(p.voice),
      dialogue: spec.beats.some((b) => b.who),
      beats: spec.beats.map((b) => ({ id: b.id, vo: b.vo.replace(/~/g, ' '), cap: b.cap || null, who: b.who || null, voice: b.voice ? voiceName(b.voice) : null, start: T[b.id]?.start ?? null })) };
  },
  breakdown: (st, p) => ({ markdown: readText(p.breakdown) }),
  assets: (st, p) => {
    const own = readJson(p.ownPhotos) || {};
    return {
      photos: list(`${p.A}/stock`, /-duo\.jpg$/).map((f) => { const name = f.replace('-duo.jpg', ''); return { name, own: !!own[name], look: own[name]?.look || 'tint', duo: url(`${p.A}/stock/${f}`), original: url(`${p.A}/stock/${f.replace('-duo', '')}`) }; }).sort((a, b) => b.own - a.own),
      faces: list(`${p.A}/stock`, /^face-.*-duo\.png$/).map((f) => ({ name: f.replace(/^face-|-duo\.png$/g, ''), url: url(`${p.A}/stock/${f}`) })),
      icons: list(`${p.A}/icons`, /\.svg$/).map((f) => ({ name: f.slice(0, -4), url: url(`${p.A}/icons/${f}`) })),
      lotties: list(`${p.A}/lottie`, /\.json$/).map((f) => ({ name: f.slice(0, -5), url: url(`${p.A}/lottie/${f}`) })),
      credits: readText(`${p.A}/CREDITS.md`),
    };
  },
  moodboards: (st, p) => ({ boards: list(p.moodboards, /^scene-.*\.png$/).map((f) => ({ name: f.replace(/^scene-\d+-|\.png$/g, ''), url: url(`${p.moodboards}/${f}`) })) }),
  edit: (st, p) => ({ video: url(p.reel), check: readJson(p.check), frames: url(p.frames) }),
  final: (st, p) => ({ video: url(p.reel), cover: url(p.cover), coverGrid: url(p.coverGrid), caption: readText(p.caption) }),
};
function storyView(slug) {
  const st = load(slug); const p = P(st);
  let log = []; try { log = fs.readFileSync(path.join(dir(slug), 'log.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).slice(-400); } catch {}
  return { ...st, running: running.has(slug), direction: readText(p.direction), cast: readJson(p.cast) || [], story: readText(`studio/data/${slug}/story.md`),
    log, stagesMeta: STAGES, voices: VOICES, views: Object.fromEntries(STAGES.map((s) => [s.id, VIEWS[s.id](st, p)])) };
}
function listView() {
  return fs.readdirSync(DATA).filter(exists).map((slug) => {
    const st = load(slug); const p = P(st);
    return { slug, title: st.title, stage: st.stage, done: !!st.done, status: st.stages[st.stage]?.status || 'todo', updatedAt: st.updatedAt,
      cover: url(p.cover) || url(`output/${p.S}/slide-01.png`), running: running.has(slug) };
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

// ---------- http
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.md': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.txt': 'text/plain; charset=utf-8' };
const SERVE = ['output/', 'content/', 'brand/', 'assets/', 'design-system/', 'node_modules/lottie-web/build/player/'];
const json = (res, code, body) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((ok, bad) => { let b = ''; req.on('data', (d) => { b += d; if (b.length > 2e6) req.destroy(); }); req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { bad(e); } }); });
const saveUpload = (req, file) => new Promise((ok, bad) => { let n = 0; const w = fs.createWriteStream(file); req.on('data', (d) => { n += d.length; if (n > 60e6) { req.destroy(); bad(new Error('File too large (max 60 MB)')); } }); req.pipe(w); w.on('finish', ok); w.on('error', bad); });

function sendFile(req, res, file, download) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('not found'); }
  const size = fs.statSync(file).size; const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const extra = download ? { 'content-disposition': `attachment; filename="${path.basename(file)}"` } : {};
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range) { // video/audio seeking
    const start = range[1] ? +range[1] : 0; const end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${start}-${end}/${size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1, ...extra });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'content-type': type, 'content-length': size, 'accept-ranges': 'bytes', 'cache-control': 'no-cache', ...extra });
  fs.createReadStream(file).pipe(res);
}

const routes = [
  ['GET', /^\/api\/stories$/, async () => [200, listView()]],
  ['POST', /^\/api\/stories$/, async (req) => {
    const body = await readBody(req); const story = String(body.story || '').trim();
    if (story.length < 40) return [400, { error: 'Paste the full story (at least a few sentences).' }];
    const t = String(body.title || '').trim() || story.split('\n')[0].slice(0, 60);
    const slug = slugify(t); fs.mkdirSync(dir(slug), { recursive: true });
    fs.writeFileSync(path.join(dir(slug), 'story.md'), story + '\n');
    if (String(body.direction || '').trim()) fs.writeFileSync(path.join(dir(slug), 'direction.md'), String(body.direction).trim() + '\n');
    const cast = (body.cast || []).map((c) => ({ name: String(c.name || '').trim(), voice: VOICES.some(([v]) => v === c.voice) ? c.voice : DEFAULT_VOICE[body.lang === 'hi' ? 'hi' : 'en'] })).filter((c) => c.name).slice(0, 8);
    if (cast.length) fs.writeFileSync(path.join(dir(slug), 'cast.json'), JSON.stringify(cast, null, 2));
    const st = { slug, title: t, lang: body.lang === 'hi' ? 'hi' : 'en', createdAt: Date.now(), sessionId: null, stage: 'carousel', job: null, stages: {} }; save(st);
    if (!body.defer) runClaude(slug, 'carousel', stagePrompt('carousel', st, P(st)));
    return [200, { slug }];
  }],
  ['GET', /^\/api\/stories\/([a-z0-9-]+)$/, async (req, slug) => [200, storyView(slug)]],
  // uploads: kind=photo (own photo, tint or original) · kind=face (cast face, name=<cast name>)
  ['POST', /^\/api\/stories\/([a-z0-9-]+)\/upload$/, async (req, slug, u) => {
    const st = load(slug); const pp = P(st); const kind = u.searchParams.get('kind');
    if (st.legacy) return [400, { error: 'This story is view-only.' }];
    if (running.has(slug)) return [409, { error: 'A step is still running for this story.' }];
    const ext = (path.extname(u.searchParams.get('filename') || '').toLowerCase() || '.bin').replace(/[^.a-z0-9]/g, '');
    if (!['photo', 'face'].includes(kind) || !['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'].includes(ext)) return [400, { error: 'Upload a JPG, PNG, WEBP or HEIC image.' }];
    const up = path.join(dir(slug), 'uploads'); fs.mkdirSync(up, { recursive: true });
    const tmp = path.join(up, `${Date.now()}${ext}`); await saveUpload(req, tmp);
    let name;
    if (kind === 'face') {
      const cast = readJson(pp.cast) || []; const who = cast.find((c) => safeName(c.name) === safeName(u.searchParams.get('name')));
      if (!who) return [400, { error: 'Add this person to the cast first.' }];
      name = `face-${safeName(who.name)}`;
      try { execFileSync('node', ['tools/own-photo.mjs', pp.A, name, tmp, 'face'], { cwd: ROOT, stdio: 'pipe' }); } catch (e) { return [400, { error: 'Could not read that image: ' + short(String(e.stderr || e), 200) }]; }
      who.face = `${name}-duo.png`; fs.writeFileSync(abs(pp.cast), JSON.stringify(cast, null, 2));
    } else {
      const base = safeName(u.searchParams.get('name') || path.basename(u.searchParams.get('filename') || 'photo', ext), 30) || 'photo';
      const taken = readJson(pp.ownPhotos) || {}; name = 'my-' + base.replace(/^my-/, ''); let k = 2;
      while (taken[name] || has(`${pp.A}/stock/${name}.jpg`)) name = `my-${base.replace(/^my-/, '')}-${k++}`;
      try { execFileSync('node', ['tools/own-photo.mjs', pp.A, name, tmp, u.searchParams.get('look') === 'original' ? 'original' : 'tint'], { cwd: ROOT, stdio: 'pipe' }); } catch (e) { return [400, { error: 'Could not read that image: ' + short(String(e.stderr || e), 200) }]; }
    }
    emit(slug, { kind: 'user', msg: kind === 'face' ? `Added ${name.replace('face-', '')}'s face` : `Added your photo "${name}"` });
    return [200, { ok: true, name }];
  }],
  ['POST', /^\/api\/stories\/([a-z0-9-]+)\/photo-look$/, async (req, slug) => {
    const st = load(slug); const body = await readBody(req); const pp = P(st);
    if (!(readJson(pp.ownPhotos) || {})[body.name]) return [400, { error: 'Only your own photos can switch look.' }];
    execFileSync('node', ['tools/own-photo.mjs', pp.A, body.name, '--look', body.look === 'original' ? 'original' : 'tint'], { cwd: ROOT, stdio: 'pipe' });
    emit(slug, { kind: 'user', msg: `Photo "${body.name}": ${body.look === 'original' ? 'original colours' : 'CU purple tint'}` });
    return [200, { ok: true }];
  }],
  ['POST', /^\/api\/stories\/([a-z0-9-]+)\/direction$/, async (req, slug) => {
    const body = await readBody(req); fs.writeFileSync(path.join(dir(slug), 'direction.md'), String(body.direction || '').trim() + '\n');
    emit(slug, { kind: 'user', msg: 'Updated the visual direction' });
    return [200, { ok: true }];
  }],
  ['POST', /^\/api\/stories\/([a-z0-9-]+)\/(approve|changes|answer|start|stop|voice)$/, async (req, slug, u, act) => {
    const st = load(slug); const body = await readBody(req);
    if (act === 'stop') { stopped.add(slug); running.get(slug)?.kill('SIGTERM'); return [200, { ok: true }]; }
    if (running.has(slug)) return [409, { error: 'A step is still running for this story.' }];
    const stage = body.stage || st.stage; const idx = STAGES.findIndex((s) => s.id === stage);
    if (idx < 0) return [400, { error: 'Unknown step.' }];
    if (idx > STAGES.findIndex((s) => s.id === st.stage)) return [400, { error: 'Approve the earlier steps first.' }];
    if (st.legacy) return [400, { error: 'This story was made in chat before CU Studio, so it can only be viewed here.' }];
    st.stage = stage; st.done = false; // working on a step makes it the current one again
    if (act === 'approve') {
      if (!['review', 'question'].includes(st.stages[stage]?.status)) return [400, { error: 'This step is not ready for approval.' }];
      setStage(st, stage, { status: 'approved', questions: null }); emit(slug, { kind: 'status', stage, status: 'approved', msg: `${stageName(stage)} approved` });
      const next = STAGES[idx + 1];
      if (!next) { st.done = true; save(st); return [200, { ok: true }]; }
      st.stage = next.id; save(st);
      runClaude(slug, next.id, stagePrompt(next.id, st, P(st)));
      return [200, { ok: true }];
    }
    if (act === 'start') { save(st); runClaude(slug, stage, stagePrompt(stage, st, P(st))); return [200, { ok: true }]; }
    if (act === 'voice') {
      if (stage !== 'script') return [400, { error: 'The voice is set on the Script & voice step.' }];
      const pp = P(st); const spec = readJson(pp.script);
      if (!spec) return [400, { error: 'There is no script yet.' }];
      if (!VOICES.some(([v]) => v === body.voice) || !RATES.includes(body.rate)) return [400, { error: 'Pick a voice and speed from the list.' }];
      spec.voice = body.voice; spec.rate = body.rate; fs.writeFileSync(abs(pp.script), JSON.stringify(spec, null, 2));
      emit(slug, { kind: 'user', msg: `Voice: ${voiceName(body.voice)} at ${body.rate}` }); save(st);
      runVoice(slug); return [200, { ok: true }];
    }
    if (act === 'answer') {
      const answers = (body.answers || []).filter((a) => a && String(a.answer || '').trim()).map((a) => ({ question: String(a.question), answer: String(a.answer).trim() }));
      if (!answers.length) return [400, { error: 'Pick an answer first.' }];
      emit(slug, { kind: 'user', msg: answers.map((a) => `${a.question} → ${a.answer}`).join('\n') }); save(st);
      runClaude(slug, stage, answersPrompt(st, P(st), stage, answers));
      return [200, { ok: true }];
    }
    const notes = String(body.notes || '').trim();
    if (!notes) return [400, { error: 'Write what you want changed.' }];
    emit(slug, { kind: 'user', msg: notes }); save(st);
    runClaude(slug, stage, changesPrompt(st, P(st), stage, notes));
    return [200, { ok: true }];
  }],
];

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x'); const p = decodeURIComponent(u.pathname);
    let m;
    if ((m = /^\/api\/stories\/([a-z0-9-]+)\/events$/.exec(p)) && exists(m[1])) { // live activity (server-sent events)
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' }); res.write(': hi\n\n');
      const set = listeners.get(m[1]) || new Set(); set.add(res); listeners.set(m[1], set);
      const ping = setInterval(() => res.write(': ping\n\n'), 20000);
      req.on('close', () => { clearInterval(ping); set.delete(res); });
      return;
    }
    for (const [method, re, fn] of routes) {
      if (req.method !== method || !(m = re.exec(p))) continue;
      if (m[1] && !exists(m[1])) return json(res, 404, { error: 'Story not found.' });
      const [code, body] = await fn(req, m[1], u, m[2]);
      return json(res, code, body);
    }
    if (p.startsWith('/files/')) {
      const r = path.normalize(p.slice(7)); const f = path.join(ROOT, r);
      if (!f.startsWith(ROOT + path.sep) || !SERVE.some((pre) => r.startsWith(pre))) { res.writeHead(403); return res.end('forbidden'); }
      return sendFile(req, res, f, u.searchParams.has('download'));
    }
    const pub = path.join(HERE, 'public', p === '/' ? 'index.html' : path.normalize(p));
    if (pub.startsWith(path.join(HERE, 'public'))) return sendFile(req, res, pub);
    res.writeHead(404); res.end('not found');
  } catch (e) { console.error(e); json(res, 500, { error: String(e.message || e) }); }
});

recover();
server.listen(PORT, '127.0.0.1', () => console.log(`CU Studio -> http://localhost:${PORT}`));
