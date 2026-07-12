# Vendored third-party code

- **three.module.min.js** — Three.js r160 (Dec 2023), MIT license. Vendored directly (no npm/CDN) to keep the build zero-dependency and self-contained. Upstream: https://github.com/mrdoob/three.js/releases/tag/r160
- **RoomEnvironment.js** — the standard Three.js example module (`examples/jsm/environments/RoomEnvironment.js`) from the same r160 release, used for the home page's studio lighting environment map.

Used only on the home page (`src/layouts/home.html`), loaded via an import map so it never blocks other pages.
