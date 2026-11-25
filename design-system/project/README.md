CU Social is how Creative Upaay looks and sounds on Instagram (and LinkedIn): build stories, plain-English AI and life at a studio in Udaipur. It extends the creativeupaay.com brand (DM Sans, Upaay Purple, the smiley C) with a display face, a three-theme slide system and one warm highlight colour, for the feed.

## Voice

Creative Upaay helps businesses become AI-native. On social we **show the work**: real problems, real builds, real numbers. We talk like a sharp builder explaining it to a founder over chai, not like an agency.

- **Lead with the stake, not the company.** "One missed date. One malpractice claim." beats "Creative Upaay built a Legal AIOS."
- **Plain words over jargon.** Say "deadline engine", not "AI-powered compliance orchestration". If an AI term must appear, explain it on the same slide.
- **Specific numbers, only real ones.** Use figures from client results or creativeupaay.com ("70%+ admin drafting saved", "25+ hours saved per employee/week"). Never invent or round up.
- **We / you.** "We built", "your team". Sentence case everywhere except mono labels.
- **Warm, a little playful.** Borrow the site's own phrases: "Think big, build bigger", "Outcome in weeks, not quarters", "From 1 idea to 100+ stories".
- **No emoji on slides.** Captions may use at most 2.
- **Client names only with permission.** Otherwise describe the client ("a personal-injury law firm").

## Formats

| Format | Canvas | Use for |
| --- | --- | --- |
| Carousel slide | 1080 × 1350 (4:5) | Build stories, explainers, lessons. 6–10 slides. |
| Reel | 1080 × 1920 (9:16), 30–90 s | Reach: story hooks, demos, team moments. |
| Reel cover | 1080 × 1920, hook in centre 1440 | The grid thumbnail of a reel. |

**Carousel arc (default 7 slides):** Hook → Problem → What we built → Shift (before/after) → Result (stat) → Proof (quote) → Ask (CTA). Stories with no client can use Hook → 3–5 beats → Lesson → CTA.

**Reel arc (30–90 s):** Hook card in the first 1.5 s → the problem in one line (0–8 s) → the build or the moment (8–60 s, a cut every 2–4 s) → the result on screen → one-line ask. Captions all the way through.

## Content series

Every post wears a series tag (`cu-tag`, top right), so the feed reads as a system:

- **Build Story**: client case studies (problem → build → result). Starts on Midnight.
- **AI, Plainly**: one AI concept or tool explained for business owners. Paper.
- **From the Desk**: founders, team and Udaipur, behind the scenes, the journey since 2019. Paper with photos.
- **By the Numbers**: one stat and what it means. Ultraviolet.

## Colour

Three slide themes. Set one per slide with `data-theme`. Components only use the semantic tokens (`ground`, `ground-raised`, `ink`, `ink-soft`, `accent`, `highlight`, `on-highlight`, `line`, `motif`), so any slide works in any theme.

- **Paper** (`neutral-paper` ground, `neutral-ink` text, `brand-purple` accent): the reading theme for story beats and lists.
- **Midnight** (`brand-midnight` ground, `brand-lilac` accent): hooks, quotes, anything dramatic.
- **Ultraviolet** (`brand-purple` ground, `brand-marigold` accent): stats and the CTA. Use it at most twice per carousel.
- **Rhythm:** never put three slides of the same theme in a row unless the story needs it. The cover is Midnight or Ultraviolet so it pops in a light feed.
- **Marigold** (`highlight`) is a social-only addition. Use it for one highlight per slide, always with `on-highlight` text. It is the only warm colour, which is why it works.
- Never use `brand-lilac` for text on Paper (it fails contrast). Use `brand-purple`. `neutral-muted` is for 24px+ only.
- The website's purple gradient (`brand-purple` → `brand-violet`) stays on the website. Slides use flat colour.

## Type

- **Display:** Bricolage Grotesque 700–800, tight tracking. Use it for `type-hook`, `type-headline`, `type-title`, `type-stat`, `type-quote`, `type-reel-hook`. Its chunky, friendly shapes echo the rounded wordmark.
- **Text:** DM Sans, the website's font. Use it for `type-body-lg`, `type-body`, `type-reel-caption`.
- **Labels:** DM Mono 500 in uppercase with 0.08em tracking (`type-label`, `cu-label`). Use it for chapter labels, series tags, counters and the handle. It gives a quiet nod to code.
- One headline per slide. Body text at 34px minimum, because slides are read on phones at about 1/3 scale.
- Text limits: hook 9 words, headline 12, body 35, quote 30.

## Layout

- 88px margin (`space-11`) on all four sides. Header (handle + series tag) and footer (counter, progress bar, arrow) sit in the same place on every slide.
- The progress bar fills in `accent` as the reader swipes. Slide 1 shows the **Swipe →** pill.
- Content sits low or centred. Hooks, stats and CTAs anchor to the bottom (`cu-body--end`), story beats centre.
- Cards (`cu-card`) use `radius-lg` (36px) with a 2px `line` border. The highlighted "after" card gets a 4px `accent` border.
- Reels: keep text inside 250px top / 440px bottom / 150px right, and keep the cover hook inside the centre 1440px.

## Motif

- **The open arc** (`cu-arc`) is a thick ring with a gap, taken from the C of the logo. Put one per slide, bleeding off an edge, in `motif`. It appears on hook, stat, quote and CTA slides only, and never sits behind body text.
- **The sparkle** (✦) from creativeupaay.com is the list bullet, in `accent`.
- **The highlight** marks the stake in a sentence, like a marker pen.

## Logo and assets

- Header: the smiley C icon (`Logos/cu-icon.png`, gradient) at 56px beside `@creativeupaay`. On Ultraviolet it turns white with a CSS filter, the only treatment allowed.
- CTA slide: the wordmark (`Logos/cu-wordmark-footer.svg`, lilac + indigo), white on Ultraviolet.
- Never redraw, recolour (other than to white), stretch or outline the logo.
- Photos: real team, office and product only. No stock people. Screenshots go in `cu-photo` with `radius-lg`.

## Producing posts

Slides are generated from a story JSON with the repo's `tools/carousel.mjs`. Each slide type is a component in this system (`hook`, `story`, `list`, `shift`, `stat`, `quote`, `photo`, `cta`). Inline markup: `==words==` for highlight, `*words*` for accent.
