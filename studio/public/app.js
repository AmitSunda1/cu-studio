// CU Studio front end: hash routes #/ (home) and #/s/<slug> (story).
const $app = document.getElementById('app');
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const api = async (url, opts = {}) => {
  const r = await fetch(url, { headers: { 'content-type': 'application/json' }, ...opts, body: opts.body && JSON.stringify(opts.body) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.statusText); return j;
};
async function upload(slug, kind, file, extra = {}) {
  const q = new URLSearchParams({ kind, filename: file.name, ...extra });
  const r = await fetch(`/api/stories/${slug}/upload?${q}`, { method: 'POST', body: file });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.statusText); return j;
}
const STATUS = { working: 'Working', review: 'Ready for review', question: 'Claude asks you', approved: 'Approved', error: 'Needs attention', todo: 'Not started', done: 'Finished' };
const chip = (st) => `<span class="chip ${st}"><i class="dot"></i>${STATUS[st] || st}</span>`;
const ago = (t) => { const s = (Date.now() - t) / 1000; return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)} min ago` : s < 86400 ? `${Math.floor(s / 3600)} h ago` : new Date(t).toLocaleDateString(); };
const dur = (ms) => { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`; };
const STAGE_NAMES = { carousel: 'Carousel', script: 'Script & voice', breakdown: 'Breakdown', assets: 'Assets', moodboards: 'Moodboards', edit: 'Edit', final: 'Final' };
const stageName = (id) => STAGE_NAMES[id] || id;
const secs = (t) => (t == null ? '' : `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`);
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
function $(s) { return document.querySelector(s); }
function on(s, fn) { const el = $(s); if (el) el.onclick = fn; }

// markdown: headings, paragraphs, bullets, tables, **bold**, *italic*, `code`, links
const inl = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<i>$2</i>')
  .replace(/`([^`]+)`/g, '<code>$1</code>').replace(/(https?:\/\/[^\s<|)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
function md(t = '') {
  const lines = t.split('\n'); let out = '', i = 0;
  while (i < lines.length) {
    const l = lines[i].trim();
    if (!l) { i++; continue; }
    if (l.startsWith('|')) {
      const rows = []; while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++].trim());
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const body = rows.filter((r) => !/^\|[\s:|-]+\|$/.test(r));
      out += `<div class="tbl"><table><thead><tr>${cells(body[0]).map((c) => `<th>${inl(c)}</th>`).join('')}</tr></thead><tbody>${body.slice(1).map((r) => `<tr>${cells(r).map((c) => `<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      continue;
    }
    if (/^([-*•]|\d+[.)])\s+/.test(l)) {
      out += '<ul>'; while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) out += `<li>${inl(lines[i++].trim().replace(/^([-*•]|\d+[.)])\s+/, ''))}</li>`; out += '</ul>';
      continue;
    }
    const hm = /^(#{1,4})\s+(.*)/.exec(l); const lv = hm && Math.min(hm[1].length + 2, 5);
    out += hm ? `<h${lv} class="mdh">${inl(hm[2])}</h${lv}>` : `<p>${inl(l)}</p>`;
    i++;
  }
  return out;
}

// desktop notification + tab title when a step needs the user
const baseTitle = document.title;
function askNotify() { try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch {} }
function notify(title, body) {
  if (!document.hidden) return;
  document.title = `● ${title} · ${baseTitle}`;
  try { if (Notification.permission === 'granted') new Notification(title, { body, icon: '/files/brand/logo/cu-icon.png' }); } catch {}
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) document.title = baseTitle; });

let es = null, homeTimer = null, tick = null;
function cleanup() { es?.close(); es = null; clearInterval(homeTimer); clearInterval(tick); }
window.addEventListener('hashchange', route);
function route() { cleanup(); $app.classList.remove('legacy'); const m = /^#\/s\/([a-z0-9-]+)/.exec(location.hash); m ? storyPage(m[1]) : home(); }

// ---------------- home
const VOICE_OPTS = (voices, sel) => voices.map(([id, name]) => `<option value="${id}" ${id === sel ? 'selected' : ''}>${esc(name)}</option>`).join('');
const VOICES = [['en-US-AndrewMultilingualNeural', 'Andrew (US, warm)'], ['en-US-BrianMultilingualNeural', 'Brian (US, casual)'], ['en-IN-PrabhatNeural', 'Prabhat (Indian English, male)'],
  ['en-IN-NeerjaExpressiveNeural', 'Neerja (Indian English, female)'], ['en-US-AvaMultilingualNeural', 'Ava (US, female)'], ['en-US-EmmaMultilingualNeural', 'Emma (US, female)'],
  ['hi-IN-MadhurNeural', 'Madhur (Hindi, male)'], ['hi-IN-SwaraNeural', 'Swara (Hindi, female)']];
async function home() {
  const draft = JSON.parse(store.get('cu-draft') || '{}');
  $app.innerHTML = `<div class="home">
    <section class="card new">
      <h2>New story</h2>
      <p>Paste the story as you'd tell it. Claude makes the carousel, then the reel, one step at a time. It asks you when it needs a decision, and nothing moves on until you approve.</p>
      <label class="mono" for="t">Title (optional)</label>
      <input type="text" id="t" placeholder="e.g. What are you obsessed with?" value="${esc(draft.title || '')}">
      <label class="mono" for="s">Story</label>
      <textarea id="s" placeholder="I asked my team a question that left everyone silent for two minutes…">${esc(draft.story || '')}</textarea>
      <label class="mono" for="lang">Reel voice language</label>
      <select id="lang"><option value="en">English</option><option value="hi" ${draft.lang === 'hi' ? 'selected' : ''}>Hindi voice · Hinglish on screen</option></select>
      <details class="more" ${draft.direction ? 'open' : ''}><summary>Visual direction (optional)</summary>
        <textarea id="dir" class="short" placeholder="How it should look, scene by scene if you like. e.g. Light pink grid background, warm and playful…">${esc(draft.direction || '')}</textarea></details>
      <details class="more"><summary>Cast: a dialogue reel with your faces (optional)</summary>
        <p class="hint">One row per person who speaks. Each gets their own voice and a face on a cartoon body. A photo with a transparent background is used as is; any other photo becomes a round sticker head.</p>
        <div id="cast" class="cast"></div><button class="btn ghost small" id="addcast">+ Add a person</button></details>
      <details class="more"><summary>Your photos (optional)</summary>
        <p class="hint">Team, office or event photos. They're used first, ahead of stock photos.</p>
        <label class="drop"><input type="file" id="ph" accept="image/*,.heic" multiple hidden><span>+ Add photos</span></label>
        <div id="phl" class="uplist"></div></details>
      <div class="row"><span class="err" id="e"></span><button class="btn" id="go">Make the carousel →</button></div>
    </section>
    <section class="list"><h2>Your stories</h2><div id="stories"></div></section>
  </div>`;
  const t = $('#t'), s = $('#s'), lang = $('#lang'), dir = $('#dir');
  t.oninput = s.oninput = lang.onchange = dir.oninput = () => store.set('cu-draft', JSON.stringify({ title: t.value, story: s.value, lang: lang.value, direction: dir.value }));
  // cast rows
  const cast = [];
  const drawCast = () => {
    $('#cast').innerHTML = cast.map((c, i) => `<div class="castrow">
      ${c.url ? `<img src="${c.url}" alt="">` : '<span class="noface">?</span>'}
      <input type="text" data-cn="${i}" placeholder="Name" value="${esc(c.name)}">
      <select data-cv="${i}">${VOICE_OPTS(VOICES, c.voice)}</select>
      <label class="link">${c.file ? 'Change photo' : 'Add face photo'}<input type="file" data-cf="${i}" accept="image/*,.heic" hidden></label>
      <button class="link" data-cx="${i}">Remove</button></div>`).join('');
    document.querySelectorAll('[data-cn]').forEach((el) => el.oninput = () => { cast[+el.dataset.cn].name = el.value; });
    document.querySelectorAll('[data-cv]').forEach((el) => el.onchange = () => { cast[+el.dataset.cv].voice = el.value; });
    document.querySelectorAll('[data-cf]').forEach((el) => el.onchange = () => { const f = el.files[0]; if (f) { cast[+el.dataset.cf].file = f; cast[+el.dataset.cf].url = URL.createObjectURL(f); drawCast(); } });
    document.querySelectorAll('[data-cx]').forEach((el) => el.onclick = () => { cast.splice(+el.dataset.cx, 1); drawCast(); });
  };
  $('#addcast').onclick = () => { cast.push({ name: '', voice: lang.value === 'hi' ? 'hi-IN-MadhurNeural' : 'en-US-AndrewMultilingualNeural' }); drawCast(); };
  // own photos
  const photos = [];
  const drawPhotos = () => { $('#phl').innerHTML = photos.map((x, i) => `<div class="up"><img src="${x.url}" alt=""><span>${esc(x.file.name)}</span>
      <select data-look="${i}"><option value="tint" ${x.look === 'tint' ? 'selected' : ''}>CU purple tint</option><option value="original" ${x.look === 'original' ? 'selected' : ''}>Original colours</option></select>
      <button class="link" data-rm="${i}">Remove</button></div>`).join('');
    document.querySelectorAll('[data-look]').forEach((el) => el.onchange = () => { photos[+el.dataset.look].look = el.value; });
    document.querySelectorAll('[data-rm]').forEach((el) => el.onclick = () => { photos.splice(+el.dataset.rm, 1); drawPhotos(); }); };
  $('#ph').onchange = (ev) => { for (const f of ev.target.files) photos.push({ file: f, look: 'tint', url: URL.createObjectURL(f) }); ev.target.value = ''; drawPhotos(); };
  $('#go').onclick = async () => {
    askNotify(); $('#go').disabled = true; $('#e').textContent = '';
    const people = cast.filter((c) => c.name.trim());
    const files = people.filter((c) => c.file).length + photos.length;
    try {
      const { slug } = await api('/api/stories', { method: 'POST', body: { title: t.value, story: s.value, lang: lang.value, direction: dir.value, cast: people.map(({ name, voice }) => ({ name, voice })), defer: files > 0 } });
      let n = 0;
      for (const c of people.filter((x) => x.file)) { $('#go').textContent = `Uploading ${++n} of ${files}…`; await upload(slug, 'face', c.file, { name: c.name }); }
      for (const x of photos) { $('#go').textContent = `Uploading ${++n} of ${files}…`; await upload(slug, 'photo', x.file, { look: x.look }); }
      if (files) await api(`/api/stories/${slug}/start`, { method: 'POST', body: { stage: 'carousel' } });
      store.set('cu-draft', '{}'); location.hash = `#/s/${slug}`;
    } catch (e) { $('#e').textContent = e.message; $('#go').disabled = false; $('#go').textContent = 'Make the carousel →'; }
  };
  const load = async () => {
    const list = await api('/api/stories');
    $('#stories').innerHTML = list.length ? `<div class="grid">${list.map((x) => `
      <a class="story" href="#/s/${x.slug}">
        <div class="cov" style="${x.cover ? `background-image:url('${x.cover}')` : ''}">${x.cover ? '' : '<span class="mono">No slides yet</span>'}</div>
        <div class="meta"><b>${esc(x.title)}</b>
          <span class="mono soft">${x.done ? 'Reel finished' : `Step: ${esc(stageName(x.stage))}`} · ${ago(x.updatedAt)}</span>
          ${chip(x.running ? 'working' : x.done ? 'done' : x.status)}</div>
      </a>`).join('')}</div>` : `<div class="empty">No stories yet. Paste your first one on the left.</div>`;
  };
  await load(); homeTimer = setInterval(load, 5000);
}

// ---------------- story
async function storyPage(slug) {
  let S, view = null, lastTool = '';
  const load = async () => { S = await api(`/api/stories/${slug}`); if (!view) view = S.stage; lastTool = [...S.log].reverse().find((e) => e.kind === 'tool')?.msg || ''; render(); };
  try { await load(); } catch { $app.innerHTML = `<div class="empty">Story not found. <a href="#/">Back to stories</a></div>`; return; }
  es = new EventSource(`/api/stories/${slug}/events`);
  es.onmessage = (ev) => {
    const e = JSON.parse(ev.data);
    if (e.kind === 'status') {
      if (e.status === 'working') view = e.stage;
      if (['review', 'question', 'error'].includes(e.status)) notify(`${stageName(e.stage)}: ${STATUS[e.status]}`, S.title);
      load(); return;
    }
    if (e.kind === 'tool') { lastTool = e.msg; const n = $('#now'); if (n) n.textContent = e.msg; }
    S.log.push(e); const box = $('#log'); if (box) { box.insertAdjacentHTML('beforeend', logItem(e)); box.scrollTop = box.scrollHeight; }
  };
  // live elapsed time while a step runs
  tick = setInterval(() => { const el = $('#elapsed'); if (el && S.job) el.textContent = dur(Date.now() - S.job.startedAt); }, 1000);

  function render() {
    const keepNotes = $('#notes')?.value || ''; const scrollY = window.scrollY;
    $app.classList.toggle('legacy', !!S.legacy);
    const meta = S.stagesMeta; const curIdx = meta.findIndex((x) => x.id === S.stage); const viewIdx = meta.findIndex((x) => x.id === view);
    const st = S.stages[view] || { status: 'todo' };
    const status = S.running && S.job?.stage === view ? 'working' : st.status;
    const next = meta[viewIdx + 1];
    $app.innerHTML = `
      <div class="head"><a class="back" href="#/">← Stories</a><h1>${esc(S.title)}</h1>${S.views.carousel.series ? `<span class="chip">${esc(S.views.carousel.series)}</span>` : ''}${S.lang === 'hi' ? '<span class="chip">Hindi voice · Hinglish</span>' : ''}${S.cast.length ? `<span class="chip">Dialogue · ${S.cast.length} voices</span>` : ''}${S.done ? chip('done') : ''}</div>
      <nav class="steps">${meta.map((x, i) => {
        const s = S.stages[x.id]; const reach = i <= curIdx || !!s;
        const cls = [x.id === S.stage && !S.done && 'cur', x.id === view && 'view', s?.status === 'approved' && 'done', s?.status === 'question' && 'ask', !reach && 'locked', S.running && S.job?.stage === x.id && 'run'].filter(Boolean).join(' ');
        return `<button class="step ${cls}" data-step="${x.id}" ${reach ? '' : 'disabled title="Approve the earlier steps first"'}><span class="n">STEP ${i + 1}${s?.took ? ` · ${dur(s.took)}` : ''}</span><span class="nm">${x.name}</span></button>`;
      }).join('')}</nav>
      <div class="page">
        <div class="content">${content(view, status)}${storyBox()}</div>
        <aside class="side">
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px"><h3 style="margin:0">${esc(stageName(view))}</h3>${chip(status)}</div>
            ${status === 'working' ? `<div class="progress"><div class="bar"><i></i></div><div class="prow"><span class="mono" id="elapsed">${dur(Date.now() - (S.job?.startedAt || Date.now()))}</span><span class="now" id="now">${esc(lastTool || 'Starting…')}</span></div></div>` : ''}
            ${st.questions?.length && status !== 'working' ? questionsCard(st.questions) : ''}
            ${actions(status, st, next)}
            ${st.summary ? `<h3 style="margin:18px 0 8px">Claude's notes${st.took ? ` <span class="mono soft" style="font-size:11px">· took ${dur(st.took)}</span>` : ''}</h3><div class="notes">${md(st.summary)}</div>` : ''}
          </div>
          <div class="card logcard"><h3>Activity</h3><div class="log" id="log">${S.log.map(logItem).join('') || '<span class="soft">No activity yet.</span>'}</div></div>
        </aside>
      </div>`;
    if ($('#notes')) $('#notes').value = keepNotes;
    const box = $('#log'); box.scrollTop = box.scrollHeight; window.scrollTo(0, scrollY);
    document.querySelectorAll('[data-step]').forEach((b) => b.onclick = () => { view = b.dataset.step; render(); });
    document.querySelectorAll('[data-zoom]').forEach((img) => img.onclick = () => lightbox(JSON.parse(img.closest('[data-gallery]').dataset.gallery), +img.dataset.zoom));
    document.querySelectorAll('[data-swap]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); const n = $('#notes'); if (!n) return; n.value = (n.value ? n.value + '\n' : '') + b.dataset.swap; n.focus(); });
    document.querySelectorAll('[data-copy]').forEach((b) => b.onclick = () => { navigator.clipboard.writeText(b.closest('.card').querySelector('.cap').textContent); b.textContent = 'Copied'; });
    on('#approve', () => { askNotify(); act('approve'); });
    on('#start', () => act('start'));
    on('#stop', () => api(`/api/stories/${slug}/stop`, { method: 'POST', body: {} }));
    on('#send', async () => {
      const box = $('#notes'); const notes = box.value.trim(); if (!notes) return ($('#e').textContent = 'Write what you want changed.');
      box.value = ''; if (!(await act('changes', { notes })) && $('#notes')) $('#notes').value = notes;
    });
    on('#answer', () => {
      const answers = st.questions.map((q, i) => {
        const picked = [...document.querySelectorAll(`[name="q${i}"]:checked`)].map((r) => r.value);
        const other = $(`[data-other="${i}"]`)?.value.trim();
        return { question: q.question, answer: [...picked, ...(other ? [other] : [])].join('; ') };
      });
      if (answers.some((a) => !a.answer)) { $('#qe').textContent = 'Answer every question (pick an option or write your own).'; return; }
      act('answer', { answers });
    });
    on('#revoice', () => act('voice', { voice: $('#voice').value, rate: $('#rate').value }));
    const pick = (sel, fn) => { const el = $(sel); if (el) el.onchange = async (ev) => { const files = [...ev.target.files]; ev.target.value = ''; try { await fn(files); await load(); } catch (e) { alert(e.message); } }; };
    pick('#myphotos', async (files) => { for (const f of files) await upload(slug, 'photo', f, { look: $('#mylook').value }); });
    document.querySelectorAll('[data-look-name]').forEach((b) => b.onclick = async () => { await api(`/api/stories/${slug}/photo-look`, { method: 'POST', body: { name: b.dataset.lookName, look: b.dataset.to } }); await load(); });
    on('#savedir', async () => { await api(`/api/stories/${slug}/direction`, { method: 'POST', body: { direction: $('#dirtext').value } }); $('#savedir').textContent = 'Saved'; });
    playLotties();
  }

  function questionsCard(qs) {
    return `<div class="qcard"><p class="mono" style="color:var(--purple);margin:0">Claude needs your call</p>
      ${qs.map((q, i) => `<div class="q"><b>${esc(q.question)}</b>
        ${q.options.map((o, k) => `<label class="opt"><input type="${q.multi ? 'checkbox' : 'radio'}" name="q${i}" value="${esc(o)}"><span>${esc(o)}${k === 0 ? ' <i class="rec">recommended</i>' : ''}</span></label>`).join('')}
        <input type="text" class="other" data-other="${i}" placeholder="Or write your own answer…"></div>`).join('')}
      <div class="row"><button class="btn" id="answer">Send answers</button><span class="err" id="qe"></span></div></div>`;
  }
  function actions(status, st, next) {
    if (S.legacy) return `<div class="notes soft">Made in chat before CU Studio, so this story is view-only here.</div>`;
    if (S.running) return S.job?.stage === view ? `<button class="btn ghost small" id="stop">Stop</button>` : `<div class="notes soft">${esc(stageName(S.job?.stage))} is running. Wait for it to finish.</div>`;
    const box = (ph) => `<textarea id="notes" placeholder="${esc(ph)}"></textarea><div class="row"><button class="btn ghost small" id="send">Send changes</button><span class="err" id="e"></span></div>`;
    const approve = `<button class="btn gold" id="approve">${next ? `Approve &amp; start ${esc(next.name)} →` : 'Approve the final reel ✓'}</button>`;
    if (status === 'question') return `<div class="actions"><p class="hint">Or skip the questions and approve as it is:</p>${approve}${box(HINTS[view])}</div>`;
    if (status === 'review') return `<div class="actions">${approve}${box(HINTS[view])}</div>`;
    if (status === 'todo') return `<div class="actions"><button class="btn" id="start">Run this step →</button><span class="err" id="e"></span></div>`;
    if (status === 'error') return `<div class="actions"><button class="btn" id="start">Run this step again</button>${box('Or say what to do differently…')}</div>`;
    return `<div class="actions"><p class="hint">Approved. To change it, describe the change. When you approve it again, the next step runs again too.</p>${box(HINTS[view])}</div>`;
  }
  async function act(kind, body = {}) {
    try { await api(`/api/stories/${slug}/${kind}`, { method: 'POST', body: { ...body, stage: view } }); await load(); return true; }
    catch (e) { const el = $('#e') || $('#qe'); if (el) el.textContent = e.message; else alert(e.message); return false; }
  }

  function content(id, status) {
    const v = S.views[id];
    const waiting = (what) => `<div class="card wait">${status === 'working' ? `<div class="ring"></div><div><b>Claude is working on the ${esc(what)}.</b><br>Follow along on the right.</div>` : `<div>Nothing here yet.${status === 'todo' && !S.legacy ? '<br>Press <b>Run this step</b> to start.' : ''}</div>`}</div>`;
    const gal = (list) => esc(JSON.stringify(list));
    if (id === 'carousel') {
      if (!v.slides.length) return waiting('carousel');
      return `<div class="card"><div class="caphead"><h3>${v.slides.length} slides</h3><span class="mono soft">Click a slide to enlarge</span></div>
          <div class="strip" data-gallery="${gal(v.slides)}">${v.slides.map((u, i) => `<img src="${u}" alt="Slide ${i + 1}" data-zoom="${i}" loading="lazy">`).join('')}</div></div>
        ${v.caption ? `<div class="card"><div class="caphead"><h3>Instagram caption</h3><button class="btn ghost small" data-copy>Copy</button></div><p class="cap">${esc(v.caption)}</p></div>` : ''}`;
    }
    if (id === 'script') {
      if (!v.beats.length) return waiting('script');
      const words = v.beats.reduce((n, b) => n + (b.cap || b.vo).split(/\s+/).length, 0);
      return `<div class="card">
          <div class="caphead"><h3>Voice-over${v.duration ? ` · ${v.duration.toFixed(1)} s` : ''}</h3><span class="mono soft">${words} words · ${v.beats.length} beats</span></div>
          ${v.audio ? `<audio controls src="${v.audio}" style="width:100%"></audio>` : '<p class="soft">Not recorded yet.</p>'}
          ${v.dialogue ? '<p class="hint" style="margin-top:12px">Dialogue reel: each line has its own voice (from the cast). Ask for voice changes in Request changes.</p>' : `<div class="voicer">
            <label><span class="mono">Voice</span><select id="voice">${VOICE_OPTS(v.voices, v.voice)}</select></label>
            <label><span class="mono">Speed</span><select id="rate">${v.rates.map((r) => `<option ${r === v.rate ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
            <button class="btn ghost small" id="revoice" ${S.running || S.legacy ? 'disabled' : ''}>Re-record</button></div>`}
        </div>
        <div class="card"><h3 style="margin-bottom:12px">Script</h3><div class="tbl"><table><thead><tr><th>#</th><th>Beat</th>${v.dialogue ? '<th>Who</th>' : ''}<th>${v.beats.some((b) => b.cap) ? 'On screen (Hinglish) · spoken (Hindi)' : 'Voice-over'}</th><th>Starts</th></tr></thead><tbody>
          ${v.beats.map((b, i) => `<tr><td>${i + 1}</td><td><span class="chip">${esc(b.id)}</span></td>${v.dialogue ? `<td><b>${esc(b.who || '')}</b><div class="soft deva">${esc(b.voice || '')}</div></td>` : ''}<td>${b.cap ? `<div>${esc(b.cap)}</div><div class="soft deva">${esc(b.vo)}</div>` : esc(b.vo)}</td><td class="mono soft">${secs(b.start)}</td></tr>`).join('')}
        </tbody></table></div></div>`;
    }
    if (id === 'breakdown') return v.markdown ? `<div class="card md">${md(v.markdown)}</div>` : waiting('breakdown');
    if (id === 'assets') {
      if (!v.photos.length && !v.icons.length && !v.lotties.length && !v.faces.length) return `<div class="card">${addPhotos()}</div>` + waiting('asset hunt');
      return `${v.faces.length ? `<div class="card"><div class="caphead"><h3>Cast faces · ${v.faces.length}</h3></div><div class="faces">${v.faces.map((f) => `<figure><img src="${f.url}" alt=""><figcaption>${esc(f.name)}</figcaption></figure>`).join('')}</div></div>` : ''}
        <div class="card"><div class="caphead"><h3>Photos · ${v.photos.length}</h3><span class="mono soft">Yours first · Swap asks for another</span></div>
          ${addPhotos()}
          <div class="photos" data-gallery="${gal(v.photos.map((p) => p.duo))}">${v.photos.map((p, i) => `<figure>${p.own ? '<b class="mine">Yours</b>' : ''}<img src="${p.duo}" data-zoom="${i}" loading="lazy" alt="">
            <figcaption><span>${esc(p.name)}</span><span>${p.own && !S.legacy ? `<button class="link" data-look-name="${esc(p.name)}" data-to="${p.look === 'tint' ? 'original' : 'tint'}">${p.look === 'tint' ? 'Use original colours' : 'Use CU tint'}</button> · ` : p.original ? `<a href="${p.original}" target="_blank">original</a> · ` : ''}<button class="link" data-swap="Swap the ${esc(p.name)} photo: ">Swap</button></span></figcaption></figure>`).join('')}</div></div>
        <div class="card"><div class="caphead"><h3>Icons &amp; drawings · ${v.icons.length}</h3><span class="mono soft">Lucide + CU drawn · click to swap</span></div>
          <div class="icons">${v.icons.map((x) => `<button class="ic" data-swap="Swap the ${esc(x.name)} icon: "><img src="${x.url}" alt=""><span>${esc(x.name)}</span></button>`).join('')}</div></div>
        ${v.lotties.length ? `<div class="card"><div class="caphead"><h3>Animated icons · ${v.lotties.length}</h3><span class="mono soft">react-useanimations · click to swap</span></div>
          <div class="icons">${v.lotties.map((x) => `<button class="ic" data-swap="Swap the ${esc(x.name)} animation: "><i class="lt" data-lottie="${x.url}"></i><span>${esc(x.name)}</span></button>`).join('')}</div></div>` : ''}
        ${v.credits ? `<details class="card"><summary>Credits &amp; licences</summary><div class="md" style="margin-top:12px">${md(v.credits)}</div></details>` : ''}`;
    }
    if (id === 'moodboards') {
      if (!v.boards.length) return waiting('moodboards');
      return `<div class="boards" data-gallery="${gal(v.boards.map((b) => b.url))}">${v.boards.map((b, i) => `<div class="card board"><div class="caphead"><h3>Scene ${i + 1} · ${esc(b.name)}</h3><button class="btn ghost small" data-swap="Scene ${i + 1} (${esc(b.name)}): ">Change this scene</button></div><img src="${b.url}" data-zoom="${i}" loading="lazy" alt=""></div>`).join('')}</div>`;
    }
    if (id === 'edit') {
      if (!v.video) return waiting('edit (writing, building and rendering takes a few minutes)');
      const c = v.check;
      return `<div class="card"><div class="vid"><video controls playsinline src="${v.video}"></video>
          <div class="vmeta"><h3>The cut</h3>
            ${c ? `<p class="mono soft" style="margin:12px 0 8px">HyperFrames check</p><div class="checks">${Object.entries(c.sections).map(([k, s]) => `<span class="chip ${s.errors ? 'error' : 'approved'}">${k}${s.warnings ? ` · ${s.warnings} notes` : ''}</span>`).join('')}</div>` : ''}
            <p class="hint">Watch with sound. To change a moment, give the time and the change, e.g. “at 0:12 bring the photo in on ‘coding’”.</p>
          </div></div></div>
        ${v.frames ? `<div class="card"><div class="caphead"><h3>Frames across the video</h3></div><img class="frames" src="${v.frames}" alt=""></div>` : ''}`;
    }
    if (id === 'final') {
      if (!v.caption && !v.video) return waiting('final caption');
      const dl = (u, label) => (u ? `<a class="btn ghost small" href="${u}&download">${label}</a>` : '');
      return `<div class="card"><div class="vid">${v.video ? `<video controls playsinline src="${v.video}"></video>` : ''}
          <div class="vmeta"><h3>Ready to post</h3>
            <div class="covers">${v.cover ? `<figure><img src="${v.cover}" alt=""><figcaption class="mono soft">Cover 9:16</figcaption></figure>` : ''}${v.coverGrid ? `<figure><img src="${v.coverGrid}" alt=""><figcaption class="mono soft">Grid 3:4</figcaption></figure>` : ''}</div>
            <div class="row" style="margin-top:14px;flex-wrap:wrap">${dl(v.video, '↓ Reel')}${dl(v.cover, '↓ Cover')}${dl(v.coverGrid, '↓ Grid crop')}</div>
          </div></div></div>
        ${v.caption ? `<div class="card"><div class="caphead"><h3>Reel caption</h3><button class="btn ghost small" data-copy>Copy</button></div><p class="cap">${esc(v.caption)}</p></div>` : ''}`;
    }
    return '';
  }
  function addPhotos() {
    if (S.legacy) return '';
    return `<div class="voicer" style="margin:0 0 14px"><label class="drop small ${S.running ? 'off' : ''}"><input type="file" id="myphotos" accept="image/*,.heic" multiple hidden ${S.running ? 'disabled' : ''}><span>⬆ Add your photos</span></label>
      <select id="mylook"><option value="tint">CU purple tint</option><option value="original">Original colours</option></select>
      <span class="hint">Then use Request changes, e.g. “use my-team in the hook”.</span></div>`;
  }
  function storyBox() {
    return `<details class="card"><summary>Original story${S.cast.length ? ` · cast: ${S.cast.map((c) => esc(c.name)).join(', ')}` : ''}</summary><pre>${esc(S.story)}</pre></details>
      <details class="card"><summary>Visual direction${S.direction?.trim() ? '' : ' (none yet)'}</summary>
        ${S.legacy ? `<pre>${esc(S.direction || '')}</pre>` : `<textarea id="dirtext" class="short" style="margin-top:12px" placeholder="Describe the look, scene by scene if you like.">${esc(S.direction || '')}</textarea>
        <div class="row" style="margin-top:10px"><button class="btn ghost small" id="savedir">Save</button><span class="hint">Used by Breakdown, Moodboards and Edit from their next run.</span></div>`}</details>`;
  }
}

const HINTS = {
  carousel: 'Request changes: e.g. make slide 3 shorter, use the Midnight theme for the hook…',
  script: 'Request changes: e.g. make the hook punchier, cut beat 4, end on a question…',
  breakdown: 'Request changes: e.g. use a timer visual for beat 2, no stock photo in the hook…',
  assets: 'Request changes: click Swap on any asset, or describe what to replace…',
  moodboards: 'Request changes: click “Change this scene”, or describe it…',
  edit: 'Request changes: e.g. at 0:12 the photo should arrive on “coding”, music quieter…',
  final: 'Request changes: e.g. shorter caption, different first line…',
};

function logItem(e) {
  if (e.kind === 'tool') return `<div class="tool">${esc(e.msg)}</div>`;
  if (e.kind === 'user') return `<div class="user"><span class="mono" style="color:var(--purple)">You</span><br>${esc(e.msg).replace(/\n/g, '<br>')}</div>`;
  if (e.kind === 'status') return `<div class="status">— ${esc(e.msg)} · ${new Date(e.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —</div>`;
  return `<div class="text">${md(e.msg)}</div>`;
}

// animated icons loop in CU purple
let lottieLib = null;
async function playLotties() {
  const els = document.querySelectorAll('[data-lottie]'); if (!els.length) return;
  if (!lottieLib) lottieLib = new Promise((ok) => { const s = document.createElement('script'); s.src = '/files/node_modules/lottie-web/build/player/lottie_light.min.js'; s.onload = () => ok(window.lottie); document.head.appendChild(s); });
  const lottie = await lottieLib;
  const recolor = (o) => { if (Array.isArray(o)) return o.forEach(recolor); if (o && typeof o === 'object') { if ((o.ty === 'st' || o.ty === 'fl') && o.c && o.c.a === 0) o.c.k = [0.345, 0.133, 0.847, 1]; Object.values(o).forEach(recolor); } };
  for (const el of els) { try { const d = await (await fetch(el.dataset.lottie)).json(); recolor(d); lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, animationData: d }); } catch {} }
}

function lightbox(list, i) {
  const lb = document.getElementById('lb');
  const show = () => { lb.innerHTML = `<div class="lb"><img src="${list[i]}" alt=""><button class="nav prev">‹</button><button class="nav next">›</button><span class="cnt mono">${i + 1} / ${list.length}</span></div>`;
    lb.querySelector('.prev').onclick = (ev) => { ev.stopPropagation(); i = (i - 1 + list.length) % list.length; show(); };
    lb.querySelector('.next').onclick = (ev) => { ev.stopPropagation(); i = (i + 1) % list.length; show(); };
    lb.querySelector('.lb').onclick = close; };
  const key = (ev) => { if (ev.key === 'Escape') close(); if (ev.key === 'ArrowRight') { i = (i + 1) % list.length; show(); } if (ev.key === 'ArrowLeft') { i = (i - 1 + list.length) % list.length; show(); } };
  const close = () => { lb.innerHTML = ''; document.removeEventListener('keydown', key); };
  document.addEventListener('keydown', key); show();
}

route(); // start last, after every helper above is defined
