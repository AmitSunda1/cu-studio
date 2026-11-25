// Stage 4 edit for the obsessed reel: scene layouts (from the approved moodboards), word-cued motion and sound.
// Built by: node trials/hyperframes/build-reel.mjs obsessed-reel-fast   (the engine adds background, wipes,
// captions, end card and audio tracks; see the header of build-reel.mjs for the helper API).
export const title = 'What are you obsessed with? (65 s, editor cut)';
export const assetsDir = 'assets/obsessed';
export const musicAt = ({ W }) => W('hook', 'minutes') - 0.2;
export const order = ['hook', 'silence', 'first', 'answers', 'source', 'hiring', 'list', 'difference', 'ask'];
export const theme = { hook: 'midnight', silence: 'paper', first: 'paper', answers: 'ultraviolet', source: 'paper', hiring: 'midnight', list: 'paper', difference: 'ultraviolet', ask: 'midnight', end: 'paper' };

// scene bodies (text kept above the 1190 px caption band)
export const body = ({ W, ACC, icon, lt, ph, hl }) => ({
  hook: `${ph('h-ph', 'team2-duo.jpg', 'left:0;top:0;width:1080px;height:1180px;border-radius:0')}
    <div class="shade" style="top:640px;height:560px"></div>
    <div class="pill" id="h-pill" style="top:270px;left:80px">${lt('watch', 60, ACC.midnight, 0, 'hook')}<span id="h-time">0:00</span></div>
    <div class="bub" id="h-bub" style="top:470px;left:560px">${icon('message-circle-question', 120, '#12124a')}</div>
    <h1 class="k" id="h-h" style="top:820px">I asked my team ${hl('one question.')}</h1>`,
  silence: `${ph('s-ph', 'laptop-duo.jpg', 'left:80px;top:270px;width:520px;height:360px;transform:rotate(-3deg)')}
    <div class="chat" style="top:670px">
      <div class="msg me" id="s-me">What are you <b>obsessed</b> with?</div>
      <div class="msg" id="s-dots"><i class="dots"><b></b><b></b><b></b></i></div>
      <div class="msg" id="s-n">${icon('circle-slash', 44, '#626269')} nothing.</div>
      <div class="msg" id="s-w">${lt('briefcase', 52, ACC.paper, W('silence', 'work'), 'silence')} ${hl('work.')}</div>
    </div>`,
  first: `<div class="card" id="f-card" style="top:280px;left:80px;right:150px">${icon('presentation', 56, '#626269')}<span class="strike" id="f-strike">"the answer that sounds good in a meeting"</span></div>
    ${ph('f-ph', 'hand-duo.jpg', 'left:80px;top:500px;width:850px;height:520px')}
    <div class="chip" id="f-chip" style="top:450px;left:780px">${icon('hand', 72, '#12124a')}</div>
    <h1 class="k" id="f-h" style="top:1050px">So I went ${hl('first.', 'f-hl')}</h1>`,
  answers: `<div class="rays" id="a-rays"></div>
    <h1 class="k" id="a-h" style="top:270px">The room ${hl('opened up.')}</h1>
    ${ph('a-p1', 'adventure2-duo.jpg', 'left:80px;top:540px;width:420px;height:540px;transform:rotate(-4deg)')}
    ${ph('a-p2', 'coding-duo.jpg', 'left:520px;top:580px;width:420px;height:540px;transform:rotate(3deg)')}
    <div class="tag" id="a-t1" style="top:1010px;left:110px">${lt('explore', 44, '#12124a', W('answers', 'adventure'), 'answers')} Adventure</div>
    <div class="tag" id="a-t2" style="top:1050px;left:560px">${lt('code', 44, '#12124a', W('answers', 'coding'), 'answers')} Coding</div>
    <div class="pill" id="a-clk" style="top:530px;left:600px;font-size:40px">${lt('clock', 52, ACC.ultraviolet, W('answers', 'hours') - 0.3, 'answers')}for hours</div>`,
  source: `<div class="qt" id="o-q" style="top:270px">${icon('quote', 120, ACC.paper)}</div>
    <h2 class="m" id="o-h" style="top:420px">Borrowed from the founder of ${hl('Wispr Flow.', 'o-hl')}</h2>
    ${ph('o-ph', 'interview-duo.jpg', 'left:80px;top:660px;width:850px;height:400px')}
    <div class="lab" id="o-lab" style="top:1100px">${icon('handshake', 40, ACC.paper)} He asks it when he hires</div>`,
  hiring: `${ph('r-ph', 'cv-duo.jpg', 'left:80px;top:270px;width:850px;height:520px')}
    <div class="list" style="top:520px;left:130px">
      <div id="r-s1">${lt('checkmark', 44, ACC.midnight, W('hiring', 'skills'), 'hiring')} Skills</div>
      <div id="r-s2">${lt('checkmark', 44, ACC.midnight, W('hiring', 'experience'), 'hiring')} Experience</div></div>
    <div class="bigq" id="r-q" data-layout-allow-occlusion style="top:200px;left:700px;z-index:2">?</div>
    <h1 class="k" id="r-h" style="top:880px">What drives you ${hl('beyond the job?')}</h1>`,
  list: `<div class="lab" id="l-lab" style="top:270px">What people said they're obsessed with</div>
    <div class="rows" style="top:360px">
      <div id="l-1"><span class="ch">${icon('puzzle', 56, ACC.paper)}</span>Solving problems</div>
      <div id="l-2"><span class="ch">${icon('hammer', 56, ACC.paper)}</span>Building things</div>
      <div id="l-3"><span class="ch">${lt('explore', 60, ACC.paper, W('list', 'adventure'), 'list')}</span>Adventure</div>
      <div id="l-4"><span class="ch">${lt('users', 60, ACC.paper, W('list', 'understanding'), 'list')}</span>Understanding people</div>
      <div id="l-5"><span class="ch">${lt('trendingUp', 60, ACC.paper, W('list', 'getting'), 'list')}</span><span>Getting better, ${hl('every day', 'l-hl')}</span></div>
    </div>`,
  difference: `${ph('d-ph', 'climb-duo.jpg', 'left:0;top:0;width:1080px;height:760px;border-radius:0')}
    <div class="shade" style="top:420px;height:360px"></div>
    <svg class="chart" style="top:600px" viewBox="0 0 850 340"><path class="ax" d="M0 320H850"/><path class="flat" id="d-g1" d="M0 300C160 180 300 150 850 150"/><path class="up" id="d-g2" d="M0 300C260 260 520 160 850 10"/><text x="600" y="190" class="tf" id="d-t1">GOOD</text><text x="560" y="60" class="tu" id="d-t2">OBSESSED</text></svg>
    <h1 class="k" id="d-h" style="top:960px;font-size:96px">Obsessed keeps ${hl('getting better.', 'd-hl')}</h1>
    <div class="inf" id="d-inf" style="top:300px;left:90px">${lt('infinity', 140, ACC.ultraviolet, W('difference', 'obsessed'), 'difference')}</div>`,
  ask: `${ph('k-ph', 'team2-duo.jpg', 'left:80px;top:270px;width:850px;height:300px;opacity:.55')}
    <h1 class="k" id="k-h" style="top:600px;font-size:180px">Would ${hl('you?', 'k-hl')}</h1>
    <div class="cmt" id="k-c" style="top:960px"><div class="who"><i></i>you</div><div class="say"><span id="k-say"></span><span class="caret" id="k-caret"></span></div>${lt('edit', 56, ACC.midnight, W('ask', 'would') + 0.2, 'ask')}</div>`,
});

// captions are skipped where the same words are already the big on-screen text
export const skip = ({ W, SC }) => [[W('hook', 'i') - 0.1, W('hook', 'and') - 0.05], [W('silence', 'what') - 0.1, W('silence', 'at') - 0.05], [W('first', 'so') - 0.1, SC.first.e],
  [W('answers', 'the') - 0.1, W('answers', 'things') - 0.05], [W('source', 'borrowed') - 0.4, SC.source.e], [W('silence', 'work') - 0.1, SC.silence.e], [W('answers', 'hours') - 0.1, SC.answers.e], [W('difference', 'keep') - 0.1, SC.difference.e], [W('hiring', 'what') - 0.1, SC.hiring.e],
  [SC.list.s, SC.list.e], [W('ask', 'would', 2) - 0.1, SC.ask.e]];

// slow push-in on photos: [inner image selector, scene, end scale]
export const pushIn = [['#h-ph-i', 'hook', 1.06], ['#s-ph-i', 'silence', 1.08], ['#f-ph-i', 'first', 1.06], ['#a-p1-i', 'answers', 1.1], ['#a-p2-i', 'answers', 1.1], ['#o-ph-i', 'source', 1.06], ['#r-ph-i', 'hiring', 1.06]];

export function animate({ W, SC, T, pop, slideUp, add, hidden }) {
  // 1 hook: frame 0 composed; timer counts to 2:00 across the line; "?" pops on "question"
  add(`tl.fromTo({v:0},{v:0},{v:120,duration:${T(W('hook', 'minutes') + 0.3 - 0.3)},ease:"power1.in",onUpdate:function(){const v=Math.round(this.targets()[0].v);document.getElementById("h-time").textContent=Math.floor(v/60)+":"+String(v%60).padStart(2,"0")}},0.3);`);
  pop('#h-bub', W('hook', 'question'), 0.3);
  add(`tl.fromTo("#h-pill",{scale:1},{scale:1.12,duration:0.18,yoyo:true,repeat:1,ease:"power2.out"},${T(W('hook', 'two'))});`);
  // 2 silence: chat
  slideUp('#s-ph', SC.silence.s + 0.05); pop('#s-me', W('silence', 'what'), 0.8, 40); pop('#s-dots', W('silence', 'at'));
  add(`tl.fromTo("#s-dots b",{opacity:0.25},{opacity:1,duration:0.3,stagger:0.12,repeat:7,yoyo:true,ease:"sine.inOut"},${T(W('silence', 'at'))});`);
  add(`tl.to("#s-dots",{opacity:0.35,duration:0.2},${T(W('silence', 'some') - 0.2)});`);
  pop('#s-n', W('silence', 'nothing')); pop('#s-w', W('silence', 'work'), 0.5);
  // 3 first: the meeting answer gets struck out, then the hand goes up
  pop('#f-card', W('first', 'but'));
  add(`tl.fromTo("#f-strike",{backgroundSize:"0% 10px"},{backgroundSize:"100% 10px",duration:0.45,ease:"power2.out"},${T(W('first', 'meeting'))});`);
  add(`tl.to("#f-card",{opacity:0.45,duration:0.3},${T(W('first', 'meeting') + 0.5)});`);
  hidden.add('#f-ph'); add(`tl.fromTo("#f-ph",{opacity:1,clipPath:"inset(100% 0 0 0 round 36px)"},{opacity:1,clipPath:"inset(0% 0 0 0 round 36px)",duration:0.55,ease:"power3.out"},${T(W('first', 'so'))});`);
  pop('#f-chip', W('first', 'i', 2), 0.3);
  add(`tl.fromTo("#f-chip",{rotation:10},{rotation:-12,duration:0.25,yoyo:true,repeat:3,ease:"sine.inOut"},${T(W('first', 'i', 2) + 0.35)});`);
  pop('#f-h', W('first', 'so')); pop('#f-hl', W('first', 'first'), 0.4, 0);
  // 4 answers: light burst, photo tiles fly in on their words, clock on "hours"
  add(`tl.fromTo("#a-rays",{rotation:0,opacity:0},{rotation:24,opacity:1,duration:${T(SC.answers.e - W('answers', 'opened'))},ease:"none"},${T(W('answers', 'opened'))});`);
  pop('#a-h', W('answers', 'room'));
  hidden.add('#a-p1'); add(`tl.fromTo("#a-p1",{opacity:0,x:-500,rotation:-20},{opacity:1,x:0,rotation:-4,duration:0.5,ease:"back.out(1.4)"},${T(W('answers', 'adventure'))});`);
  hidden.add('#a-p2'); add(`tl.fromTo("#a-p2",{opacity:0,x:500,rotation:20},{opacity:1,x:0,rotation:3,duration:0.5,ease:"back.out(1.4)"},${T(W('answers', 'coding'))});`);
  pop('#a-t1', W('answers', 'adventure') + 0.2); pop('#a-t2', W('answers', 'coding') + 0.2); pop('#a-clk', W('answers', 'hours') - 0.3);
  // 5 source
  pop('#o-q', W('source', 'i') - 0.1, 0.3); pop('#o-h', W('source', 'borrowed')); pop('#o-hl', W('source', 'wispr'), 0.5, 0);
  slideUp('#o-ph', W('source', 'he')); pop('#o-lab', W('source', 'asks'));
  // 6 hiring: ticks, then the "?" punches through the CV
  slideUp('#r-ph', SC.hiring.s + 0.05); pop('#r-s1', W('hiring', 'skills')); pop('#r-s2', W('hiring', 'experience'));
  pop('#r-h', W('hiring', 'what', 2));
  hidden.add('#r-q'); add(`tl.fromTo("#r-q",{opacity:1,scale:1.8,rotation:-20},{opacity:1,scale:1,rotation:0,duration:0.4,ease:"power4.out",immediateRender:false},${T(W('hiring', 'beyond'))});`);
  add(`tl.to("#r-ph",{opacity:0.4,duration:0.3},${T(W('hiring', 'beyond'))});`);
  // 7 list: each row lands on its word
  pop('#l-lab', SC.list.s + 0.1);
  [['#l-1', 'solving'], ['#l-2', 'building'], ['#l-3', 'adventure'], ['#l-4', 'understanding'], ['#l-5', 'getting']].forEach(([sel, w]) => { hidden.add(sel); add(`tl.fromTo("${sel}",{opacity:0,x:-80},{opacity:1,x:0,duration:0.4,ease:"back.out(1.6)"},${T(W('list', w))});`); });
  pop('#l-hl', W('list', 'every'), 0.4, 0);
  // 8 difference: "good" flattens, "obsessed" keeps climbing
  add(`tl.fromTo("#d-ph-i",{scale:1.08,y:40},{scale:1.08,y:-60,duration:${T(SC.difference.e - SC.difference.s)},ease:"none"},${T(SC.difference.s)});`);
  add(`tl.fromTo("#d-g1",{strokeDashoffset:960},{strokeDashoffset:0,duration:1.4,ease:"power2.out"},${T(W('difference', 'good'))});`);
  pop('#d-t1', W('difference', 'capable'));
  add(`tl.fromTo("#d-g2",{strokeDashoffset:1000},{strokeDashoffset:0,duration:${T(W('difference', 'better') - W('difference', 'obsessed') + 0.2)},ease:"power2.in"},${T(W('difference', 'obsessed'))});`);
  pop('#d-t2', W('difference', 'better')); pop('#d-inf', W('difference', 'obsessed'), 0.4);
  pop('#d-h', W('difference', 'being', 2)); pop('#d-hl', W('difference', 'getting'), 0.5, 0);
  // 9 ask: callback to the hook photo, the comment types, "Would you?" slams in
  hidden.add('#k-ph'); add(`tl.fromTo("#k-ph",{opacity:0,scale:1.06},{opacity:0.55,scale:1,duration:0.6,ease:"power2.out"},${T(SC.ask.s + 0.05)});`);
  pop('#k-c', W('ask', 'would'));
  const typed = "I'm obsessed with…"; const t0 = W('ask', 'would') + 0.25, t1 = W('ask', 'would', 2) - 0.1;
  add(`tl.fromTo({n:0},{n:0},{n:${typed.length},duration:${T(t1 - t0)},ease:"none",onUpdate:function(){document.getElementById("k-say").textContent=${JSON.stringify(typed)}.slice(0,Math.round(this.targets()[0].n))}},${T(t0)});`);
  add(`tl.fromTo("#k-caret",{opacity:1},{opacity:0,duration:0.25,repeat:${Math.floor((SC.ask.e - t0) / 0.5) * 2 - 1},yoyo:true,ease:"steps(1)"},${T(t0)});`);
  hidden.add('#k-h'); add(`tl.fromTo("#k-h",{opacity:0,scale:1.8},{opacity:1,scale:1,duration:0.3,ease:"power4.out"},${T(W('ask', 'would', 2))});`);
  pop('#k-hl', W('ask', 'you'), 0.5, 0);
}

// one hero sound per scene (the engine adds a whoosh on every cut and the end-card resolve)
export const cues = ({ W }) => [
  { t: 0.3, type: 'tick', n: 9, dur: W('hook', 'minutes') }, { t: W('hook', 'question'), type: 'pop' },
  { t: W('silence', 'what'), type: 'send' }, { t: W('silence', 'at'), type: 'click', n: 14, dur: W('silence', 'some') - 0.3 - W('silence', 'at') }, { t: W('silence', 'nothing'), type: 'pop' }, { t: W('silence', 'work'), type: 'thud' },
  { t: W('first', 'meeting'), type: 'scratch' }, { t: W('first', 'first'), type: 'pop' },
  { t: W('answers', 'and'), type: 'riser', dur: W('answers', 'opened') - W('answers', 'and') + 0.1 }, { t: W('answers', 'adventure'), type: 'pop' }, { t: W('answers', 'coding'), type: 'pop' }, { t: W('answers', 'hours') - 0.3, type: 'tick', n: 8, dur: 0.6 },
  { t: W('source', 'borrowed'), type: 'flip' }, { t: W('source', 'hires'), type: 'pop' },
  { t: W('hiring', 'skills'), type: 'tick', n: 1, dur: 0.1 }, { t: W('hiring', 'experience'), type: 'tick', n: 1, dur: 0.1 },
  { t: W('hiring', 'what'), type: 'riser', dur: W('hiring', 'beyond') - W('hiring', 'what') }, { t: W('hiring', 'beyond'), type: 'hit' },
  ...['solving', 'building', 'adventure', 'understanding', 'getting'].map((w) => ({ t: W('list', w), type: 'pop' })), { t: W('list', 'every'), type: 'flip', n: 8, dur: 0.7 },
  { t: W('difference', 'obsessed'), type: 'riser', dur: W('difference', 'better') - W('difference', 'obsessed') + 0.2 },
  { t: W('ask', 'would') + 0.25, type: 'click', n: 16, dur: W('ask', 'would', 2) - 0.35 - W('ask', 'would') }, { t: W('ask', 'would', 2), type: 'thud' },
];
