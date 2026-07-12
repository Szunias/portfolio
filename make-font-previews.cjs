// Tymczasowy skrypt: generuje warianty fontów z realnego builda (dist/index.html).
const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');

const variants = {
  'preview-fraunces': {
    label: 'PREVIEW: Fraunces',
    family: '&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700',
    serif: "'Fraunces', Georgia, serif",
  },
  'preview-instrument': {
    label: 'PREVIEW: Instrument Serif',
    family: '&family=Instrument+Serif:ital@0;1',
    serif: "'Instrument Serif', Georgia, serif",
  },
  'preview-space': {
    label: 'PREVIEW: Space Grotesk',
    family: '&family=Space+Grotesk:wght@400;500;700',
    serif: "'Space Grotesk', Georgia, sans-serif",
  },
};

const SERIF_DECL = "--serif: Georgia, 'Times New Roman', Times, serif;";

for (const [name, v] of Object.entries(variants)) {
  let out = html;
  if (!out.includes(SERIF_DECL)) throw new Error('Nie znaleziono deklaracji --serif');
  out = out.replaceAll(SERIF_DECL, `--serif: ${v.serif};`);
  out = out.replace('&display=swap', `${v.family}&display=swap`);
  out = out.replace(
    '</body>',
    `<div style="position:fixed;bottom:12px;left:12px;z-index:9999;background:#d4612f;color:#fff;font:600 12px/1 monospace;padding:8px 12px;letter-spacing:.08em;">${v.label}</div></body>`
  );
  fs.writeFileSync(`${name}.html`, out);
  console.log(`✓ ${name}.html`);
}
