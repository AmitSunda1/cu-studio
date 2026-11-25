# SETUP: Social-media-GOD (CU Social + CU Studio)

How to set this project up on a new machine so it works exactly like the original. It is written for
a human or a coding agent (Claude Code etc.). Do the steps in order and run every command from the
repo root. After setup, read `CLAUDE.md`: it holds the project rules, layout and pipeline.

## 0. What the project is

Creative Upaay (creativeupaay.com) turns team stories into Instagram content in its own design system,
"CU Social":
- **Carousels** (1080x1350 PNG slides) are made from `content/<slug>.json` with `tools/carousel.mjs`.
- **Reels** (1080x1920, 30-90 s MP4) go through an editor workflow: script → voice-over (edge-tts) →
  breakdown → asset hunt → moodboards → edit (HyperFrames) → render.
- **CU Studio** (`npm run studio`, http://localhost:4321) is the local web UI the user actually works in. It
  runs each step through `claude -p` and the user approves every step in the browser.

## 1. Requirements

The original machine is macOS (Apple Silicon). The versions it uses are in brackets.

| Tool | Why | Install (macOS) |
|---|---|---|
| Node.js 22+ [22.17.0] | all tools, Studio, reel engine | `nvm install 22` or `brew install node@22` |
| Python 3.11+ [3.14.6] | voice-over, music, sfx, duotone | `brew install python` (or python.org) |
| ffmpeg + ffprobe [8.0.1] | audio mixing, photos, contact sheets, render finishing | `brew install ffmpeg` |
| Google Chrome | screenshots for carousels, moodboards and asset boards (playwright-core drives it) | install normally into `/Applications` |
| Claude Code CLI [2.1.x] | CU Studio runs every step with `claude -p` | `curl -fsSL https://claude.ai/install.sh \| bash`, then run `claude` once and log in |
| git | clone / push | `xcode-select --install` |

You need an internet connection for: edge-tts (Microsoft's free TTS service), Pexels photo downloads, npm, and
the first HyperFrames render (it downloads its own headless Chrome into `~/.cache/hyperframes/`).

There are **no API keys and no `.env`**. Pexels photos are downloaded from their public image URLs, and edge-tts
is free with no key.

Notes for other systems:
- **Chrome elsewhere / Linux / Windows:** set `CHROME_PATH` to the Chrome or Chromium binary, e.g.
  `export CHROME_PATH=/usr/bin/google-chrome`. Only `tools/carousel.mjs`, `tools/moodboard.mjs` and
  `tools/asset-board.mjs` use it.
- **HEIC photos** are converted with macOS `sips` (`tools/own-photo.mjs`). On other systems, give JPG or PNG files.
- The `.venv/bin/python` path is hard-coded in the tools, so the venv must be at `./.venv` (on Windows use WSL).

## 2. Install

```bash
git clone <repo-url> Social-media-GOD
cd Social-media-GOD

# Node deps: root (playwright-core, lottie-web, lucide-static) and the reel engine (hyperframes 0.9.9)
npm ci
(cd reel-engine && npm ci)

# Python venv at ./.venv (the tools call .venv/bin/python directly)
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Do **not** install Whisper, rembg, torch or any ML models. The user removed them on purpose on 2026-11-20:
there is no own-voice upload and no background remover. Cast faces are used as-is if they are transparent,
otherwise they become oval sticker heads.

HyperFrames telemetry is turned off by `reel-engine/render-reel.mjs` (`HYPERFRAMES_TELEMETRY=0`). Keep it off.

## 3. Verify

Run these in order. Each one should finish without errors.

```bash
node -v && ffmpeg -version | head -1 && .venv/bin/python -c "import edge_tts, numpy; print('py ok')"
claude --version

# Carousel: rewrites output/sample-legal-aios/slide-*.png + _contact-sheet.png
node tools/carousel.mjs content/sample-legal-aios.json

# Icons / lottie libraries are reachable
node tools/fetch-icon.mjs --search timer
node tools/fetch-lottie.mjs --list          # first run downloads react-useanimations into .cache/

# Reel engine: rebuilds reel-engine/builds/obsessed-reel-fast/ and regenerates output/obsessed-reel-fast/music.wav
node reel-engine/build-reel.mjs obsessed-reel-fast
node reel-engine/render-reel.mjs obsessed-reel-fast --check-only   # first run downloads HyperFrames' Chrome
```

A full render (`node reel-engine/render-reel.mjs <reel>`) takes a few minutes. It rewrites `output/<reel>/reel.mp4`,
`cover.png`, `cover-grid.png` and `frames.png`. The result should match the committed reel; if it doesn't,
check the Node, ffmpeg and hyperframes versions first.

Then start the UI:

```bash
npm run studio            # → http://localhost:4321  (PORT=xxxx to change; it listens on 127.0.0.1 only)
```

You should see the stories **obsessed** (carousel + reel) and **gta6** (Hindi dialogue reel), with every step approved.

## 4. What's in the repo vs. what gets made locally

Committed (shared between machines):
- Code: `tools/`, `reel-engine/*.mjs` + `template/`, `studio/`.
- Brand + design system: `brand/`, `design-system/project/`.
- Content sources: `content/`, plus the collected assets in `assets/<story>/` (Pexels photos with duotones, the
  cast face PNGs, icons, lottie, CREDITS.md).
- Finished work: `output/` (carousel PNGs, voiceover.mp3 + timeline.json, moodboard PNGs, reel.mp4, covers,
  captions). Studio shows these files, and `build-reel.mjs` needs `voiceover.mp3` + `timeline.json` to rebuild a
  reel without recording the voice again.
- Studio history: `studio/data/<slug>/` (story, cast, direction, state, log).

Not committed (made locally, see `.gitignore`): `node_modules/`, `reel-engine/node_modules/`, `.venv/`,
`.cache/`, `reel-engine/builds/` (made by build-reel), `output/*/music.wav` (made by `tools/music.py`; the seed is
fixed, so it comes out the same), and the temporary `carousel.html` / `moodboards.html` render pages.

**Privacy:** `assets/gta6/stock/face-*.png` are real team members' faces, and the stories are internal. Keep the
GitHub repo **private**.

## 5. Claude Code context on the new machine

Claude Code keeps its memory per machine (`~/.claude/projects/<path>/memory/`), so it does not travel with git.
Everything an agent needs is in `CLAUDE.md` + this file. These are the working preferences from the project
history:

- **Approval at every step.** For reels, ask the user before each step (format, script, voice, breakdown,
  assets, moodboards, edit, final). Never move on without their OK. In Studio this happens through the
  ```` ```questions ```` block. In the terminal, use AskUserQuestion.
- **Work like a video editor:** script → keywords → collect real assets (Pexels stock in CU purple duotone, Lucide
  icons, free Lottie, CU drawn library) → one moodboard per scene → edit with motion + SFX + music.
- **Text-only reels felt boring** (feedback on v1). Default proposals include visuals in every scene, a moving
  background, wipe transitions and a music bed.
- **Voice:** en-US-AndrewMultilingualNeural at +8%, gap 0.25 s. The user likes fast pacing. Hindi reels use a Hindi
  voice (default hi-IN-MadhurNeural) with all on-screen text in **Hinglish**, never Devanagari.
- **Carousels before reels** for each new story.
- **Facts only from the story or creativeupaay.com.** Never redraw the CU logo. No third-party logos or game art.
- **Studio is the main tool.** Keep the step prompts in `studio/server.mjs` in sync with `CLAUDE.md`.
- After engine changes, rebuild `obsessed-reel-fast` and `gta6-reel` and check that the output did not change.

To skip Studio's permission prompts when you work in the terminal, you can add an allowlist in
`.claude/settings.json`. Studio itself passes `--permission-mode acceptEdits` and per-step `--allowedTools`.

## 6. Troubleshooting

- `browserType.launch: Failed to launch` → Chrome isn't at the default path. Set `CHROME_PATH`.
- `ffprobe: not found` / no contact sheet → install ffmpeg and make sure it's on PATH.
- `.venv/bin/python: no such file` → make the venv at the repo root (step 2).
- edge-tts returns no audio → it retries 4 times by itself. If it still fails, check the network and run it again.
- Studio step fails with `claude: command not found` or an auth error → install Claude Code, log in, and restart
  `npm run studio` from a shell where `claude` is on PATH.
- A Studio step on an old story fails at once with a session/resume error → the `sessionId` in `studio/data/<slug>/state.json` belongs to
  another machine's Claude session. Set it to `null` and the next step starts a fresh session.
