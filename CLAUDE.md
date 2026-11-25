# Social-media-GOD: Creative Upaay social content

Story in, Instagram posts out (carousels first, then 30-90 s reels), in the CU Social design system. Usually run from **CU Studio** (`npm run studio` → http://localhost:4321).

## Rules
- Facts and numbers only from the user's story or creativeupaay.com. Never invent client results or story details.
- Logos in `brand/logo/` are copied from creativeupaay.com. Never redraw them. No third-party logos or game/brand artwork.
- Reels: the user approves every step (script, voice, breakdown, assets, moodboards, edit, final).

New machine: follow `SETUP.md` (Node 22, Python venv at `./.venv` from requirements.txt, ffmpeg, Chrome, Claude Code CLI; `CHROME_PATH` overrides the macOS Chrome path).

## Layout
- `design-system/project/`: source of truth (tokens.json, README.md brand book, components/bundle.css, `drawn/` library of d-*.svg bodies, props and stickers for character reels). Published at https://claude.ai/artifact/1qU2ZLGPcxfndDUDxG2Kg2. After editing tokens.json run `node tools/build-tokens-css.mjs`; after editing slides.mjs run `node tools/build-previews.mjs` and republish.
- `brand/`: logos and fonts (`brand/fonts/`: Bricolage Grotesque, DM Sans, DM Mono).
- `content/<slug>.json` carousels · `content/<reel>.json` reel script · `content/<reel>-breakdown.md` · `content/<reel>-moodboard.mjs` · `content/<reel>-edit.mjs`.
- `assets/<story>/`: stock (photos `*-duo.jpg`, cast faces `face-*-duo.png`), icons (Lucide + d-*), lottie, CREDITS.md.
- `output/<slug>/` carousel PNGs · `output/<reel>/` voiceover, timeline, moodboards, reel.mp4, cover, caption.
- `reel-engine/`: HyperFrames 0.9.9 (Apache-2.0, telemetry off). `builds/<reel>/` is generated; `template/` holds the project config.
- `studio/`: CU Studio (server.mjs, public/, data/<slug>/ = story, cast, direction, state, log).

## Pipeline
- Carousel: write `content/<slug>.json` (slide types hook, story, list, shift, stat, quote, photo, cta; `==x==` highlight, `*x*` accent) → `node tools/carousel.mjs content/<slug>.json` → `output/<slug>/slide-NN.png` + `_contact-sheet.png`.
- Reel (editor workflow): script `content/<reel>.json` → `.venv/bin/python tools/voiceover.py content/<reel>.json` (edge-tts + word timings) → breakdown → assets (`tools/fetch-photo.mjs` Pexels only + duotone + credits, `tools/fetch-icon.mjs` Lucide or `--drawn`, `tools/fetch-lottie.mjs`, `tools/own-photo.mjs` user photos / cast faces, `tools/asset-board.mjs`) → moodboards (`node tools/moodboard.mjs content/<reel>-moodboard.mjs output/<reel>/moodboards`, scene CSS `tools/reel-scene.css`) → edit `content/<reel>-edit.mjs` (API in the header of `reel-engine/build-reel.mjs`) → `node reel-engine/build-reel.mjs <reel>` → `node reel-engine/render-reel.mjs <reel>` (check, render, -14 LUFS, cover + grid crop, frames.png). Music `tools/music.py`, sfx `tools/sfx.py` (both code-made, no licences).
- Layout: text above 1190 px; captions band 1190-1330 px, skipped where the same words are big on screen; nothing important below 1330 px. Lottie plays from its wrapper's own `data-composition-id` + `data-start`.
- Voices: English default en-US-AndrewMultilingualNeural +8%. Hindi reels: Hindi voice only (default hi-IN-MadhurNeural); everything on screen is Hinglish (fonts have no Devanagari). Beats carry `vo` (Devanagari) + `cap` (Hinglish, same word count); `~` joins spoken letters shown as one word (ई~ओ~डी = EOD).
- Dialogue / character reels (example: GTA-6 skit, `content/gta6-reel*`): beats carry `who` + `voice`; faces on drawn bodies with sticker expressions. Engine options: `ground`, `blackBefore` + `hardCuts`, `endBody`, `coverAt`. No background remover is installed: cast faces are used as-is if transparent, otherwise as oval sticker heads.

## CU Studio
`studio/server.mjs` runs each step with `claude -p` (one resumed session per story) and per-step allowed tools. Claude can ask the user questions by ending its final message with a ```questions [...]``` JSON block; the UI shows them as options and sends the answers back. Failed steps retry once automatically. Keep the step prompts in server.mjs in sync with this file.
