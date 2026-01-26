# Portfolio v2

Next.js 15 portfolio with Tailwind CSS v4, next-intl (3 languages), and Framer Motion animations.

## Quick Start

```bash
cd v2
npm install
npm run dev
```

Visit http://localhost:3000 (or the port shown in terminal)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl (EN/PL/NL)
- **Animations**: Framer Motion 11+
- **Icons**: Lucide React
- **TypeScript**: 5.7+

## Project Structure

```
v2/
├── public/assets/       # Static assets (images, audio, videos)
├── src/
│   ├── app/[locale]/    # Pages (Home, About, Projects, Music, Contact)
│   ├── components/
│   │   ├── ui/          # Button, Card, Badge
│   │   ├── layout/      # Header, Footer, LanguageSwitcher
│   │   └── sections/    # Hero, FeaturedProjects, etc.
│   ├── i18n/            # i18n config and routing
│   ├── data/            # Portfolio data (projects, tracks)
│   └── types/           # TypeScript types
├── messages/            # Translations (en, pl, nl)
└── ...config files
```

## Pages

- `/` - Home with Hero, Featured Projects, Skills, Showreel
- `/about` - Biography, Education Timeline, Philosophy
- `/projects` - Project grid with filters
- `/projects/[id]` - Project detail page
- `/music` - Track grid with sticky audio player
- `/contact` - Contact form and social links

## Color Scheme (Dark Mode)

```css
--background: #030303
--surface: #0a0a0a
--accent: #38bdf8 (sky blue)
--text-primary: #f8fafc
--text-secondary: #94a3b8
```

## Fonts

- **Display**: Space Grotesk
- **Body**: Inter
- **Mono**: JetBrains Mono

## Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Language Switching

The site supports three languages:
- English (default)
- Polish
- Dutch

Use the language switcher in the header to change languages. URLs are prefixed with locale (e.g., `/en/about`, `/pl/about`).
