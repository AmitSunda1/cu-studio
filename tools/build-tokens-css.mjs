// Compiles design-system/project/tokens.json -> design-system/project/tokens.css
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'design-system', 'project');
const t = JSON.parse(fs.readFileSync(path.join(root, 'tokens.json'), 'utf8'));
const v = (x) => typeof x === 'string' ? x.replace(/^\{(.+)\}$/, 'var(--$1)') : x;
const themes = t.color.themes.map(th => th.id), first = themes[0];
let out = `/* ${t.name} — generated from tokens.json */\n`;
for (const th of themes) {
  out += th === first ? `:root, [data-theme="${th}"] {\n` : `[data-theme="${th}"] {\n`;
  for (const tok of t.color.tokens) {
    const val = typeof tok.value === 'string' ? (th === first ? tok.value : null) : tok.value[th] ?? (th === first ? null : null);
    if (val != null) out += `  --${tok.name}: ${v(val)};\n`;
  }
  if (th !== first) out += `  color-scheme: dark;\n`;
  out += `}\n`;
}
out += `:root {\n`;
for (const fam of ['spacing', 'radius', 'layout']) for (const tok of t[fam].tokens) out += `  --${tok.name}: ${tok.value};\n`;
for (const [k, s] of Object.entries(t.type.families)) out += `  --font-${k}: ${s};\n`;
out += `}\n`;
for (const g of t.type.groups) for (const s of g.styles) {
  const fam = s.family || g.family;
  out += `.${s.name} { font-family: var(--font-${fam}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''} }\n`;
}
fs.writeFileSync(path.join(root, 'tokens.css'), out);
console.log('wrote tokens.css', out.length, 'bytes');
