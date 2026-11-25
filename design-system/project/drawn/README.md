# Drawn library (CU Social)

Flat drawings in CU colours for character ("big-head") reels: a cast member's real face sits on a drawn body, and
comic stickers carry the expression. First used in the GTA-6 skit (`content/gta6-reel-edit.mjs`).

- Bodies: `d-body-plain`, `d-body-folded` (hands folded / sorry), `d-body-controller`, `d-body-thumbsup`. The shirt is
  `currentColor`, so each person gets their own colour. The face goes on the neck (top centre).
- Props: `d-train` (coach windows x 300-430 and 460-590, y 110-230 of 800x400), `d-monitor` (screen x 38-362, y 68-262 of 400),
  `d-console` (generic, no brand), `d-card`, `d-gamescreen` (abstract city, no game artwork).
- Stickers: `d-sweat`, `d-spiral`, `d-halo`, `d-shock` ("!?"), `d-anger`, `d-dots` ("…" bubble), `d-bubble`, `d-glint`, `d-strings` (puppet), `d-swirl` (hypnosis).

Copy into a reel's assets with `node tools/fetch-icon.mjs assets/<story> d-body-plain d-sweat ...` (list: `--search d-`).
No third-party logos or characters, ever.
