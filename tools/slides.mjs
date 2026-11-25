// CU Social slide renderer: one function per slide type, shared by the carousel
// exporter (tools/carousel.mjs) and the design-system previews (tools/build-previews.mjs).
//
// Inline markup inside any text field:
//   ==words==  -> marigold highlight (max one per slide)
//   *words*    -> accent colour
//   \n         -> line break

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const md = (s = '') => esc(s)
  .replace(/==(.+?)==/g, '<span class="cu-hl">$1</span>')
  .replace(/\*(.+?)\*/g, '<span class="cu-accent">$1</span>')
  .replace(/\n/g, '<br>');

export const arc = (variant = '') =>
  `<svg class="cu-arc ${variant ? 'cu-arc--' + variant : ''}" viewBox="0 0 1000 1000" aria-hidden="true"><circle cx="500" cy="500" r="400"/></svg>`;

const DEFAULT_THEME = { hook: 'midnight', story: 'paper', list: 'paper', shift: 'paper', stat: 'ultraviolet', quote: 'midnight', photo: 'paper', cta: 'ultraviolet' };

function chrome(ctx, s) {
  return `<header class="cu-chrome">
    <span class="cu-brand"><img class="cu-mark" src="${ctx.assets.icon}" alt="">@creativeupaay</span>
    ${ctx.series ? `<span class="cu-tag">${esc(ctx.series)}</span>` : ''}
  </header>`;
}

function foot(ctx, i, n, s) {
  const pad = (x) => String(x).padStart(2, '0');
  const last = i === n;
  const right = i === 1 ? `<span class="cu-swipe">Swipe &rarr;</span>`
    : last ? '' : `<span class="cu-count">&rarr;</span>`;
  return `<footer class="cu-foot">
    <span class="cu-count"><b>${pad(i)}</b> / ${pad(n)}</span>
    <span class="cu-progress"><i style="--p:${((i / n) * 100).toFixed(2)}%"></i></span>
    ${right}
  </footer>`;
}

const bodies = {
  hook: (s) => `<div class="cu-body cu-body--end">
      ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
      <h1 class="type-hook">${md(s.text)}</h1>
      ${s.sub ? `<p class="type-body-lg cu-soft">${md(s.sub)}</p>` : ''}
    </div>`,

  story: (s) => `<div class="cu-body">
      ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
      <h2 class="type-headline">${md(s.text)}</h2>
      ${s.body ? `<p class="type-body-lg cu-soft">${md(s.body)}</p>` : ''}
    </div>`,

  list: (s) => `<div class="cu-body">
      ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
      <h2 class="type-headline">${md(s.text)}</h2>
      <ul class="cu-list">${(s.items || []).map((x) => `<li>${md(x)}</li>`).join('')}</ul>
    </div>`,

  shift: (s) => `<div class="cu-body">
      ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
      ${s.text ? `<h2 class="type-title">${md(s.text)}</h2>` : ''}
      <div class="cu-shift">
        <div class="cu-card"><p class="type-label cu-soft">${esc(s.beforeLabel || 'Before')}</p><p class="type-body-lg">${md(s.before)}</p></div>
        <div class="cu-card cu-card--accent"><p class="type-label cu-accent">${esc(s.afterLabel || 'After')}</p><p class="type-body-lg">${md(s.after)}</p></div>
      </div>
    </div>`,

  stat: (s) => `<div class="cu-body cu-body--end">
      ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
      <p class="type-stat cu-stat">${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ''}</p>
      <h2 class="type-title">${md(s.text)}</h2>
      ${s.body ? `<p class="type-body cu-soft">${md(s.body)}</p>` : ''}
    </div>`,

  quote: (s) => `<div class="cu-body">
      <p class="cu-quote-mark" aria-hidden="true">&ldquo;</p>
      <blockquote class="type-quote" style="margin:0">${md(s.text)}</blockquote>
      <div class="cu-by">
        ${s.photo ? `<img class="cu-avatar" src="${s.photo}" alt="">` : `<span class="cu-avatar">${esc(s.initials || (s.name || '?').slice(0, 1))}</span>`}
        <div><div class="cu-by-name">${esc(s.name)}</div><div class="cu-by-role">${esc(s.role || '')}</div></div>
      </div>
    </div>`,

  photo: (s) => `<div class="cu-body cu-body--start" style="gap:var(--space-6)">
      <div class="cu-photo" style="flex:1">${s.src ? `<img src="${s.src}" alt="">` : `<div class="cu-photo-empty">Photo or screenshot</div>`}</div>
      <div style="display:grid;gap:var(--space-2)">
        ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
        <h2 class="type-title">${md(s.text)}</h2>
      </div>
    </div>`,

  cta: (s, ctx) => `<div class="cu-body cu-body--end" style="gap:var(--space-6)">
      ${s.label ? `<p class="cu-label">${md(s.label)}</p>` : ''}
      <h2 class="type-headline">${md(s.text)}</h2>
      <div class="cu-actions">${(s.actions || ['Save for later', 'Send to a founder']).map((a, k) => `<span class="cu-btn ${k === 0 ? 'cu-btn--primary' : ''}">${md(a)}</span>`).join('')}</div>
      <img class="cu-wordmark" src="${ctx.assets.wordmark}" alt="Creative Upaay">
    </div>`,
};

const ARC = { hook: 'top', story: '', list: '', shift: 'left', stat: 'top', quote: 'top', photo: '', cta: 'top' };

export function slide(s, i, n, ctx) {
  const type = s.type || 'story';
  const theme = s.theme || DEFAULT_THEME[type] || 'paper';
  const body = bodies[type];
  if (!body) throw new Error(`Unknown slide type "${type}" on slide ${i}`);
  const showArc = s.arc !== false && ['hook', 'stat', 'quote', 'cta'].includes(type) || s.arc === true;
  return `<section class="cu-slide" data-theme="${theme}">
    ${showArc ? arc(ARC[type]) : ''}
    ${chrome(ctx, s)}
    ${body(s, ctx)}
    ${foot(ctx, i, n, s)}
  </section>`;
}

export function reel(r, ctx) {
  const theme = r.theme || 'midnight';
  return `<section class="cu-reel" data-theme="${theme}">
    ${r.media ? `<img class="cu-reel-media" src="${r.media}" alt="">` : `<div class="cu-reel-media cu-reel-media--empty"></div>`}
    ${r.series ? `<span class="cu-tag cu-reel-tag" style="background:var(--ground)">${esc(r.series)}</span>` : ''}
    ${r.hook ? `<div class="cu-reel-hook"><h1 class="type-reel-hook">${md(r.hook)}</h1></div>` : ''}
    ${r.caption ? `<p class="cu-caption type-reel-caption">${md(r.caption).replace(/<span class="cu-hl">/g, '<span class="on">')}</p>` : ''}
    ${r.guides ? `<div class="cu-guides"><div class="crop"><span>Grid crop 3:4</span></div><div class="safe"><span>Text safe zone</span></div></div>` : ''}
  </section>`;
}
