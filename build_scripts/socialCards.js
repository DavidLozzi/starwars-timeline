// Builds one social-share card per character: the character's portrait composited
// into the magenta box of social-template.png. Output lands in public/social/ and is
// committed; prepJson.js records which characters have a card, and the prerendered
// pages and react-helmet point og:image / twitter:image at it.
//
//   node socialCards.js                  every character
//   node socialCards.js "Jyn Erso" ...   just those
//
// Local only, like description.js: it needs sharp, and CI never installs
// build_scripts/node_modules. Rerun it after changing a portrait or the template.
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const TEMPLATE = './social-template.png';
// The site's wordmark face, converted from public/fonts/ANewHope.woff2 (sharp's text
// renderer can't read woff2). It has no accented glyphs, so names are de-accented.
const NAME_FONT = './fonts/ANewHope.ttf';
// Where the name goes: the empty band under TIMELINE and above the gradient bar,
// from NAME_LEFT to NAME_GAP short of the portrait box, centred on NAME_CENTER_Y.
// Tied to the template's layout, so check these when the template changes.
const NAME_LEFT = 44;
const NAME_GAP = 24;
const NAME_CENTER_Y = 380;
// Long names shrink to fit the width and never wrap. Short ones stop growing at the
// size this name renders at when it fills the width, so TECH or JYN ERSO are never
// bigger than TOBIAS BECKETT.
const SIZE_REFERENCE_NAME = 'Tobias Beckett';
const NAME_COLOR = '#FFFFFF';
const IMAGES_DIR = '../public';
const OUT_DIR = '../public/social';

// Hand-made cards that the template must not overwrite (none since Luke's was retired).
const HAND_MADE = new Set();

export const socialCardFile = (title) => `social_${title.normalize('NFC').replace(/ /g, '_')}.jpg`;

// How much of a template pixel is the magenta placeholder (255,0,255), 0..1.
// Where the lettering and the gradient bar are drawn over the box, their
// anti-aliased edges are a blend of magenta and the ink colour; for every ink in
// the template (white, gray, black, blue, yellow, the bar) min(R,B) - G is <= 0,
// while magenta scores 255 and a 50% blend scores ~128. That gives the blend
// weight directly, so edges unmix cleanly instead of leaving a pink fringe.
const magentaWeight = (r, g, b) => {
  const m = (Math.min(r, b) - g) / 255;
  return m < 0.1 ? 0 : Math.min(1, m);
};

const loadTemplate = async () => {
  const { data, info } = await sharp(TEMPLATE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const weights = new Float32Array(width * height);
  let left = width, top = height, right = -1, bottom = -1;
  for (let i = 0; i < width * height; i++) {
    const w = magentaWeight(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
    weights[i] = w;
    if (w > 0.9) {
      const x = i % width;
      const y = Math.floor(i / width);
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) throw new Error(`${TEMPLATE} has no magenta (#FF00FF) box to place the portrait in.`);
  const box = { left, top, width: right - left + 1, height: bottom - top + 1 };
  return { data, width, height, weights, box, band: await nameBand(box) };
};

const escapeMarkup = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// sharp auto-fits text to fit inside width x height when both are given.
const renderText = (title, width, height) => sharp({
  text: {
    text: `<span foreground="${NAME_COLOR}">${escapeMarkup(title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase())}</span>`,
    font: 'A New Hope',
    fontfile: NAME_FONT,
    width,
    height,
    rgba: true,
    wrap: 'none',
  },
}).png().toBuffer({ resolveWithObject: true });

// Band width from the template's box, height cap from the reference name at that width.
const nameBand = async (box) => {
  const width = box.left - NAME_GAP - NAME_LEFT;
  const { info } = await renderText(SIZE_REFERENCE_NAME, width, 1000);
  return { width, height: info.height };
};

const renderName = async (title, band) => {
  const { data, info } = await renderText(title, band.width, band.height);
  return { input: data, left: NAME_LEFT, top: Math.round(NAME_CENTER_Y - info.height / 2) };
};

const buildCard = async (template, imagePath, title) => {
  const { data, width, height, weights, box } = template;
  // Cover the box (crop, never stretch), keeping the most interesting region,
  // which for these portraits is the face. Transparent portraits sit on black.
  const portrait = await sharp(imagePath)
    .flatten({ background: '#000000' })
    .resize(box.width, box.height, { fit: 'cover', position: sharp.strategy.attention })
    .raw()
    .toBuffer();

  const out = Buffer.from(data);
  for (let y = box.top; y < box.top + box.height; y++) {
    for (let x = box.left; x < box.left + box.width; x++) {
      const i = y * width + x;
      const w = weights[i];
      if (!w) continue;
      const p = ((y - box.top) * box.width + (x - box.left)) * 3;
      // Remove the magenta share of the pixel and put the portrait in its place.
      out[i * 4] = Math.round(data[i * 4] - w * 255 + w * portrait[p]);
      out[i * 4 + 1] = Math.round(data[i * 4 + 1] + w * portrait[p + 1]);
      out[i * 4 + 2] = Math.round(data[i * 4 + 2] - w * 255 + w * portrait[p + 2]);
    }
  }
  return sharp(out, { raw: { width, height, channels: 4 } })
    .composite([await renderName(title, template.band)])
    .flatten({ background: '#000000' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
};

const main = async () => {
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
  const names = process.argv.slice(2).map((n) => n.toLowerCase());
  const characters = data
    .filter((e) => e.type === 'character' && !HAND_MADE.has(e.title))
    .filter((e) => names.length === 0 || names.includes(e.title.toLowerCase()));
  if (names.length && characters.length !== names.length) {
    const found = characters.map((c) => c.title.toLowerCase());
    console.warn(`Not found (or hand-made): ${names.filter((n) => !found.includes(n)).join(', ')}`);
  }

  const template = await loadTemplate();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Template ${template.width}x${template.height}, portrait box ${JSON.stringify(template.box)}, name band ${template.band.width}x${template.band.height}`);

  let written = 0;
  for (const character of characters) {
    const imagePath = path.join(IMAGES_DIR, character.imageUrl || '');
    if (!character.imageUrl || !fs.existsSync(imagePath)) {
      console.warn(`  ! ${character.title}: no portrait at ${character.imageUrl}, skipped`);
      continue;
    }
    const card = await buildCard(template, imagePath, character.title);
    fs.writeFileSync(path.join(OUT_DIR, socialCardFile(character.title)), card);
    written += 1;
  }
  console.log(`Wrote ${written} card(s) to ${OUT_DIR}. Run node prepJson.js to point the pages at them.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
