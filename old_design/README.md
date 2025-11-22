# 🎮 Igor Szuniewicz — Game Audio Portfolio

> **Game audio designer specializing in interactive music, sound design, and real-time audio implementation**

[![Website](https://img.shields.io/badge/Website-igorszuniewicz.com-60a5fa?style=for-the-badge)](https://igorszuniewicz.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-Refactored-green?style=for-the-badge)](REFACTORING_PLAN.md)
[![Tests](https://img.shields.io/badge/Tests-70%2B%20Cases-success?style=for-the-badge)](tests/)
[![Documentation](https://img.shields.io/badge/Documentation-Complete-blue?style=for-the-badge)](docs/)

---

## 🎯 About This Project

Professional portfolio website showcasing game audio design work, built with **modern, maintainable, and scalable architecture**. Recently underwent comprehensive refactoring (Phase 1-6) to implement industry best practices.

### Key Highlights
- 🎵 **12+ Game Audio Projects** with technical breakdowns
- 🌍 **3 Languages** (English, Polish, Dutch) with i18n system
- 🏗️ **Professional Architecture** (ITCSS + BEM + ES6 Modules)
- ✅ **70+ Tests** with Vitest
- 📊 **Technical Metrics** for each project
- 🎨 **Design System** with 40+ colors, 18 spacing units

---

## ✨ Features

### 🎯 Portfolio Highlights
- 🔊 **Technical Skills** — Proficiency levels for Wwise, FMOD, MetaSounds, Unreal, Unity
- 📊 **Project Metrics** — Concrete numbers: 320+ events, 45ms latency, memory budgets
- 🔧 **Challenges & Solutions** — Real problems solved with technical explanations
- 🎨 **Audio Philosophy** — Sound design approach and principles

### 🌍 Multi-Language Support (i18n)
Full internationalization across **3 languages**:
- 🇬🇧 **English** | 🇵🇱 **Polski** | 🇳🇱 **Nederlands**
- Automatic browser language detection
- Language preference persists across sessions
- All content fully translated

### 🎨 Modern UI Components
- ✅ **Responsive Grid System** — CSS Grid + Flexbox
- ✅ **Interactive Components** — Modal, Toast, Navigation, Audio Player
- ✅ **Utility Classes** — 100+ Tailwind-like utilities
- ✅ **Smooth Animations** — Fade, slide, scroll effects
- ✅ **Accessibility** — ARIA labels, keyboard navigation, screen reader support

### 🏗️ Professional Architecture
- ✅ **ITCSS Structure** — Organized CSS with clear hierarchy
- ✅ **BEM Notation** — Consistent component naming
- ✅ **ES6 Modules** — Modern JavaScript with classes
- ✅ **Event-Driven** — Loose coupling with EventEmitter
- ✅ **Services Layer** — Translation & Analytics services
- ✅ **Testing** — Vitest with 70+ test cases

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/igorszuniewicz/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Full check (lint + format + test)
npm run check
```

---

## 📁 Project Structure

```
igorszuniewicz/
├── 🏠 HTML Pages
│   ├── index.html              # Homepage
│   ├── about.html              # About page
│   ├── music.html              # Music showcase
│   ├── contact.html            # Contact page
│   ├── component-examples.html # Component showcase
│   └── projects/               # Project detail pages
│
├── 🎨 Assets - Refactored Architecture
│   ├── css/
│   │   ├── 01-settings/        # CSS Variables (colors, spacing, typography)
│   │   ├── 02-base/            # Reset, typography, global styles
│   │   ├── 03-layout/          # Grid, header, footer
│   │   ├── 04-components/      # UI components (buttons, cards, forms, etc.)
│   │   ├── 07-utilities/       # Utility classes (spacing, display, text, etc.)
│   │   └── main-refactored.css # Master CSS import
│   │
│   └── js/
│       └── refactored/
│           ├── app.js                    # Main application entry point
│           ├── core/                     # Core utilities
│           │   ├── EventEmitter.js      # Event system
│           │   └── config.js            # Configuration
│           ├── utils/                    # Helper utilities
│           │   ├── storage.js           # LocalStorage wrapper
│           │   ├── dom.js               # DOM utilities (40+ functions)
│           │   └── helpers.js           # General helpers (60+ functions)
│           ├── components/               # UI Components
│           │   ├── Navigation.js        # Header navigation
│           │   ├── Modal.js             # Modal dialogs
│           │   ├── Toast.js             # Toast notifications
│           │   └── AudioPlayer.js       # Audio player
│           └── services/                 # Business logic
│               ├── TranslationService.js # i18n system
│               └── AnalyticsService.js   # Google Analytics
│
├── 🧪 Tests
│   ├── core/                   # Core tests
│   ├── utils/                  # Utility tests
│   ├── components/             # Component tests
│   └── README.md               # Testing guide
│
├── 📚 Documentation
│   ├── REFACTORING_PLAN.md     # Complete refactoring documentation
│   ├── INTEGRATION_GUIDE.md    # How to integrate refactored code
│   └── CHANGELOG.md            # Version history
│
├── ⚙️ Configuration
│   ├── package.json            # Dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   ├── vitest.config.js        # Testing configuration
│   ├── .eslintrc.json          # ESLint rules
│   └── .prettierrc.json        # Code formatting
│
└── 🔧 Scripts
    ├── optimize-all.js         # Asset optimization
    ├── optimize-images.js      # Image compression
    └── optimize-videos.js      # Video optimization
```

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** — Semantic markup
- **CSS3** — ITCSS architecture, BEM notation, CSS Grid/Flexbox
- **JavaScript (ES6+)** — Modules, classes, async/await
- **Vite** — Build tool and dev server

### Development Tools
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Vitest** — Unit testing
- **Sharp** — Image optimization

### Services
- **Google Analytics 4** — Usage analytics
- **i18n** — Internationalization system

---

## 📖 Documentation

### For Developers
- **[Refactoring Plan](REFACTORING_PLAN.md)** — Complete refactoring documentation with metrics
- **[Integration Guide](INTEGRATION_GUIDE.md)** — How to use refactored components
- **[Testing Guide](tests/README.md)** — How to write and run tests
- **[JavaScript API](assets/js/refactored/README.md)** — Component API documentation
- **[Changelog](CHANGELOG.md)** — Version history and changes

### Quick Links
- **[Component Examples](component-examples.html)** — Interactive component showcase
- **[Live Website](https://igorszuniewicz.com)** — Production site
- **[GitHub Repository](https://github.com/igorszuniewicz/portfolio)** — Source code

---

## 🎨 Design System

### Colors
- **40+ color variables** with semantic naming
- Primary, secondary, success, error, warning, info palettes
- Neutral grays from 50 to 900
- Transparent variants for overlays

### Spacing
- **8px base grid** — 18 spacing units (xs to 4xl)
- Consistent margin, padding, and gap utilities
- Responsive spacing with CSS custom properties

### Typography
- **10 fluid typography scales** — Responsive font sizes
- Font families: Poppins (body), Sora (headings)
- Font weights: 300 to 900
- Line heights optimized for readability

### Components
- **9 CSS components** with BEM notation
- **4 JavaScript components** with full API
- **100+ utility classes** for rapid development

---

## 🧪 Testing

### Test Coverage
- **70+ test cases** written
- **Coverage target:** 70% (lines, functions, branches, statements)
- **Framework:** Vitest with jsdom environment

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# UI mode
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Files
- `tests/core/EventEmitter.test.js` — Event system tests (30+ cases)
- `tests/utils/helpers.test.js` — Helper utilities tests (40+ cases)
- More tests in progress...

---

## 🌐 Internationalization (i18n)

### Supported Languages
- 🇬🇧 English (en)
- 🇵🇱 Polish (pl)
- 🇳🇱 Dutch (nl)

### Usage in HTML

```html
<!-- Text content -->
<h1 data-i18n="home.hero.title">Loading...</h1>

<!-- Placeholder -->
<input data-i18n-placeholder="form.email" placeholder="Loading...">

<!-- ARIA label -->
<button data-i18n-aria-label="buttons.close" aria-label="Loading...">×</button>
```

### Usage in JavaScript

```javascript
import { translationService } from './assets/js/refactored/services/TranslationService.js';

// Change language
await translationService.changeLanguage('pl');

// Translate key
const text = translationService.translate('nav.home');

// With variables
const greeting = translationService.translate('greeting', { name: 'Igor' });
```

---

## 📊 Performance

### Optimization
- ✅ **Minified assets** — CSS & JavaScript compressed
- ✅ **Image optimization** — Sharp-based compression
- ✅ **Lazy loading** — Images and components
- ✅ **Code splitting** — Separate bundles per page
- ✅ **Modern CSS** — CSS Grid, Flexbox, Custom Properties
- ✅ **ES6 Modules** — Tree-shaking enabled

### Metrics (Target)
- **Lighthouse Score:** > 90 (all categories)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Total Bundle Size:** < 200KB (minified + gzipped)

---

## 🤝 Contributing

This is a personal portfolio, but suggestions and bug reports are welcome!

### Code Style
- Follow ESLint and Prettier configurations
- Use BEM notation for CSS classes
- Write JSDoc comments for public APIs
- Add tests for new features
- Update documentation

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📈 Refactoring Stats

### Before Refactoring
- 79 JavaScript files (disorganized)
- 25 CSS files (inconsistent)
- No tests
- 44 ESLint warnings
- No design system
- No documentation

### After Refactoring (v3.0.0)
- ✅ **36 refactored files** (~12,500 lines)
- ✅ **ITCSS architecture** with BEM notation
- ✅ **70+ tests** with Vitest
- ✅ **0 ESLint warnings** (refactored code)
- ✅ **Complete design system**
- ✅ **5 documentation files**
- ✅ **100+ utility functions**
- ✅ **Production-ready**

### Phases Completed
1. ✅ **Phase 1:** CSS Foundation (Variables, Base, Typography)
2. ✅ **Phase 2:** Layout & UI Components
3. ✅ **Phase 3:** JavaScript Core (EventEmitter, Config, Storage)
4. ✅ **Phase 4:** AudioPlayer & Documentation
5. ✅ **Phase 5:** Utilities (CSS + JS, 100+ functions)
6. ✅ **Phase 6:** Services, Testing, Integration

[View Complete Refactoring Plan →](REFACTORING_PLAN.md)

---

## 📝 License

**MIT License** — Free to use for learning purposes. All project content and audio work © Igor Szuniewicz.

See [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Igor Szuniewicz**
- 🌐 Website: [igorszuniewicz.com](https://igorszuniewicz.com)
- 💼 LinkedIn: [linkedin.com/in/igor-szuniewicz](https://linkedin.com/in/igor-szuniewicz-a6877a2a3)
- 🎵 Spotify: [open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6](https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6)
- 🐙 GitHub: [github.com/Szunias](https://github.com/Szunias)
- 🎮 Itch.io: [igorszuniewicz.itch.io](https://igorszuniewicz.itch.io)

---

## 🙏 Acknowledgments

- Portfolio built with modern web technologies
- Refactored with industry best practices
- Tested with comprehensive test suite
- Documented for easy maintenance

---

<div align="center">

**Built with ❤️ by Igor Szuniewicz**

⭐ **Star this repo if you find it useful!** ⭐

[Website](https://igorszuniewicz.com) • [Projects](https://igorszuniewicz.com/projects) • [Contact](https://igorszuniewicz.com/contact)

</div>
