// Stage 3 moodboards for the GTA-6 skit (54 s, 4 AI Hindi voices, Hinglish on screen, light pink-grid look).
// Cartoon big-head style: the cast's real face cut-outs on drawn bodies; comic stickers carry the expressions.
// Render: node tools/moodboard.mjs content/gta6-reel-moodboard.mjs output/gta6-reel/moodboards
export const assetsDir = 'assets/gta6';

const SHIRT = { amit: '#5822d8', kapil: '#ffc53d', sakshi: '#c380e9', mansi: '#6b4fc8' };
const NAME = { amit: 'Amit', kapil: 'Kapil', sakshi: 'Sakshi', mansi: 'Mansi' };
const face = (h, who) => `${h.root}/assets/gta6/stock/face-${who}-duo.png`;

// one character: drawn body (size s) + real face on the neck; optional speaking ring, name tag, stickers
function person(h, who, pose, x, y, s, o = {}) {
  const head = s * 0.74, headBottom = s * 0.86;
  const st = (n, px, l, t, extra = '') => `<div style="position:absolute;left:${l}px;top:${t}px;${extra}">${h.ic('d-' + n, px, '#5822d8')}</div>`;
  const headTop = s * 1.6 - headBottom - head;
  const stickers = (o.stickers || []).map((k) => ({
    sweat: st('sweat', s * 0.22, s * 0.78, headTop + s * 0.02),
    halo: st('halo', s * 0.62, s * 0.19, headTop - s * 0.24),
    spiral: st('spiral', s * 0.24, s * 0.25, headTop + head * 0.3) + st('spiral', s * 0.24, s * 0.51, headTop + head * 0.3),
    shock: st('shock', s * 0.3, s * 0.78, headTop - s * 0.1),
    anger: st('anger', s * 0.24, s * 0.02, headTop - s * 0.02),
    dots: st('dots', s * 0.42, s * 0.7, headTop - s * 0.3),
    glint: st('glint', s * 0.22, s * 0.86, headTop - s * 0.05),
    swirl: '',
  }[k])).join('');
  const behind = (o.stickers || []).includes('swirl') ? st('swirl', s * 1.1, -s * 0.05, headTop - s * 0.14, 'opacity:.9') : '';
  return `<div class="who" style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s * 1.6}px">
    ${behind}<div style="position:absolute;left:0;bottom:0">${h.ic('d-body-' + pose, s, SHIRT[who])}</div>
    ${o.talk ? `<div style="position:absolute;left:${(s - head * 0.92) / 2}px;top:${headTop - s * 0.02}px;width:${head * 0.92}px;height:${head * 1.04}px;border-radius:50%;border:${Math.max(6, s * 0.035)}px solid var(--brand-marigold);box-shadow:0 0 0 ${s * 0.02}px #fff"></div>` : ''}
    <img src="${face(h, who)}" style="position:absolute;left:50%;transform:translateX(-50%)${o.tilt ? ` rotate(${o.tilt}deg)` : ''};bottom:${headBottom}px;height:${head}px;filter:drop-shadow(0 6px 10px rgba(18,18,74,.25))">
    ${o.tag ? `<span style="position:absolute;left:50%;transform:translateX(-50%);bottom:${s * 0.08}px;background:#fff;color:#12124a;border:3px solid #12124a;border-radius:999px;padding:4px 14px;font:500 ${Math.max(20, s * 0.09)}px/1 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">${NAME[who]}</span>` : ''}
    ${stickers}</div>`;
}
// the four in a row (Amit, Kapil, Sakshi, Mansi)
const row = (h, pose, o = {}, y = 790, s = 230) => ['amit', 'kapil', 'sakshi', 'mansi'].map((w, i) => person(h, w, typeof pose === 'string' ? pose : pose[w], 50 + i * (s + 20), y, s, { tag: o.tag, stickers: o.stickers, talk: o.talk === w, tilt: o.tilt?.[w] })).join('');
const bg = (h, dim = 0) => `<div style="position:absolute;inset:0;background:url(${h.root}/assets/gta6/stock/bg-grid-duo.jpg) center/cover"></div>${dim ? `<div style="position:absolute;inset:0;background:rgba(18,18,74,${dim})"></div>` : ''}`;
const monitor = (h, x, y, s, lit = true) => `<div style="position:absolute;left:${x}px;top:${y}px">${h.ic('d-monitor', s, '#12124a')}${lit ? `<div style="position:absolute;left:${s * 0.095}px;top:${s * 0.17}px;width:${s * 0.81}px;height:${s * 0.485}px;overflow:hidden;border-radius:6px">${h.ic('d-gamescreen', s * 0.81, '#fff')}</div>` : ''}</div>`;
const pillStyle = 'position:absolute;display:flex;align-items:center;gap:14px;padding:16px 28px;border-radius:999px;background:#fff;border:4px solid #12124a;font:700 40px/1 var(--font-text);color:#12124a';

export const scenes = [
  {
    id: 'hook', n: 1, time: '0.2–5.1', theme: 'paper',
    vo: 'Dear Saurabh Sir, Manish Sir... hum dil se maafi maangte hain.',
    keywords: ['dear sirs', 'maafi', 'dil se'],
    assets: ['stock/face-amit-duo.png', 'stock/face-kapil-duo.png', 'stock/face-sakshi-duo.png', 'stock/face-mansi-duo.png', 'icons/d-body-folded.svg', 'icons/d-sweat.svg', 'icons/mail.svg'],
    frame: (h) => `${bg(h)}
      <div style="${pillStyle};left:80px;top:270px">${h.ic('mail', 44, '#5822d8')} Dear Saurabh Sir &amp; Manish Sir,</div>
      <h1 class="k" style="top:420px;color:#12124a">We're ${h.hl('Sorry!')}</h1>
      ${row(h, 'folded', { stickers: ['sweat'] })}`,
    motion: ['Frame 0 complete: letter pill, title and the row are already there', 'Heads bob a little (nervous)', 'Sweat drops slide down on "maafi"', 'Heads bow 8° on "maangte"'],
    sound: ['Soft "sorry" sting under the title', 'Plink per sweat drop'],
  },
  {
    id: 'galti', n: 2, time: '5.3–12.0', theme: 'paper',
    vo: 'Aaj humse bahut badi galti ho gayi. Par Sir, yeh hum nahi the... humpe vashikaran hua tha!',
    keywords: ['badi galti', 'nahi the', 'vashikaran'],
    assets: ['icons/d-spiral.svg', 'icons/d-swirl.svg', 'icons/zap.svg'],
    frame: (h) => `${bg(h)}
      <h2 class="m" style="top:270px;color:#12124a">Badi ${h.hl('galti')} ho gayi…</h2>
      <div style="${pillStyle};left:250px;top:520px;transform:rotate(-5deg);background:#5822d8;color:#fff;border-color:#12124a;font-size:52px">${h.ic('zap', 52, '#ffc53d')} VASHIKARAN!</div>
      ${row(h, 'plain', { stickers: ['swirl', 'spiral'] })}`,
    motion: ['"galti" stamps in (scale 1.6 → 1) with a thud', 'Heads shake left-right on "nahi the"', 'On "vashikaran": swirl rings spin behind every head, spiral eyes pop on, pill slams in'],
    sound: ['Thud on "galti"', 'Wobbly hypno riser on "vashikaran"'],
  },
  {
    id: 'jaipur', n: 3, time: '12.3–15.9', theme: 'paper',
    vo: 'Aaj Saurabh Sir aur Manish Sir event ke liye Jaipur gaye the.',
    keywords: ['Jaipur', 'event', 'train'],
    assets: ['stock/face-sourabh-duo.png', 'stock/face-manish-duo.png', 'icons/d-train.svg', 'icons/map-pin.svg', 'icons/sparkles.svg'],
    frame: (h) => `${bg(h)}
      <p class="lab" style="top:270px;color:#5822d8">Udaipur → Jaipur · Event day</p>
      <svg style="position:absolute;left:0;top:500px" width="1080" height="80"><path d="M130 40H950" stroke="#12124a" stroke-width="8" stroke-dasharray="4 22" stroke-linecap="round"/></svg>
      <div style="position:absolute;left:70px;top:350px;text-align:center;font:700 34px var(--font-text);color:#12124a">${h.ic('map-pin', 70, '#5822d8')}<br>Udaipur</div>
      <div style="position:absolute;left:880px;top:350px;text-align:center;font:700 34px var(--font-text);color:#12124a">${h.ic('map-pin', 70, '#5822d8')}<br>Jaipur</div>
      <div style="${pillStyle};left:760px;top:250px;background:var(--brand-marigold);font-size:32px;padding:10px 20px">${h.ic('sparkles', 34, '#12124a')} Event</div>
      <div style="position:absolute;left:150px;top:600px;width:800px;height:400px;overflow:hidden">
        <div style="margin-top:-200px">${h.ic('d-train', 800, '#5822d8')}</div>
        <img src="${face(h, 'sourabh')}" style="position:absolute;left:318px;top:96px;height:130px">
        <img src="${face(h, 'manish')}" style="position:absolute;left:478px;top:100px;height:126px">
      </div>
      <h2 class="m" style="top:1040px;color:#12124a">Sir log ${h.hl('Jaipur')} gaye.</h2>`,
    motion: ['Train rolls in from the left along the dotted route, wheels spin, smoke puffs', 'Heads bob with the train', 'Train arrives under the Jaipur pin on "Jaipur"; "Event" badge pops'],
    sound: ['Train chug building, short whistle on "Jaipur"', 'Pop on the Event badge'],
  },
  {
    id: 'masoom', n: 4, time: '16.0–18.9', theme: 'paper',
    vo: 'Aur office mein reh gaye hum chaar masoom log.',
    keywords: ['office', 'chaar', 'masoom'],
    assets: ['icons/d-halo.svg', 'icons/sparkles.svg'],
    frame: (h) => `${bg(h)}
      <h1 class="k" style="top:300px;color:#12124a">Chaar ${h.hl('masoom')} log.</h1>
      ${row(h, 'plain', { stickers: ['halo'], tag: true, talk: 'kapil' })}`,
    motion: ['Halos drop onto the heads one by one on "chaar"', 'Sparkles twinkle on "masoom"', 'Kapil has the speaking ring'],
    sound: ['Four rising pops', 'Angel chime on "masoom"'],
  },
  {
    id: 'monitor', n: 5, time: '19.1–22.4', theme: 'paper',
    vo: 'Tabhi nazar padi Sir ke 27-inch wale monitor par.',
    keywords: ['nazar', '27-inch', 'monitor'],
    assets: ['icons/d-monitor.svg', 'icons/d-glint.svg', 'icons/eye.svg'],
    frame: (h) => `${bg(h)}
      <p class="lab" style="top:270px;color:#5822d8">${h.ic('eye', 36, '#5822d8')} Sir ka extra monitor</p>
      <div style="position:absolute;left:190px;top:330px">${h.ic('d-monitor', 700, '#12124a')}</div>
      <div style="position:absolute;left:770px;top:360px">${h.ic('d-glint', 130, '#fff')}</div>
      <div style="${pillStyle};left:700px;top:600px;background:var(--brand-marigold);font-size:56px">27″</div>
      ${['amit', 'kapil', 'sakshi', 'mansi'].map((w, i) => person(h, w, 'plain', 60 + i * 190, 900, 170, { talk: w === 'sakshi', tilt: 8 })).join('')}`,
    motion: ['Heads turn toward the monitor (tilt) on "nazar"', 'Monitor slides up from below, glint flashes', '"27″" tag pops on "27-inch"'],
    sound: ['Whoosh in', 'Glint "ding" on "27-inch"'],
  },
  {
    id: 'console', n: 6, time: '22.5–25.4', theme: 'paper',
    vo: 'Aur humne usse PS5 se connect kar diya.',
    keywords: ['PS5', 'connect'],
    assets: ['icons/d-console.svg', 'icons/d-gamescreen.svg', 'icons/plug-zap.svg'],
    frame: (h) => `${bg(h)}
      <h2 class="m" style="top:270px;color:#12124a">PS5 se ${h.hl('connect.')}</h2>
      ${monitor(h, 80, 470, 560)}
      <div style="position:absolute;left:700px;top:470px">${h.ic('d-console', 280, '#5822d8')}</div>
      <svg style="position:absolute;left:0;top:0" width="1080" height="1300"><path d="M840 740C820 860 700 900 560 880S380 860 360 830" stroke="#12124a" stroke-width="10" fill="none" stroke-linecap="round"/></svg>
      <div style="position:absolute;left:560px;top:850px">${h.ic('plug-zap', 70, '#5822d8')}</div>
      ${person(h, 'mansi', 'plain', 830, 880, 180, { talk: true })}`,
    motion: ['Console slides in from the right', 'Cable draws itself from console to monitor; on "connect" the plug zaps and the monitor screen lights up'],
    sound: ['Cable click', 'Power-on hum on "connect"'],
  },
  {
    id: 'kahani', n: 7, time: '25.6–28.5', theme: 'paper',
    vo: 'Lekin Sir, asli kahani toh ab shuru hoti hai...',
    keywords: ['asli kahani', 'drama'],
    assets: [],
    frame: (h) => `${bg(h, 0.35)}
      <div style="position:absolute;left:40px;right:40px;top:320px;transform:rotate(-3deg);background:#12124a;padding:30px 40px;border-radius:20px;box-shadow:0 14px 0 var(--brand-marigold)">
        <h2 style="margin:0;font:800 84px/1.02 var(--font-display);color:#fff">Asli ${h.hl('kahani')} ab shuru…</h2></div>
      ${row(h, 'plain', { talk: 'amit' }, 740, 240)}`,
    motion: ['Grid dims, music drops out', 'Slow push-in on the row', 'Ribbon slams in on "asli kahani"'],
    sound: ['Low dramatic boom'],
  },
  {
    id: 'shakti', n: 8, time: '28.9–31.4', theme: 'paper',
    vo: 'Pata nahi kis shakti ne humein control kiya...',
    keywords: ['shakti', 'control', 'puppet'],
    assets: ['icons/d-strings.svg'],
    frame: (h) => `${bg(h, 0.15)}
      <h2 class="m" style="top:260px;color:#12124a">Kis ${h.hl('shakti')} ne control kiya…</h2>
      ${['amit', 'kapil', 'sakshi', 'mansi'].map((w, i) => `<div style="position:absolute;left:${50 + i * 250}px;top:500px">${h.ic('d-strings', 230, '#12124a')}</div>`).join('')}
      ${row(h, 'plain', { talk: 'kapil', tilt: { amit: -8, kapil: 6, sakshi: -5, mansi: 9 } })}`,
    motion: ['Puppet bars drop from the top on "shakti"', 'Everyone bobs up and down on the strings, out of sync'],
    sound: ['Creepy pluck', 'String twang on "control"'],
  },
  {
    id: 'card', n: 9, time: '31.5–34.3', theme: 'paper',
    vo: '...company ke card se GTA 6 khareed liya!',
    keywords: ['company card', 'GTA 6', 'khareed'],
    assets: ['icons/d-card.svg', 'icons/d-shock.svg', 'icons/check.svg', 'lottie/checkmark.json'],
    frame: (h) => `${bg(h)}
      <h2 class="m" style="top:260px;color:#12124a">Company card se ${h.hl('GTA 6!')}</h2>
      <div style="position:absolute;left:70px;top:420px;transform:rotate(-8deg)">${h.ic('d-card', 460, '#5822d8')}</div>
      <div style="${pillStyle};left:520px;top:560px;border-color:#1f8a5b">${h.lt('checkmark', 56)} Payment successful</div>
      ${['amit', 'kapil', 'sakshi', 'mansi'].map((w, i) => person(h, w, 'plain', 60 + i * 190, 900, 170, { talk: w === 'sakshi', stickers: ['shock'] })).join('')}`,
    motion: ['Card swipes in and tilts', '"Payment successful" ticks on "khareed"', '"!?" pops over every head'],
    sound: ['Card swipe', 'Cha-ching on "khareed"'],
  },
  {
    id: 'shaam', n: 10, time: '34.4–37.4', theme: 'paper',
    vo: 'Phir subah kab shaam ho gayi, pata hi nahi chala.',
    keywords: ['subah', 'shaam', 'time flies'],
    assets: ['icons/d-body-controller.svg', 'icons/sun.svg', 'icons/moon.svg', 'lottie/clock.json'],
    frame: (h) => `${bg(h)}
      <div style="position:absolute;left:80px;top:260px">${h.ic('sun', 110, '#ffc53d')}</div>
      <div style="position:absolute;left:880px;top:260px">${h.ic('moon', 110, '#5822d8')}</div>
      <div style="${pillStyle};left:390px;top:270px">${h.lt('clock', 56)} subah → shaam</div>
      ${monitor(h, 230, 380, 620)}
      ${row(h, 'controller', { talk: 'mansi' }, 820, 230)}`,
    motion: ['Everyone holds a controller; screen flickers', 'Sun arcs across the top and becomes the moon on "shaam"', 'Clock spins fast; the grid tints toward evening lilac'],
    sound: ['Fast clock ticks', 'Day-to-night whoosh on "shaam"'],
  },
  {
    id: 'marzi', n: 11, time: '37.7–40.2', theme: 'paper',
    vo: 'Sir, yeh sab humari marzi se nahi hua.',
    keywords: ['marzi', 'serious'],
    assets: ['icons/d-body-folded.svg', 'icons/d-sweat.svg'],
    frame: (h) => `${bg(h)}
      <h1 class="k" style="top:300px;color:#12124a">Humari ${h.hl('marzi')} nahi thi.</h1>
      ${row(h, 'folded', { stickers: ['sweat'], talk: 'amit' })}`,
    motion: ['Callback to the hook: same row, hands folded', 'Sweat drops return'],
    sound: ['Soft sting'],
  },
  {
    id: 'eod', n: 12, time: '40.3–42.9', theme: 'paper',
    vo: 'Hum toh EOD update dene hi wale the...',
    keywords: ['EOD update'],
    assets: ['icons/mail-pen.svg'],
    frame: (h) => `${bg(h)}
      <div class="cmt" style="top:300px;background:#fff;color:#12124a;border:4px solid #12124a">
        <div class="who">${h.ic('mail-pen', 48, '#5822d8')} EOD update</div>
        <div class="say" style="color:#12124a">Aaj ka kaam:<span class="caret" style="margin-left:10px"></span></div></div>
      ${person(h, 'sakshi', 'plain', 80, 760, 250, { talk: true, tag: true })}`,
    motion: ['EOD card slides up', '"Aaj ka kaam:" types out with the caret blinking'],
    sound: ['Key clicks'],
  },
  {
    id: 'gta', n: 13, time: '43.0–45.7', theme: 'paper',
    vo: 'Bas EOD mein thoda sa GTA add ho gaya.',
    keywords: ['thoda sa GTA'],
    assets: ['icons/gamepad-2.svg'],
    frame: (h) => `${bg(h)}
      <div class="cmt" style="top:300px;background:#fff;color:#12124a;border:4px solid #12124a">
        <div class="who">${h.ic('mail-pen', 48, '#5822d8')} EOD update</div>
        <div class="say" style="color:#12124a">Aaj ka kaam:</div>
        <div class="say" style="color:#12124a">${h.ic('gamepad-2', 52, '#5822d8')} ${h.hl('+ thoda sa GTA 6')}</div></div>
      ${person(h, 'mansi', 'plain', 760, 760, 250, { talk: true, tag: true })}`,
    motion: ['The GTA line adds itself on "GTA" and the card shakes'],
    sound: ['Pop + record scratch on "GTA"'],
  },
  {
    id: 'baat', n: 14, time: '46.0–47.7', theme: 'paper',
    vo: 'Aur haan Sir, ek baat aur—',
    keywords: ['ek baat aur'],
    assets: ['icons/d-bubble.svg'],
    frame: (h) => `${bg(h)}
      <div style="position:absolute;left:470px;top:300px">${h.ic('d-bubble', 460, '#fff')}</div>
      <p style="position:absolute;left:540px;top:440px;margin:0;font:800 64px/1.05 var(--font-display);color:#12124a">Ek baat aur—</p>
      ${person(h, 'amit', 'plain', 120, 600, 360, { talk: true, tag: true })}`,
    motion: ['Amit leans in; the bubble opens and cuts off mid-sentence'],
    sound: ['Small breath, then nothing'],
  },
  {
    id: 'punch', n: 15, time: '47.7–50.3', theme: 'paper',
    vo: 'GTA 6 bahut achha game hai, Sir!',
    keywords: ['GTA 6', 'achha game', 'stare'],
    assets: ['icons/d-body-thumbsup.svg', 'icons/d-glint.svg', 'icons/d-dots.svg', 'icons/d-anger.svg'],
    frame: (h) => `${bg(h)}
      <h1 class="k" style="top:260px;font-size:96px;color:#12124a">GTA 6 bahut ${h.hl('achha')} game hai, Sir!</h1>
      ${person(h, 'kapil', 'thumbsup', 330, 560, 400, { talk: true, stickers: ['glint'] })}
      ${person(h, 'amit', 'plain', 40, 560, 170, { stickers: ['dots'], tilt: 12 })}
      ${person(h, 'mansi', 'plain', 40, 860, 170, { stickers: ['anger'], tilt: 12 })}
      ${person(h, 'sakshi', 'plain', 860, 720, 170, { stickers: ['dots'], tilt: -12 })}`,
    motion: ['Kapil pops in big with a thumbs-up and glints on "GTA 6"', 'The other three turn their heads to him; "…" bubbles and an anger mark pop', 'Freeze for 0.5 s'],
    sound: ['Hit on "achha"', 'Silence on the stare'],
  },
  {
    id: 'black', n: 16, time: '50.3–51.3', theme: 'midnight',
    vo: '(silence)', keywords: ['cut to black'], assets: [],
    frame: () => `<div style="position:absolute;inset:0;background:#000"></div>`,
    motion: ['Hard cut to black, 1 s'], sound: ['Silence'],
  },
  {
    id: 'end', n: 17, time: '51.3–54.1', theme: 'paper',
    vo: '(end card)', keywords: ['CU brand'], assets: ['../../brand/logo/cu-logo-full.png'],
    frame: (h) => `${bg(h)}<img src="${h.root}/brand/logo/cu-logo-full.png" style="position:absolute;left:230px;top:720px;width:620px"><p class="lab" style="top:980px;left:0;right:0;justify-content:center;color:#12124a">creativeupaay.com</p>`,
    motion: ['Logo pops in'], sound: ['Soft resolve'],
  },
];
