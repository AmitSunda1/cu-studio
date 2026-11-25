// Builds design-system/project/components/<Comp>/preview.html from tools/slides.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { slide, reel } from './slides.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DS = path.join(ROOT, 'design-system', 'project', 'components');
// Asset-store URLs of the logo files inside the published design system
const ctx = { series: 'Build Story', assets: { icon: '/_blob/764704ba9df8484302c57b76564800cf', wordmark: '/_blob/074c3041449bc4e220c0bc266c921fa6' } };
const sample = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'sample-legal-aios.json'), 'utf8')).slides;
const by = (t) => sample.findIndex((s) => s.type === t);
const N = 7;
const cards = {
  HookSlide:  ['Carousel', slide(sample[by('hook')], 1, N, ctx), 'Slide 1: the hook. Midnight by default.'],
  StorySlide: ['Carousel', slide(sample[by('story')], 2, N, ctx), 'One beat of the story per slide.'],
  ListSlide:  ['Carousel', slide(sample[by('list')], 3, N, ctx), 'Headline plus 3-5 sparkle bullets.'],
  ShiftSlide: ['Carousel', slide(sample[by('shift')], 4, N, ctx), 'Before / after.'],
  StatSlide:  ['Carousel', slide(sample[by('stat')], 5, N, ctx), 'One big number.'],
  QuoteSlide: ['Carousel', slide(sample[by('quote')], 6, N, ctx), 'Client or founder quote.'],
  PhotoSlide: ['Carousel', slide({ type: 'photo', label: 'Life at CU', text: 'Where it started: *a laptop, a desk and a dream.*' }, 3, 8, { ...ctx, series: 'From the Desk' }), 'Photo or screenshot with a title.'],
  CtaSlide:   ['Carousel', slide(sample[by('cta')], 7, N, ctx), 'Last slide: one ask.'],
  ReelHook:   ['Reels', reel({ theme: 'paper', series: 'Build Story', hook: 'Our client was ==2 days== from a lawsuit.', guides: true }, ctx), 'First 1.5 s and cover, with safe zones.'],
  ReelCaption:['Reels', reel({ theme: 'midnight', caption: 'so we built it ==a brain==' }, ctx), 'Burned-in captions with the active word highlighted.'],
};
for (const [name, [group, html, sub]] of Object.entries(cards)) {
  const h = group === 'Reels' ? 1920 : 1350;
  fs.mkdirSync(path.join(DS, name), { recursive: true });
  fs.writeFileSync(path.join(DS, name, 'preview.html'),
    `<!-- @dsCard group="${group}" width=1080 height=${h} subtitle="${sub}" -->\n<div style="width:1080px">${html}</div>\n<script></script>\n`);
}
console.log('previews:', Object.keys(cards).join(', '));
