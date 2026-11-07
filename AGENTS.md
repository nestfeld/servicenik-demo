# Working on this static website

- Keep the existing design, content and interaction behaviour unless the user asks to change them.
- `index.html` is the editable page and the served page. It loads generated `site.min.css` and `site.min.js` plus the existing Choices vendor script.
- Edit the readable CSS/JavaScript sources listed in `site-assets.json`, not the minified files. Preserve the manifest order: it defines the CSS cascade and script dependencies.
- After changing CSS or JavaScript, run `npm run build`. For a fresh checkout, first run `npm ci`. Commit/ship the generated bundles together with `index.html`; the build adds content hashes to their URLs.
- When adding a source CSS/JavaScript file, add it to the appropriate list in `site-assets.json` and rebuild. Adding only another stylesheet or script tag will be consolidated by the next build.
- The finished site needs no Node server or framework. Preview with `python -m http.server 8765` or by opening `index.html`.
- Optimized WebP illustrations preserve the original PNG pixels. Keep source PNGs; do not replace the site's illustrations or change their crops as part of performance work.
- Verify relevant behaviour in the browser, including a phone viewport. Keep native dialog semantics, keyboard support, reduced-motion handling, responsive navigation and mobile address expansion.
