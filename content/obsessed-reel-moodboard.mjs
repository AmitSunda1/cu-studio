// Stage 3 moodboards for the obsessed reel (65 s story, HyperFrames edit).
// Each scene: key frame (1080x1920 HTML using collected assets) + editor notes.
// Helpers available in frame(): ph(file, style) photo card, ic(name, px, color) Lucide icon, lt(name, px) Lottie (end frame), hl(text) marigold highlight.
export const assetsDir = 'assets/obsessed';
export const scenes = [
  {
    id: 'hook', n: 1, time: '0.0–4.9', theme: 'midnight',
    vo: 'I asked my team one question, and nobody said a word for two minutes.',
    keywords: ['team', 'one question', 'silence', 'two minutes'],
    assets: ['stock/team2-duo.jpg', 'lottie/watch.json', 'icons/message-circle-question.svg'],
    frame: (h) => `
      ${h.ph('team2-duo.jpg', 'left:0;top:0;width:1080px;height:1180px;border-radius:0')}
      <div style="position:absolute;left:0;top:640px;width:1080px;height:560px;background:linear-gradient(transparent,var(--ground))"></div>
      <div class="pill" style="top:270px;left:80px">${h.lt('watch', 60)}<span>0:00 → 2:00</span></div>
      <div class="bub" style="top:470px;left:560px">${h.ic('message-circle-question', 120, 'var(--on-highlight)')}</div>
      <h1 class="k" style="top:800px">I asked my team ${h.hl('one question.')}</h1>
      <p class="cap" style="top:1110px">…and nobody said a word for <b>two minutes.</b></p>`,
    motion: ['Frame 0 already composed (thumbnail-grade)', 'Slow 1.00→1.06 push-in on the team photo (silence feels long)', 'Timer counts 0:00→2:00 across the line', '"?" bubble pops on "question"'],
    sound: ['Room tone + clock ticks under the line', 'No music for the first 2 s, enters on "minutes"'],
  },
  {
    id: 'silence', n: 2, time: '5.3–13.8', theme: 'paper',
    vo: 'What are you obsessed with? At first, nobody had an answer. Some said nothing. Some said… work.',
    keywords: ['question', 'nobody', 'nothing', 'work'],
    assets: ['stock/laptop-duo.jpg', 'lottie/messageCircle.json', 'lottie/briefcase.json', 'icons/circle-slash.svg'],
    frame: (h) => `
      ${h.ph('laptop-duo.jpg', 'left:80px;top:270px;width:560px;height:420px;transform:rotate(-3deg)')}
      <div class="chat" style="top:740px">
        <div class="msg me">What are you <b>obsessed</b> with?</div>
        <div class="msg"><i class="dots"><b></b><b></b><b></b></i></div>
        <div class="msg">${h.ic('circle-slash', 44, 'var(--ink-soft)')} nothing.</div>
        <div class="msg">${h.lt('briefcase', 52)} work.</div>
      </div>
      <p class="cap" style="top:1250px">Some said… ${h.hl('work.')}</p>`,
    motion: ['Question lands as a sent message (slide up + pop)', 'Typing dots run, then stop: hold 0.6 s of nothing', '"nothing." and "work." arrive on their words', 'Photo card drifts 20 px'],
    sound: ['Message "send" on the question', 'Soft typing under dots, cut dead on stop', 'Low thud on "work."'],
  },
  {
    id: 'first', n: 3, time: '14.2–20.0', theme: 'paper',
    vo: "But I wasn't looking for the answer that sounds good in a meeting. So I went first.",
    keywords: ['meeting answer', 'went first'],
    assets: ['stock/hand-duo.jpg', 'icons/presentation.svg', 'icons/x.svg', 'icons/hand.svg'],
    frame: (h) => `
      <div class="card" style="top:280px;left:80px;right:150px">${h.ic('presentation', 56, 'var(--ink-soft)')}<span class="strike">"the answer that sounds good in a meeting"</span></div>
      ${h.ph('hand-duo.jpg', 'left:80px;top:520px;width:850px;height:560px')}
      <div class="chip" style="top:470px;left:780px">${h.ic('hand', 72, 'var(--on-highlight)')}</div>
      <h1 class="k" style="top:1110px">So I went ${h.hl('first.')}</h1>`,
    motion: ['Meeting-answer card types in, then marigold strike draws across', 'Hand photo wipes up from the strike', 'Hand chip waves (±12° rotate, 2 swings)'],
    sound: ['Scratch on the strike', 'Pop on "first"'],
  },
  {
    id: 'answers', n: 4, time: '20.3–27.6', theme: 'ultraviolet',
    vo: 'And then the room opened up. Adventure. Coding. Things people could talk about for hours.',
    keywords: ['room opened', 'adventure', 'coding', 'hours'],
    assets: ['stock/adventure2-duo.jpg', 'stock/coding-duo.jpg', 'lottie/explore.json', 'lottie/code.json', 'lottie/clock.json'],
    frame: (h) => `
      <div class="rays"></div>
      <h1 class="k" style="top:270px">The room ${h.hl('opened up.')}</h1>
      ${h.ph('adventure2-duo.jpg', 'left:80px;top:520px;width:420px;height:560px;transform:rotate(-4deg)')}
      ${h.ph('coding-duo.jpg', 'left:520px;top:560px;width:420px;height:560px;transform:rotate(3deg)')}
      <div class="tag" style="top:1010px;left:110px">${h.lt('explore', 44)} Adventure</div>
      <div class="tag" style="top:1050px;left:560px">${h.lt('code', 44)} Coding</div>
      <p class="cap" style="top:1230px">${h.lt('clock', 48)} talk about for <b>hours.</b></p>`,
    motion: ['Light burst (rays rotate slowly) on "opened up"', 'Photo tiles fly in on "Adventure" and "Coding", settle tilted', 'Clock hand spins fast on "hours"'],
    sound: ['Whoosh + airy riser on "opened up"', 'Pop per answer', 'Fast tick run on "hours"'],
  },
  {
    id: 'source', n: 5, time: '28.0–33.8', theme: 'paper',
    vo: 'I borrowed this question from the founder of Wispr Flow. He asks it when he hires.',
    keywords: ['borrowed', 'founder', 'Wispr Flow', 'hires'],
    assets: ['stock/interview-duo.jpg', 'icons/quote.svg', 'icons/handshake.svg'],
    frame: (h) => `
      <div class="qt" style="top:270px">${h.ic('quote', 120, 'var(--accent)')}</div>
      <h2 class="m" style="top:420px">Borrowed from the founder of ${h.hl('Wispr Flow.')}</h2>
      ${h.ph('interview-duo.jpg', 'left:80px;top:700px;width:850px;height:440px')}
      <div class="lab" style="top:1170px">${h.ic('handshake', 40, 'var(--accent)')} He asks it when he hires</div>`,
    motion: ['Quote mark scales in, text reveals word by word', 'Interview photo slides up on "hires"', 'No logo: name in text only'],
    sound: ['Soft paper flip on "borrowed"', 'Pop on "hires"'],
  },
  {
    id: 'hiring', n: 6, time: '34.2–41.8', theme: 'midnight',
    vo: 'We spend so much time checking skills and experience. What if we also asked what drives someone beyond the job?',
    keywords: ['skills', 'experience', 'checking', 'beyond the job'],
    assets: ['stock/cv-duo.jpg', 'lottie/checkmark.json', 'lottie/zap.json'],
    frame: (h) => `
      ${h.ph('cv-duo.jpg', 'left:80px;top:270px;width:850px;height:520px')}
      <div class="list" style="top:520px;left:130px">
        <div>${h.lt('checkmark', 44)} Skills</div><div>${h.lt('checkmark', 44)} Experience</div></div>
      <div class="bigq" style="top:200px;left:700px">?</div>
      <h1 class="k" style="top:880px">What drives you ${h.hl('beyond the job?')}</h1>`,
    motion: ['Ticks draw in on "skills" and "experience"', 'Riser under "What if…", big "?" punches through the CV card', 'CV card dims to 40% once the "?" lands'],
    sound: ['Two crisp ticks', 'Riser into a single hit on "beyond"'],
  },
  {
    id: 'list', n: 7, time: '42.2–51.1', theme: 'paper',
    vo: 'Solving problems. Building things. Adventure. Understanding people. Getting better, every single day.',
    keywords: ['problems', 'building', 'adventure', 'people', 'every day'],
    assets: ['icons/puzzle.svg', 'icons/hammer.svg', 'lottie/explore.json', 'lottie/users.json', 'lottie/trendingUp.json', 'lottie/calendar.json'],
    frame: (h) => `
      <div class="lab" style="top:270px">What people said they're obsessed with</div>
      <div class="rows" style="top:360px">
        <div><span class="ch">${h.ic('puzzle', 56, 'var(--accent)')}</span>Solving problems</div>
        <div><span class="ch">${h.ic('hammer', 56, 'var(--accent)')}</span>Building things</div>
        <div><span class="ch">${h.lt('explore', 60)}</span>Adventure</div>
        <div><span class="ch">${h.lt('users', 60)}</span>Understanding people</div>
        <div class="hot"><span class="ch">${h.lt('trendingUp', 60)}</span><span>Getting better, ${h.hl('every day')}</span></div>
      </div>`,
    motion: ['Each row slides in on its word (5 hits, evenly spaced by the VO)', 'Icons animate once as they land', 'Last row turns marigold; calendar flips on "every single day"'],
    sound: ['One soft pop per row (rising pitch)', 'Page-flip flutter on "every single day"'],
  },
  {
    id: 'difference', n: 8, time: '51.4–57.5', theme: 'ultraviolet',
    vo: 'Being good at something makes you capable. Being obsessed with it makes you keep getting better.',
    keywords: ['good', 'capable', 'obsessed', 'keep getting better'],
    assets: ['stock/climb-duo.jpg', 'lottie/infinity.json', 'icons/trending-up.svg'],
    frame: (h) => `
      ${h.ph('climb-duo.jpg', 'left:0;top:0;width:1080px;height:760px;border-radius:0')}
      <div style="position:absolute;left:0;top:420px;width:1080px;height:360px;background:linear-gradient(transparent,var(--ground))"></div>
      <svg class="chart" style="top:720px" viewBox="0 0 850 340"><path class="ax" d="M0 320H850"/><path class="flat" d="M0 300C160 180 300 150 850 150"/><path class="up" d="M0 300C260 260 520 160 850 10"/><text x="600" y="190" class="tf">GOOD</text><text x="560" y="60" class="tu">OBSESSED</text></svg>
      <h1 class="k" style="top:1090px;font-size:96px">Obsessed keeps ${h.hl('getting better.')}</h1>
      <div class="inf" style="top:300px;left:90px">${h.lt('infinity', 140)}</div>`,
    motion: ['"Good" line draws and flattens on "capable"', '"Obsessed" line keeps climbing on "keep getting better", runs past the frame top', 'Climber photo drifts upward with the line'],
    sound: ['Riser that follows the climbing line', 'No hit at the end: let it hang'],
  },
  {
    id: 'ask', n: 9, time: '57.9–62.3', theme: 'midnight',
    vo: 'So if I asked your team, would they have an answer? Would you?',
    keywords: ['your team', 'answer', 'would you'],
    assets: ['stock/team2-duo.jpg', 'lottie/edit.json'],
    frame: (h) => `
      ${h.ph('team2-duo.jpg', 'left:80px;top:270px;width:850px;height:400px;opacity:.55')}
      <h1 class="k" style="top:640px;font-size:180px">Would ${h.hl('you?')}</h1>
      <div class="cmt" style="top:1010px"><div class="who"><i></i>you</div><div class="say">I'm obsessed with…<span class="caret"></span></div>${h.lt('edit', 56)}</div>`,
    motion: ['Callback to the hook photo (same team, dimmed)', '"Would you?" slams in on "you"', 'Comment box types "I\'m obsessed with…" with a blinking caret'],
    sound: ['Keyboard clicks while typing', 'Music swells slightly here'],
  },
  {
    id: 'end', n: 10, time: '62.3–65.1', theme: 'paper',
    vo: '(no voice)', keywords: ['CU brand'],
    assets: ['brand/logo/cu-logo-full.png'],
    frame: (h) => `
      <img src="${h.root}/brand/logo/cu-logo-full.png" style="position:absolute;left:50%;top:700px;width:620px;transform:translateX(-50%)">
      <p class="lab" style="top:960px;justify-content:center;left:0;right:0">creativeupaay.com</p>`,
    motion: ['Marigold wipe in, logo settles with a small overshoot', 'Holds 2.5 s, music tail fades'],
    sound: ['One soft resolve note (no chime stack)'],
  },
];
