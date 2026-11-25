// Stage 4 edit for the GTA-6 skit: layouts from content/gta6-reel-moodboard.mjs, every move on its spoken
// (Hinglish caption) word. Build: node trials/hyperframes/build-reel.mjs gta6-reel · render: render-reel.mjs gta6-reel
export const title = "Dear Saurabh Sir & Manish Sir, We're Sorry!";
export const assetsDir = 'assets/gta6';
export const order = ['hook', 'galti', 'jaipur', 'masoom', 'monitor', 'console', 'kahani', 'shakti', 'card', 'shaam', 'marzi', 'eod', 'gta', 'baat', 'punch'];
export const theme = Object.fromEntries([...order, 'end'].map((id) => [id, 'paper']));
export const blackBefore = 1.0;
export const hardCuts = ['black', 'end'];
export const musicAt = () => 0.4;
export const coverAt = () => 0.1;
export const ground = 'url(assets/stock/bg-grid-duo.jpg) center/cover';

const SHIRT = { amit: '#5822d8', kapil: '#ffc53d', sakshi: '#c380e9', mansi: '#6b4fc8' };
const NAME = { amit: 'Amit', kapil: 'Kapil', sakshi: 'Sakshi', mansi: 'Mansi' };
const FOUR = ['amit', 'kapil', 'sakshi', 'mansi'];
const bgGrid = (dim = 0, id = '') => `${dim ? `<div${id ? ` id="${id}"` : ''} style="position:absolute;inset:0;background:#12124a;opacity:${dim}"></div>` : ''}`;
const pill = 'position:absolute;display:flex;align-items:center;gap:14px;padding:16px 28px;border-radius:999px;background:#fff;border:4px solid #12124a;font:700 40px/1 var(--font-text);color:#12124a';

// a character (ids: <p>, <p>-h head, <p>-<sticker>): drawn body + real face; stickers carry the expression
function person(h, p, who, pose, x, y, s, o = {}) {
  const head = s * 0.74, headBottom = s * 0.86, headTop = s * 1.6 - headBottom - head;
  const st = (k, n, px, l, t, extra = '') => `<div id="${p}-${k}" style="position:absolute;left:${l}px;top:${t}px;${extra}">${h.icon('d-' + n, px, '#5822d8')}</div>`;
  const S = o.stickers || [];
  const pieces = {
    sweat: () => st('sweat', 'sweat', s * 0.22, s * 0.78, headTop + s * 0.02),
    halo: () => st('halo', 'halo', s * 0.62, s * 0.19, headTop - s * 0.24),
    spiral: () => st('sp1', 'spiral', s * 0.24, s * 0.25, headTop + head * 0.3) + st('sp2', 'spiral', s * 0.24, s * 0.51, headTop + head * 0.3),
    shock: () => st('shock', 'shock', s * 0.3, s * 0.78, headTop - s * 0.1),
    anger: () => st('anger', 'anger', s * 0.24, s * 0.02, headTop - s * 0.02),
    dots: () => st('dots', 'dots', s * 0.42, s * 0.7, headTop - s * 0.3),
    glint: () => st('glint', 'glint', s * 0.22, s * 0.86, headTop - s * 0.05),
  };
  return `<div id="${p}" style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s * 1.6}px">
    ${S.includes('swirl') ? st('swirl', 'swirl', s * 1.1, -s * 0.05, headTop - s * 0.14, 'opacity:.9') : ''}
    <div style="position:absolute;left:0;bottom:0">${h.icon('d-body-' + pose, s, SHIRT[who])}</div>
    ${o.talk ? `<div id="${p}-ring" style="position:absolute;left:${(s - head * 0.92) / 2}px;top:${headTop - s * 0.02}px;width:${head * 0.92}px;height:${head * 1.04}px;border-radius:50%;border:${Math.max(6, s * 0.035)}px solid var(--brand-marigold);box-shadow:0 0 0 ${s * 0.02}px #fff"></div>` : ''}
    <img id="${p}-h" src="assets/stock/face-${who}-duo.png" alt="" style="position:absolute;left:${(s - head * 0.8) / 2}px;bottom:${headBottom}px;height:${head}px;transform-origin:50% 90%;filter:drop-shadow(0 6px 10px rgba(18,18,74,.25))">
    ${o.tag ? `<span style="position:absolute;left:50%;transform:translateX(-50%);bottom:${s * 0.08}px;background:#fff;color:#12124a;border:3px solid #12124a;border-radius:999px;padding:4px 14px;font:500 ${Math.max(20, s * 0.09)}px/1 var(--font-mono);letter-spacing:.06em;text-transform:uppercase;white-space:nowrap">${NAME[who]}</span>` : ''}
    ${S.filter((k) => k !== 'swirl').map((k) => pieces[k]()).join('')}</div>`;
}
const row = (h, sc, pose, o = {}, y = 790, s = 230) => FOUR.map((w, i) => person(h, `${sc}-${w}`, w, pose, 50 + i * (s + 20), y, s, { tag: o.tag, stickers: o.stickers, talk: o.talk === w })).join('');
const monitor = (h, id, x, y, s, lit = true) => `<div id="${id}" style="position:absolute;left:${x}px;top:${y}px">${h.icon('d-monitor', s, '#12124a')}<div id="${id}-scr" style="position:absolute;left:${s * 0.095}px;top:${s * 0.17}px;width:${s * 0.81}px;height:${s * 0.485}px;overflow:hidden;border-radius:6px;${lit ? '' : 'opacity:0'}">${h.icon('d-gamescreen', s * 0.81, '#fff')}</div></div>`;

export const body = (h) => {
  const { icon, hl, lt, W } = h;
  return {
    hook: `${bgGrid()}
      <div id="hk-pill" style="${pill};left:80px;top:270px">${icon('mail', 44, '#5822d8')} Dear Saurabh Sir &amp; Manish Sir,</div>
      <h1 class="k" id="hk-t" style="top:420px;color:#12124a">We're ${hl('Sorry!', 'hk-hl')}</h1>
      ${row(h, 'hk', 'folded', { stickers: ['sweat'] })}`,
    galti: `${bgGrid()}
      <h2 class="m" id="ga-t" style="top:270px;color:#12124a">Badi ${hl('galti', 'ga-hl')} ho gayi…</h2>
      <div id="ga-pill" style="${pill};left:250px;top:520px;transform:rotate(-5deg);background:#5822d8;color:#fff;font-size:52px">${icon('zap', 52, '#ffc53d')} VASHIKARAN!</div>
      ${row(h, 'ga', 'plain', { stickers: ['swirl', 'spiral'] })}`,
    jaipur: `${bgGrid()}
      <p class="lab" id="jp-lab" style="top:270px;color:#5822d8">Udaipur → Jaipur · Event day</p>
      <svg style="position:absolute;left:0;top:500px" width="1080" height="80"><path d="M130 40H950" stroke="#12124a" stroke-width="8" stroke-dasharray="4 22" stroke-linecap="round"/></svg>
      <div style="position:absolute;left:70px;top:350px;text-align:center;font:700 34px var(--font-text);color:#12124a">${icon('map-pin', 70, '#5822d8')}<br>Udaipur</div>
      <div id="jp-pin" style="position:absolute;left:880px;top:350px;text-align:center;font:700 34px var(--font-text);color:#12124a">${icon('map-pin', 70, '#5822d8')}<br>Jaipur</div>
      <div id="jp-ev" style="${pill};left:760px;top:250px;background:var(--brand-marigold);font-size:32px;padding:10px 20px">${icon('sparkles', 34, '#12124a')} Event</div>
      <div id="jp-train" style="position:absolute;left:150px;top:600px;width:800px;height:400px;overflow:hidden">
        <div style="margin-top:-200px">${icon('d-train', 800, '#5822d8')}</div>
        <img id="jp-s" src="assets/stock/face-sourabh-duo.png" alt="" style="position:absolute;left:318px;top:96px;height:130px">
        <img id="jp-m" src="assets/stock/face-manish-duo.png" alt="" style="position:absolute;left:478px;top:100px;height:126px">
      </div>
      <h2 class="m" id="jp-t" style="top:1040px;color:#12124a">Sir log ${hl('Jaipur', 'jp-hl')} gaye.</h2>`,
    masoom: `${bgGrid()}
      <h1 class="k" id="ms-t" style="top:300px;color:#12124a">Chaar ${hl('masoom', 'ms-hl')} log.</h1>
      ${row(h, 'ms', 'plain', { stickers: ['halo'], tag: true, talk: 'kapil' })}`,
    monitor: `${bgGrid()}
      <p class="lab" id="mo-lab" style="top:270px;color:#5822d8">${icon('eye', 36, '#5822d8')} Sir ka extra monitor</p>
      <div id="mo-mon" style="position:absolute;left:190px;top:330px">${icon('d-monitor', 700, '#12124a')}</div>
      <div id="mo-gl" style="position:absolute;left:770px;top:360px">${icon('d-glint', 130, '#fff')}</div>
      <div id="mo-tag" style="${pill};left:700px;top:600px;background:var(--brand-marigold);font-size:56px">27″</div>
      ${FOUR.map((w, i) => person(h, `mo-${w}`, w, 'plain', 60 + i * 190, 900, 170, { talk: w === 'sakshi' })).join('')}`,
    console: `${bgGrid()}
      <h2 class="m" id="co-t" style="top:270px;color:#12124a">PS5 se ${hl('connect.', 'co-hl')}</h2>
      ${monitor(h, 'co-mon', 80, 470, 560, false)}
      <div id="co-con" style="position:absolute;left:700px;top:470px">${icon('d-console', 280, '#5822d8')}</div>
      <svg style="position:absolute;left:0;top:0" width="1080" height="1300"><path id="co-cable" d="M840 740C820 860 700 900 560 880S380 860 360 830" stroke="#12124a" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="700" stroke-dashoffset="700"/></svg>
      <div id="co-plug" style="position:absolute;left:560px;top:850px">${icon('plug-zap', 70, '#5822d8')}</div>
      ${person(h, 'co-mansi', 'mansi', 'plain', 830, 880, 180, { talk: true })}`,
    kahani: `${bgGrid(0.35, 'ka-dim')}
      <div id="ka-rib" style="position:absolute;left:40px;right:40px;top:320px;transform:rotate(-3deg);background:#12124a;padding:30px 40px;border-radius:20px;box-shadow:0 14px 0 var(--brand-marigold)">
        <h2 style="margin:0;font:800 84px/1.02 var(--font-display);color:#fff">Asli ${hl('kahani')} ab shuru…</h2></div>
      <div id="ka-row" style="position:absolute;inset:0;transform-origin:50% 75%">${row(h, 'ka', 'plain', { talk: 'amit' }, 740, 240)}</div>`,
    shakti: `${bgGrid(0.15)}
      <h2 class="m" id="sh-t" style="top:260px;color:#12124a">Kis ${hl('shakti', 'sh-hl')} ne control kiya…</h2>
      ${FOUR.map((w, i) => `<div id="sh-str${i}" style="position:absolute;left:${50 + i * 250}px;top:500px">${icon('d-strings', 230, '#12124a')}</div>`).join('')}
      ${row(h, 'sh', 'plain', { talk: 'kapil' })}`,
    card: `${bgGrid()}
      <h2 class="m" id="cd-t" style="top:260px;color:#12124a">Company card se ${hl('GTA 6!', 'cd-hl')}</h2>
      <div id="cd-card" style="position:absolute;left:70px;top:420px;transform:rotate(-8deg)">${icon('d-card', 460, '#5822d8')}</div>
      <div id="cd-pay" style="${pill};left:440px;top:650px;border-color:#1f8a5b;font-size:36px">${lt('checkmark', 56, '#1f8a5b', W('card', 'khareed'), 'card')} Payment successful</div>
      ${FOUR.map((w, i) => person(h, `cd-${w}`, w, 'plain', 60 + i * 190, 900, 170, { talk: w === 'sakshi', stickers: ['shock'] })).join('')}`,
    shaam: `${bgGrid()}<div id="sa-eve" style="position:absolute;inset:0;background:#c380e9;opacity:0;mix-blend-mode:multiply"></div>
      <div id="sa-sun" style="position:absolute;left:80px;top:260px">${icon('sun', 110, '#ffc53d')}</div>
      <div id="sa-moon" style="position:absolute;left:880px;top:260px">${icon('moon', 110, '#5822d8')}</div>
      <div id="sa-pill" style="${pill};left:390px;top:270px">${lt('clock', 56, '#5822d8', W('shaam', 'phir'), 'shaam')} subah → shaam</div>
      ${monitor(h, 'sa-mon', 230, 380, 620)}
      ${row(h, 'sa', 'controller', { talk: 'mansi' }, 820, 230)}`,
    marzi: `${bgGrid()}
      <h1 class="k" id="mz-t" style="top:300px;color:#12124a">Humari ${hl('marzi', 'mz-hl')} nahi thi.</h1>
      ${row(h, 'mz', 'folded', { stickers: ['sweat'], talk: 'amit' })}`,
    eod: `${bgGrid()}
      <div class="cmt" id="eo-c" style="top:300px;background:#fff;color:#12124a;border:4px solid #12124a">
        <div class="who">${icon('mail-pen', 48, '#5822d8')} EOD update</div>
        <div class="say" style="color:#12124a"><span id="eo-say"></span><span class="caret" id="eo-caret" style="margin-left:6px"></span></div></div>
      ${person(h, 'eo-sakshi', 'sakshi', 'plain', 80, 760, 250, { talk: true, tag: true })}`,
    gta: `${bgGrid()}
      <div class="cmt" id="gt-c" style="top:300px;background:#fff;color:#12124a;border:4px solid #12124a">
        <div class="who">${icon('mail-pen', 48, '#5822d8')} EOD update</div>
        <div class="say" style="color:#12124a">Aaj ka kaam:</div>
        <div class="say" id="gt-line" style="color:#12124a">${icon('gamepad-2', 52, '#5822d8')} ${hl('+ thoda sa GTA 6')}</div></div>
      ${person(h, 'gt-mansi', 'mansi', 'plain', 760, 760, 250, { talk: true, tag: true })}`,
    baat: `${bgGrid()}
      <div id="bt-b" style="position:absolute;left:470px;top:300px">${icon('d-bubble', 460, '#fff')}</div>
      <p id="bt-t" style="position:absolute;left:540px;top:440px;margin:0;font:800 64px/1.05 var(--font-display);color:#12124a">Ek baat aur—</p>
      ${person(h, 'bt-amit', 'amit', 'plain', 120, 600, 360, { talk: true, tag: true })}`,
    punch: `${bgGrid()}
      <h1 class="k" id="pu-t" style="top:260px;font-size:96px;color:#12124a">GTA 6 bahut ${hl('achha', 'pu-hl')} game hai, Sir!</h1>
      ${person(h, 'pu-kapil', 'kapil', 'thumbsup', 330, 560, 400, { talk: true, stickers: ['glint'] })}
      ${person(h, 'pu-amit', 'amit', 'plain', 40, 560, 170, { stickers: ['dots'] })}
      ${person(h, 'pu-mansi', 'mansi', 'plain', 40, 860, 170, { stickers: ['anger'] })}
      ${person(h, 'pu-sakshi', 'sakshi', 'plain', 860, 720, 170, { stickers: ['dots'] })}`,
  };
};
export const endBody = () => `${bgGrid()}<img id="e-logo" src="assets/cu-logo-full.png" alt="Creative Upaay" style="position:absolute;left:50%;top:720px;width:620px;margin-left:-310px">
    <p class="lab" id="e-url" style="top:980px;justify-content:center;left:0;right:0;color:#12124a">creativeupaay.com</p>`;

// the punchline is already big on screen: no caption there
export const skip = ({ SC }) => [[SC.punch.s, SC.punch.e]];

export function animate({ W, SC, T, pop, slideUp, add, hidden }) {
  const bob = (sel, t0, t1, amp = 6, d = 0.45) => add(`tl.fromTo("${sel}",{y:0},{y:${-amp},duration:${d},yoyo:true,repeat:${Math.max(1, Math.floor((t1 - t0) / d) - 1)},ease:"sine.inOut"},${T(t0)});`);
  const tilt = (sel, t, deg, d = 0.3) => add(`tl.to("${sel}",{rotation:${deg},duration:${d},ease:"back.out(2)"},${T(t)});`);
  const slam = (sel, t, from = 1.7) => { hidden.add(sel); add(`tl.fromTo("${sel}",{opacity:0,scale:${from}},{opacity:1,scale:1,duration:0.28,ease:"power4.out"},${T(t)});`); };
  const fade = (sel, t, to = 1, d = 0.3) => add(`tl.to("${sel}",{opacity:${to},duration:${d}},${T(t)});`);

  // 1 hook: frame 0 composed; nervous bob, sweat slides on "maafi", heads bow on "maangte"
  FOUR.forEach((w, i) => bob(`#hk-${w}-h`, 0.2 + i * 0.1, SC.hook.e, 5));
  FOUR.forEach((w) => add(`tl.fromTo("#hk-${w}-sweat",{y:0},{y:26,duration:0.5,ease:"power2.in"},${T(W('hook', 'maafi'))});`));
  FOUR.forEach((w, i) => tilt(`#hk-${w}-h`, W('hook', 'maangte') + i * 0.04, i % 2 ? 8 : -8));
  // 2 galti: stamp on "galti", heads shake on "nahi", hypnosis on "vashikaran"
  slideUp('#ga-t', SC.galti.s + 0.05); pop('#ga-hl', W('galti', 'galti'), 1.6, 0);
  FOUR.forEach((w) => add(`tl.fromTo("#ga-${w}-h",{x:0},{x:14,duration:0.08,yoyo:true,repeat:5,ease:"sine.inOut"},${T(W('galti', 'nahi'))});`));
  FOUR.forEach((w, i) => { hidden.add(`#ga-${w}-swirl`); add(`tl.fromTo("#ga-${w}-swirl",{opacity:0,rotation:0},{opacity:0.9,rotation:${i % 2 ? -540 : 540},duration:${T(SC.galti.e - W('galti', 'vashikaran'))},ease:"none"},${T(W('galti', 'vashikaran'))});`);
    pop(`#ga-${w}-sp1`, W('galti', 'vashikaran') + 0.05 * i, 0.2, 0); pop(`#ga-${w}-sp2`, W('galti', 'vashikaran') + 0.05 * i, 0.2, 0); });
  slam('#ga-pill', W('galti', 'vashikaran'));
  // 3 jaipur: the train rolls Udaipur -> Jaipur, arrives on "Jaipur"
  pop('#jp-lab', SC.jaipur.s + 0.1);
  add(`tl.fromTo("#jp-train",{x:-760},{x:0,duration:${T(W('jaipur', 'jaipur') - SC.jaipur.s)},ease:"power1.inOut"},${T(SC.jaipur.s)});`);
  bob('#jp-train', SC.jaipur.s, SC.jaipur.e, 4, 0.18);
  bob('#jp-s', SC.jaipur.s + 0.1, SC.jaipur.e, 6, 0.3); bob('#jp-m', SC.jaipur.s + 0.25, SC.jaipur.e, 6, 0.3);
  pop('#jp-ev', W('jaipur', 'event'), 0.4); pop('#jp-t', W('jaipur', 'jaipur')); pop('#jp-hl', W('jaipur', 'jaipur'), 0.5, 0);
  // 4 masoom: halos land one by one, title on "chaar"
  slideUp('#ms-amit', SC.masoom.s); slideUp('#ms-kapil', SC.masoom.s + 0.06); slideUp('#ms-sakshi', SC.masoom.s + 0.12); slideUp('#ms-mansi', SC.masoom.s + 0.18);
  pop('#ms-t', W('masoom', 'chaar')); pop('#ms-hl', W('masoom', 'masoom'), 0.5, 0);
  FOUR.forEach((w, i) => { hidden.add(`#ms-${w}-halo`); add(`tl.fromTo("#ms-${w}-halo",{opacity:0,y:-120},{opacity:1,y:0,duration:0.3,ease:"bounce.out"},${T(W('masoom', 'chaar') + i * 0.12)});`); });
  // 5 monitor: heads turn on "nazar", monitor rises, glint + 27" on "27-inch"
  pop('#mo-lab', SC.monitor.s + 0.1);
  FOUR.forEach((w, i) => tilt(`#mo-${w}-h`, W('monitor', 'nazar') + i * 0.05, 10));
  slideUp('#mo-mon', W('monitor', 'nazar') + 0.15);
  pop('#mo-gl', W('monitor', '27-inch'), 0.2, 0); pop('#mo-tag', W('monitor', '27-inch'), 0.4);
  add(`tl.to("#mo-gl",{rotation:90,duration:0.6},${T(W('monitor', '27-inch'))});`);
  // 6 console: console slides in, cable draws, screen lights on "connect"
  pop('#co-t', W('console', 'aur')); pop('#co-hl', W('console', 'connect'), 0.5, 0);
  add(`tl.fromTo("#co-con",{x:420},{x:0,duration:0.5,ease:"power3.out"},${T(SC.console.s + 0.05)});`);
  add(`tl.to("#co-cable",{strokeDashoffset:0,duration:${T(W('console', 'connect') - W('console', 'ps5'))},ease:"power1.inOut"},${T(W('console', 'ps5'))});`);
  pop('#co-plug', W('console', 'connect'), 0.3); fade('#co-mon-scr', W('console', 'connect'), 1, 0.15);
  add(`tl.fromTo("#co-mon-scr",{filter:"brightness(2)"},{filter:"brightness(1)",duration:0.5},${T(W('console', 'connect'))});`);
  // 7 kahani: dim, push in, ribbon slams on "asli"
  hidden.add('#ka-dim'); add(`tl.fromTo("#ka-dim",{opacity:0},{opacity:0.35,duration:0.5},${T(SC.kahani.s)});`);
  add(`tl.fromTo("#ka-row",{scale:1},{scale:1.08,duration:${T(SC.kahani.e - SC.kahani.s)},ease:"none"},${T(SC.kahani.s)});`);
  slam('#ka-rib', W('kahani', 'asli'), 1.5);
  // 8 shakti: strings drop on "shakti", puppets bob out of sync
  pop('#sh-t', W('shakti', 'pata')); pop('#sh-hl', W('shakti', 'shakti'), 0.5, 0);
  FOUR.forEach((w, i) => { hidden.add(`#sh-str${i}`); add(`tl.fromTo("#sh-str${i}",{opacity:1,y:-560},{opacity:1,y:0,duration:0.45,ease:"bounce.out",immediateRender:false},${T(W('shakti', 'shakti') + i * 0.06)});`);
    add(`tl.set("#sh-str${i}",{opacity:0},${T(SC.shakti.s)});`);
    bob(`#sh-${w}`, W('shakti', 'shakti') + 0.4 + i * 0.11, SC.shakti.e, 22, 0.32); });
  // 9 card: swipe on "card", paid on "khareed", shock on everyone
  pop('#cd-t', W('card', 'company')); pop('#cd-hl', W('card', 'gta'), 0.5, 0);
  hidden.add('#cd-card'); add(`tl.fromTo("#cd-card",{opacity:0,x:-600,rotation:-30},{opacity:1,x:0,rotation:-8,duration:0.45,ease:"back.out(1.4)"},${T(W('card', 'card'))});`);
  pop('#cd-pay', W('card', 'khareed') - 0.1);
  FOUR.forEach((w, i) => pop(`#cd-${w}-shock`, W('card', 'khareed') + 0.1 + i * 0.07, 0.2, 0));
  // 10 shaam: controllers, sun arcs into the moon on "shaam", evening tint
  pop('#sa-pill', SC.shaam.s + 0.1);
  add(`tl.to("#sa-sun",{x:800,y:-60,rotation:180,opacity:0,duration:${T(W('shaam', 'shaam') - SC.shaam.s)},ease:"power1.inOut"},${T(SC.shaam.s)});`);
  pop('#sa-moon', W('shaam', 'shaam'), 0.3);
  add(`tl.to("#sa-eve",{opacity:0.35,duration:0.8},${T(W('shaam', 'shaam'))});`);
  FOUR.forEach((w, i) => bob(`#sa-${w}`, SC.shaam.s + i * 0.07, SC.shaam.e, 5, 0.16));
  // 11 marzi: back to the hook row, sweat returns
  slideUp('#mz-amit', SC.marzi.s); slideUp('#mz-kapil', SC.marzi.s + 0.05); slideUp('#mz-sakshi', SC.marzi.s + 0.1); slideUp('#mz-mansi', SC.marzi.s + 0.15);
  pop('#mz-t', W('marzi', 'humari')); pop('#mz-hl', W('marzi', 'marzi'), 0.5, 0);
  FOUR.forEach((w, i) => pop(`#mz-${w}-sweat`, W('marzi', 'nahi') + i * 0.06, 0.3, -20));
  // 12 eod: the card types "Aaj ka kaam:"
  slideUp('#eo-c', SC.eod.s + 0.05); slideUp('#eo-sakshi', SC.eod.s + 0.1);
  const typed = 'Aaj ka kaam:'; const t0 = W('eod', 'update'), t1 = W('eod', 'the') - 0.1;
  add(`tl.fromTo({n:0},{n:0},{n:${typed.length},duration:${T(t1 - t0)},ease:"none",onUpdate:function(){document.getElementById("eo-say").textContent=${JSON.stringify(typed)}.slice(0,Math.round(this.targets()[0].n))}},${T(t0)});`);
  add(`tl.fromTo("#eo-caret",{opacity:1},{opacity:0,duration:0.25,repeat:${Math.floor((SC.eod.e - SC.eod.s) / 0.5) * 2 - 1},yoyo:true,ease:"steps(1)"},${T(SC.eod.s)});`);
  // 13 gta: the GTA line adds itself and the card shakes
  slideUp('#gt-mansi', SC.gta.s + 0.05); pop('#gt-line', W('gta', 'gta'), 0.4);
  add(`tl.fromTo("#gt-c",{rotation:0},{rotation:2.5,duration:0.06,yoyo:true,repeat:7,ease:"none"},${T(W('gta', 'gta'))});`);
  // 14 baat: Amit leans in, the bubble opens and gets cut off
  slideUp('#bt-amit', SC.baat.s); pop('#bt-b', W('baat', 'ek'), 0.4); pop('#bt-t', W('baat', 'ek') + 0.1);
  tilt('#bt-amit-h', W('baat', 'haan'), -6);
  // 15 punch: Kapil pops in big on "GTA"; the others turn and stare, freeze
  pop('#pu-kapil', SC.punch.s, 0.5, 80); pop('#pu-t', W('punch', 'gta')); pop('#pu-hl', W('punch', 'achha'), 0.5, 0);
  pop('#pu-kapil-glint', W('punch', 'achha'), 0.2, 0); add(`tl.to("#pu-kapil-glint",{rotation:120,duration:1.2},${T(W('punch', 'achha'))});`);
  tilt('#pu-amit-h', W('punch', 'bahut'), 14); tilt('#pu-mansi-h', W('punch', 'bahut') + 0.08, 14); tilt('#pu-sakshi-h', W('punch', 'bahut') + 0.04, -14);
  pop('#pu-amit-dots', W('punch', 'sir') + 0.1, 0.3); pop('#pu-sakshi-dots', W('punch', 'sir') + 0.2, 0.3); pop('#pu-mansi-anger', W('punch', 'sir') + 0.3, 0.3);
}

// sound: one hero sound per scene on its word (the engine adds a whoosh per wiped cut and the end resolve)
export const cues = ({ W, SC }) => [
  { t: 0.3, type: 'chime' }, { t: W('hook', 'maafi'), type: 'pop' },
  { t: W('galti', 'galti'), type: 'thud' }, { t: W('galti', 'nahi'), type: 'click', n: 6, dur: 0.5 }, { t: W('galti', 'humpe'), type: 'riser', dur: W('galti', 'vashikaran') - W('galti', 'humpe') + 0.2 }, { t: W('galti', 'vashikaran'), type: 'hit' },
  { t: SC.jaipur.s + 0.1, type: 'tick', n: 12, dur: W('jaipur', 'jaipur') - SC.jaipur.s - 0.2 }, { t: W('jaipur', 'jaipur'), type: 'chime' }, { t: W('jaipur', 'event'), type: 'pop' },
  ...FOUR.map((_, i) => ({ t: W('masoom', 'chaar') + i * 0.12, type: 'pop' })), { t: W('masoom', 'masoom'), type: 'chime' },
  { t: W('monitor', 'nazar') + 0.15, type: 'whoosh' }, { t: W('monitor', '27-inch'), type: 'pop' },
  { t: SC.console.s + 0.05, type: 'whoosh' }, { t: W('console', 'connect'), type: 'send' },
  { t: W('kahani', 'asli'), type: 'thud' },
  { t: W('shakti', 'shakti'), type: 'scratch' }, { t: W('shakti', 'control'), type: 'pop' },
  { t: W('card', 'card'), type: 'whoosh' }, { t: W('card', 'khareed'), type: 'chime' }, { t: W('card', 'khareed') + 0.1, type: 'pop' },
  { t: SC.shaam.s + 0.1, type: 'tick', n: 14, dur: W('shaam', 'shaam') - SC.shaam.s }, { t: W('shaam', 'shaam'), type: 'whoosh' },
  { t: W('marzi', 'marzi'), type: 'thud' },
  { t: W('eod', 'update'), type: 'click', n: 12, dur: W('eod', 'the') - W('eod', 'update') - 0.1 },
  { t: W('gta', 'gta'), type: 'scratch' },
  { t: W('punch', 'achha'), type: 'hit' }, { t: W('punch', 'sir') + 0.15, type: 'pop' },
];
