/* Optional build only: the published site remains plain HTML/CSS/JavaScript. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'site-assets.json'), 'utf8'));
const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '');

function combine(files, loader, output) {
  // Preserve the complete cascade and script execution order; do not purge classes.
  const source = files.map(file => `/* ${file} */\n${read(file)}\n`).join('\n');
  const result = esbuild.transformSync(source, {
    loader,
    minify: true,
    legalComments: 'eof',
    target: ['chrome110', 'firefox115', 'safari16.4'],
    charset: 'utf8',
  });
  fs.writeFileSync(path.join(root, output), result.code);
  return { files: files.length, before: Buffer.byteLength(source), after: Buffer.byteLength(result.code), hash: hash(result.code) };
}

const css = combine(manifest.styles, 'css', 'site.min.css');
const js = combine(manifest.scripts, 'js', 'site.min.js');
const indexPath = path.join(root, 'index.html');
let html = read('index.html');
let styleInserted = false;
html = html.replace(/<link\b(?=[^>]*\brel="stylesheet")[^>]*>/g, () => {
  if (styleInserted) return '';
  styleInserted = true;
  return `<link rel="stylesheet" href="site.min.css?v=${css.hash}">`;
});
let scriptInserted = false;
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (tag, src) => {
  if (src.includes('/vendor/')) return tag;
  if (scriptInserted) return '';
  scriptInserted = true;
  return `<script defer src="site.min.js?v=${js.hash}"></script>`;
});
if (!styleInserted || !scriptInserted) throw new Error('Stylesheet or script insertion point not found');
fs.writeFileSync(indexPath, html);
console.log(JSON.stringify({ css, js }, null, 2));
