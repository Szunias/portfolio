# Igor Szuniewicz — Game Audio Portfolio

> **Game audio designer specializing in interactive music, sound design, and real-time audio implementation.**

Built with **React, TypeScript, Vite, and Tailwind CSS**.

## 🚀 Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Routing:** React Router DOM (with lazy loading)
- **Internationalization:** i18next
- **State Management:** React Context API
- **Deployment:** GitHub Pages

## 🛠️ Project Structure

The project follows a standard scalable React architecture:

```
src/
├── components/
│   ├── layout/       # Global layout components (Navbar, Footer)
│   ├── ui/           # Reusable UI atoms (Buttons, Inputs)
│   └── features/     # Feature-specific components
├── constants/        # Global constants (Routes, Config)
├── context/          # React Context providers
├── hooks/            # Custom React Hooks
├── pages/            # Page components (Lazy loaded)
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
└── data/             # Static data content
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

## 🔍 Key Features

- **Performance:** Component lazy loading, optimized assets.
- **Accessibility:** Semantic HTML, ARIA attributes, keyboard navigation.
- **SEO:** Dynamic meta tags using `react-helmet-async`.
- **i18n:** Full multi-language support (EN, PL, NL).

## 🧪 Testing (Planned)

We recommend using **Vitest** for unit testing.
To set up testing:

1. `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom`
2. Create `vitest.config.ts`.
3. Add `test` script to `package.json`.

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'Add some amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

---
© Igor Szuniewicz
