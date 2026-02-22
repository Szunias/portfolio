# Igor Szuniewicz - Portfolio

Personal portfolio site for Igor Szuniewicz, a game audio designer and developer specializing in sound design, middleware integration, and interactive audio systems.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS 3, Framer Motion
- **i18n:** react-i18next with EN / PL / NL (per-page namespace lazy loading)
- **Audio:** Custom audio player with playlist support
- **Deployment:** GitHub Pages

## Getting Started

```bash
npm install
npm run dev       # Start dev server
npm run build     # Type-check + production build
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
  components/
    features/     # Domain components (AudioPlayer, Showreel, ContactForm, etc.)
    home/         # Home page sections (Hero, Skills)
    layout/       # Layout shell (Navbar, Footer, SEO)
    ui/           # Reusable primitives (Button, ErrorBoundary)
  constants/      # Route definitions
  context/        # AudioContext provider
  data/           # Portfolio data JSON + tracks
  hooks/          # usePortfolioData, useProjectFilter
  pages/          # Route-level page components
  types/          # TypeScript type definitions
  utils/          # Shared utility functions
public/
  locales/        # i18n translation files (en/, pl/, nl/)
  assets/         # Images, videos, fonts
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |
| `npm run deploy` | Build and deploy to GitHub Pages |

## Deployment

The site is deployed to GitHub Pages via the `gh-pages` package. Running `npm run deploy` builds the project and pushes the `dist/` directory to the `gh-pages` branch.
