# Development Guide

This document provides technical information for developers working on the Igor Szuniewicz Portfolio project.

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with SCSS preprocessing
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Poppins, Sora)
- **Build Tools**: None (vanilla approach for simplicity)
- **Version Control**: Git

### Project Philosophy

- **Performance First**: Optimized for speed and user experience
- **Accessibility**: WCAG 2.1 AA compliant
- **Progressive Enhancement**: Works without JavaScript
- **Mobile-First**: Responsive design approach
- **Semantic HTML**: Clean, meaningful markup

## 📁 File Structure

```
igorszuniewicz/
├── 📄 index.html              # Homepage
├── 👤 about.html              # About page
├── 🎵 music.html              # Music showcase
├── 📧 contact.html            # Contact page
├── 🎨 projects/               # Project pages
│   ├── index.html             # Projects overview
│   ├── akantilado.html        # Individual projects
│   ├── amorak.html
│   └── ...
├── 🖼️ assets/                 # Static assets
│   ├── css/                   # Stylesheets
│   │   ├── main.css           # Import hub for core theme styles
│   │   ├── main/              # Modularized core stylesheet segments
│   │   ├── navigation.css     # Navigation styles
│   │   ├── components/        # Component styles
│   │   └── pages/             # Page-specific styles
│   ├── js/                    # JavaScript
│   │   ├── components/        # Reusable components
│   │   ├── core/              # Core functionality
│   │   ├── features/          # Feature modules
│   │   └── utils/             # Utility functions
│   ├── images/                # Images & photos
│   │   ├── projects/          # Project images
│   │   ├── ui/                # UI elements
│   │   └── logos/             # Brand assets
│   ├── icons/                 # Favicons & icons
│   ├── fonts/                 # Font files
│   └── sass/                  # SCSS source files
├── 🌐 locales/                # Translation files
│   ├── en/                    # English translations
│   ├── pl/                    # Polish translations
│   └── nl/                    # Dutch translations
├── 📚 docs/                   # Documentation
│   └── technical/             # Technical guides
└── 📄 README.md               # Project overview
```

## 🎨 CSS Architecture

### Methodology

The project uses a custom CSS architecture based on:

- **BEM (Block Element Modifier)** for class naming
- **Component-based** organization
- **Mobile-first** responsive design
- **CSS Custom Properties** for theming

### File Organization

```
assets/css/
├── main.css                   # Import hub for core theme styles
├── main/                      # Modularized core stylesheet segments
├── navigation.css             # Navigation component
├── components/                # Reusable components
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   └── modals.css
├── pages/                     # Page-specific styles
│   ├── home.css
│   ├── about.css
│   ├── projects.css
│   └── contact.css
└── utilities/                 # Utility classes
    ├── spacing.css
    ├── typography.css
    └── layout.css
```

### CSS Naming Convention

```css
/* Block */
.project-card { }

/* Element */
.project-card__image { }
.project-card__content { }

/* Modifier */
.project-card--featured { }
.project-card--large { }

/* State */
.project-card.is-active { }
.project-card:hover { }
```

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #60a5fa;
  --color-secondary: #a78bfa;
  --color-accent: #ec4899;
  
  /* Typography */
  --font-primary: 'Poppins', sans-serif;
  --font-heading: 'Sora', sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 4rem;
  
  /* Breakpoints */
  --breakpoint-sm: 768px;
  --breakpoint-md: 1024px;
  --breakpoint-lg: 1400px;
}
```

## 🚀 JavaScript Architecture

### Module Organization

```javascript
// Core modules
assets/js/core/
├── app.js                     # Main application
├── router.js                  # Navigation routing
├── state.js                   # State management
└── events.js                  # Event handling

// Components
assets/js/components/
├── navigation.js              # Navigation component
├── language-switcher.js       # Language switching
├── scroll-reveal.js           # Scroll animations
└── modal.js                   # Modal functionality

// Features
assets/js/features/
├── project-filter.js          # Project filtering
├── contact-form.js            # Contact form
└── audio-player.js            # Audio playback

// Utilities
assets/js/utils/
├── dom.js                     # DOM utilities
├── http.js                    # HTTP requests
├── storage.js                 # Local storage
└── validation.js              # Form validation
```

### JavaScript Patterns

#### Module Pattern
```javascript
// Component module
const Navigation = (() => {
  // Private variables
  let isOpen = false;
  
  // Private methods
  const toggleMenu = () => {
    isOpen = !isOpen;
    updateUI();
  };
  
  const updateUI = () => {
    // Update UI based on state
  };
  
  // Public API
  return {
    init: () => {
      // Initialize component
    },
    toggle: toggleMenu
  };
})();
```

#### Event Delegation
```javascript
// Use event delegation for dynamic content
document.addEventListener('click', (e) => {
  if (e.target.matches('.project-card')) {
    handleProjectClick(e.target);
  }
});
```

#### Lazy Loading
```javascript
// Lazy load images
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
```

## 🌐 Internationalization (i18n)

### Translation System

The project uses a custom translation system with JSON files:

```javascript
// Translation structure
{
  "hero": {
    "title": "Interactive Sound for Modern Games",
    "description": "Interactive music systems, sound design for animation & games, and innovative audio tools."
  },
  "projects": {
    "title": "Selected Projects",
    "description": "A curated selection of recent work spanning game audio, sound design, and interactive music."
  }
}
```

### Language Switching

```javascript
// Language switcher implementation
const LanguageSwitcher = {
  currentLang: 'en',
  
  init() {
    this.loadLanguage();
    this.bindEvents();
  },
  
  loadLanguage() {
    const saved = localStorage.getItem('language');
    this.currentLang = saved || 'en';
    this.updateUI();
  },
  
  switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.updateUI();
  },
  
  updateUI() {
    // Update all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      if (translation) {
        el.textContent = translation;
      }
    });
  }
};
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Base styles for mobile */

/* Small tablets */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Large tablets / small desktops */
@media (min-width: 1024px) {
  /* Desktop styles */
}

/* Large desktops */
@media (min-width: 1400px) {
  /* Large desktop styles */
}
```

### Mobile Optimization

- **Touch-friendly**: Minimum 44px touch targets
- **Performance**: Optimized for mobile networks
- **Viewport**: Proper viewport meta tag
- **Gestures**: Swipe and touch support

## ⚡ Performance Optimization

### Image Optimization

```html
<!-- Responsive images -->
<picture>
  <source media="(min-width: 1024px)" srcset="image-large.webp">
  <source media="(min-width: 768px)" srcset="image-medium.webp">
  <img src="image-small.webp" alt="Description" loading="lazy">
</picture>
```

### CSS Optimization

```css
/* Critical CSS inline */
<style>
  /* Above-the-fold styles */
</style>

/* Non-critical CSS loaded asynchronously */
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### JavaScript Optimization

```javascript
// Lazy load non-critical JavaScript
const loadScript = (src) => {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  document.head.appendChild(script);
};

// Load after page load
window.addEventListener('load', () => {
  loadScript('assets/js/non-critical.js');
});
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Cross-browser compatibility**
  - Chrome, Firefox, Safari, Edge
  - Mobile browsers (iOS Safari, Chrome Mobile)

- [ ] **Responsive design**
  - Mobile (320px - 767px)
  - Tablet (768px - 1023px)
  - Desktop (1024px+)

- [ ] **Accessibility**
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast ratios

- [ ] **Performance**
  - Page load speed
  - Image optimization
  - JavaScript execution

### Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🔧 Development Tools

### Recommended VS Code Extensions

- **Live Server**: Local development server
- **Prettier**: Code formatting
- **ESLint**: JavaScript linting
- **CSS Peek**: CSS navigation
- **Auto Rename Tag**: HTML tag management
- **Bracket Pair Colorizer**: Code readability

### Browser DevTools

- **Chrome DevTools**: Primary debugging tool
- **Firefox Developer Tools**: Alternative debugging
- **Lighthouse**: Performance auditing
- **WebPageTest**: Performance testing

## 📦 Build Process

### Current Setup

The project currently uses a vanilla approach with no build process. This provides:

- **Simplicity**: Easy to understand and modify
- **Performance**: No build overhead
- **Compatibility**: Works everywhere

### Future Considerations

If the project grows, consider adding:

- **CSS preprocessing**: SCSS compilation
- **JavaScript bundling**: Module bundling
- **Image optimization**: Automated compression
- **Minification**: CSS/JS minification

## 🚀 Deployment

### Static Hosting

The project is designed for static hosting:

- **GitHub Pages**: Free hosting
- **Netlify**: Advanced features
- **Vercel**: Performance optimization
- **AWS S3**: Scalable hosting

### Deployment Checklist

- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Test all functionality
- [ ] Check mobile responsiveness
- [ ] Verify accessibility
- [ ] Test performance

## 🐛 Debugging

### Common Issues

1. **CSS not loading**
   - Check file paths
   - Verify CSS syntax
   - Check browser cache

2. **JavaScript errors**
   - Check browser console
   - Verify file loading order
   - Check for syntax errors

3. **Images not displaying**
   - Check file paths
   - Verify image formats
   - Check file permissions

### Debug Tools

```javascript
// Console debugging
console.log('Debug message');
console.table(data);
console.group('Group name');
console.groupEnd();

// Performance timing
console.time('Operation');
// ... code ...
console.timeEnd('Operation');
```

## 📚 Resources

### Documentation

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

### Tools

- [Can I Use](https://caniuse.com/) - Browser compatibility
- [WebPageTest](https://www.webpagetest.org/) - Performance testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Auditing

---

**Last Updated**: January 27, 2025  
**Maintained by**: Igor Szuniewicz
