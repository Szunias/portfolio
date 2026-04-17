# old/ — LEGACY BACKUP (not the live site)

This directory contains the **previous** portfolio implementation — a React 18 + TypeScript + Vite app with Tailwind and react-i18next.

**It is no longer deployed.** The live site is the static HTML build in `../src/` + `../build.cjs`. See `../README.md`.

## Why is this still here?

The current HTML pages still reference assets under `old/public/assets/` (images, videos, audio tracks, CV PDFs). Until those assets are migrated, this directory stays.

## Do not edit this as part of the live site

- Editing `old/src/`, `old/package.json`, `old/vite.config.ts` etc. has **no effect** on the live site.
- Adding/removing files under `old/public/assets/` is the only reason to touch this directory — because the current HTML references them directly.

## Running the old React app (for reference only)

```bash
cd old
npm install
npm run dev
```

This will serve the legacy React portfolio locally. It is not the site at https://igorszuniewicz.com.
