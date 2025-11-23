# 🔄 Integration Guide - Refactored Components

Complete guide for integrating refactored CSS and JavaScript components into existing HTML pages.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Step-by-Step Integration](#step-by-step-integration)
3. [CSS Integration](#css-integration)
4. [JavaScript Integration](#javascript-integration)
5. [Service Configuration](#service-configuration)
6. [Migration Strategies](#migration-strategies)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Minimal Integration (CSS Only)

Add to your HTML `<head>`:

```html
<!-- Refactored CSS - ITCSS Architecture -->
<link rel="stylesheet" href="assets/css/main-refactored.css">
```

This gives you:
- Complete design system (colors, spacing, typography)
- All UI components styled (buttons, cards, forms, modal, toast)
- Utility classes (spacing, display, text, colors, effects)
- Responsive grid system

### Full Integration (CSS + JavaScript)

Add to `<head>`:

```html
<!-- Refactored CSS -->
<link rel="stylesheet" href="assets/css/main-refactored.css">
```

Add before closing `</body>`:

```html
<!-- Refactored JavaScript -->
<script type="module">
  import { app } from './assets/js/refactored/app.js';

  // Initialize application
  await app.init({
    analyticsId: 'G-XXXXXXXXXX', // Your Google Analytics ID
    defaultLanguage: 'en',
    enableAnalytics: true,
    debugMode: false
  });
</script>
```

---

## 📖 Step-by-Step Integration

### Step 1: Add Refactored CSS

**Location:** In the `<head>` section of your HTML

**Before:**
```html
<head>
  <!-- Old CSS files -->
  <link rel="stylesheet" href="assets/css/global/navigation.css">
  <link rel="stylesheet" href="assets/css/components/toast.css">
  <!-- ... many more CSS files ... -->
</head>
```

**After:**
```html
<head>
  <!-- Refactored CSS - Single import -->
  <link rel="stylesheet" href="assets/css/main-refactored.css">

  <!-- Optional: Keep old CSS during migration -->
  <!-- <link rel="stylesheet" href="assets/css/global/navigation.css"> -->
</head>
```

**Benefits:**
- Single CSS file instead of multiple imports
- Complete design system with CSS variables
- ITCSS architecture (organized, maintainable)
- BEM notation for all components

---

### Step 2: Add Auto-Init Attributes (Optional)

**For automatic app initialization**, add data attributes to `<html>` tag:

```html
<!DOCTYPE html>
<html lang="en" data-auto-init data-analytics-id="G-XXXXXXXXXX">
<head>
  <!-- ... -->
</head>
```

**Attributes:**
- `data-auto-init` - Automatically initializes app on DOMContentLoaded
- `data-analytics-id` - Your Google Analytics Measurement ID

**Note:** If you add these attributes, you don't need manual initialization in Step 3.

---

### Step 3: Add JavaScript Initialization

**Location:** Before closing `</body>` tag

**Option A: Auto-initialization (if using data attributes from Step 2)**

No additional code needed! The app will initialize automatically.

**Option B: Manual initialization**

```html
<script type="module">
  import { app } from './assets/js/refactored/app.js';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', async () => {
    await app.init({
      analyticsId: 'G-XXXXXXXXXX',
      defaultLanguage: 'en',
      enableAnalytics: true,
      debugMode: false // Set to true for development
    });

    console.log('App initialized!');
  });
</script>
```

**Option C: Import individual components**

If you don't want full app initialization:

```html
<script type="module">
  import { Navigation } from './assets/js/refactored/components/Navigation.js';
  import { toast } from './assets/js/refactored/components/Toast.js';

  // Initialize only what you need
  const nav = new Navigation({ currentLang: 'en' });
  nav.init();

  // Test toast
  toast.success('Page loaded successfully!');
</script>
```

---

### Step 4: Add Translation Support (i18n)

**HTML Markup:**

Add `data-i18n` attributes to elements that should be translated:

```html
<!-- Text content -->
<h1 data-i18n="home.hero.title">Audio Designer & Developer</h1>
<p data-i18n="home.hero.subtitle">Creating immersive audio experiences</p>

<!-- Placeholders -->
<input type="email" data-i18n-placeholder="form.email" placeholder="Email">

<!-- ARIA labels -->
<button data-i18n-aria-label="buttons.close" aria-label="Close">×</button>

<!-- Titles -->
<a href="#" data-i18n-title="links.github" title="GitHub Profile">
  <i class="fab fa-github"></i>
</a>
```

**JavaScript:**

Translation service is auto-initialized by `app.js`. To manually change language:

```javascript
import { translationService } from './assets/js/refactored/services/TranslationService.js';

// Change language
await translationService.changeLanguage('pl');

// Get current language
const lang = translationService.getCurrentLanguage();

// Translate key
const text = translationService.translate('nav.home');
```

---

### Step 5: Use Utility Classes

The refactored CSS includes 100+ utility classes for rapid development:

**Spacing:**
```html
<div class="p-6 mt-4 mb-8">
  <!-- padding: 48px, margin-top: 32px, margin-bottom: 64px -->
</div>
```

**Flexbox:**
```html
<div class="d-flex justify-between items-center">
  <span>Left</span>
  <span>Center</span>
  <span>Right</span>
</div>
```

**Typography:**
```html
<h1 class="text-3xl font-bold text-primary">Large Bold Title</h1>
<p class="text-secondary text-sm">Small secondary text</p>
```

**Colors:**
```html
<button class="bg-primary text-white rounded-lg p-4">
  Primary Button
</button>
```

**Effects:**
```html
<div class="shadow-lg backdrop-blur-md transition-all">
  Card with shadow and blur
</div>
```

---

## 🎨 CSS Integration

### Using Components

All components follow BEM notation:

**Buttons:**
```html
<button class="btn btn--primary">Primary Button</button>
<button class="btn btn--secondary btn--sm">Small Secondary</button>
<button class="btn btn--success btn--lg">Large Success</button>
```

**Cards:**
```html
<div class="project-card">
  <div class="project-card__image">
    <img src="image.jpg" alt="Project">
    <div class="project-card__overlay">
      <button class="btn btn--primary">View Project</button>
    </div>
  </div>
  <div class="project-card__content">
    <h3 class="project-card__title">Project Title</h3>
    <p class="project-card__description">Description</p>
  </div>
</div>
```

**Forms:**
```html
<form class="form">
  <div class="form__group">
    <label class="form__label">Name</label>
    <input type="text" class="form__input" placeholder="Your name">
  </div>

  <div class="form__group">
    <label class="form__checkbox">
      <input type="checkbox">
      <span class="form__checkbox-label">Subscribe</span>
    </label>
  </div>

  <button type="submit" class="btn btn--primary">Submit</button>
</form>
```

### Using Grid System

```html
<!-- Auto-fit grid (4 columns) -->
<div class="grid grid--cols-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>

<!-- Responsive grid -->
<div class="grid grid--responsive">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Custom gap -->
<div class="grid grid--cols-3 gap-8">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## 💻 JavaScript Integration

### Using Components

**Navigation:**
```javascript
import { Navigation } from './assets/js/refactored/components/Navigation.js';

const nav = new Navigation({
  currentLang: 'en'
});
nav.init();

// Listen to events
nav.on('languageChange', ({ language }) => {
  console.log('Language changed to:', language);
});
```

**Modal:**
```javascript
import { Modal } from './assets/js/refactored/components/Modal.js';

// Basic modal
const modal = new Modal({
  title: 'Welcome',
  content: '<p>Welcome to our website!</p>',
  size: 'md'
});
modal.open();

// Confirm dialog
const confirmed = await Modal.confirm('Are you sure?');
if (confirmed) {
  // User clicked confirm
}

// Alert dialog
await Modal.alert('Important message!');
```

**Toast:**
```javascript
import { toast } from './assets/js/refactored/components/Toast.js';

toast.success('Operation completed!');
toast.error('An error occurred');
toast.warning('Please review your input');
toast.info('New features available');
```

**AudioPlayer:**
```javascript
import { AudioPlayer } from './assets/js/refactored/components/AudioPlayer.js';

const player = new AudioPlayer({
  playlist: [
    {
      title: 'Track 1',
      artist: 'Igor Szuniewicz',
      src: 'audio/track1.mp3',
      cover: 'images/cover1.jpg'
    }
  ],
  autoplay: false
});

document.getElementById('player-container').appendChild(player.elements.container);

// Listen to events
player.on('play', ({ track }) => {
  console.log('Playing:', track.title);
});
```

### Using Services

**TranslationService:**
```javascript
import { translationService } from './assets/js/refactored/services/TranslationService.js';

// Already initialized by app.js

// Change language
await translationService.changeLanguage('pl');

// Translate
const text = translationService.translate('nav.about');
const greeting = translationService.translate('greeting', { name: 'User' });
```

**AnalyticsService:**
```javascript
import { analyticsService } from './assets/js/refactored/services/AnalyticsService.js';

// Already initialized by app.js

// Track events
analyticsService.trackEvent('button_click', {
  button_name: 'download',
  location: 'hero'
});

// Track page view
analyticsService.trackPageView('/about', 'About - Igor Szuniewicz');

// Track audio playback
analyticsService.trackAudioPlay('Track Name', 'Artist', 180);
```

### Using Utilities

**DOM Utilities:**
```javascript
import { $, $$, on, addClass, fadeIn } from './assets/js/refactored/utils/dom.js';

// Element selection
const header = $('.header');
const buttons = $$('.btn');

// Event delegation
on(document, 'click', '.btn', (e) => {
  console.log('Button clicked');
});

// Class manipulation
addClass('.card', 'active');

// Animations
await fadeIn('.modal', 300);
```

**Helper Utilities:**
```javascript
import {
  debounce,
  throttle,
  isValidEmail,
  formatDate,
  slugify
} from './assets/js/refactored/utils/helpers.js';

// Debounce search
const debouncedSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);

input.addEventListener('input', (e) => debouncedSearch(e.target.value));

// Validation
if (isValidEmail(email)) {
  // Valid email
}

// Formatting
const formatted = formatDate(new Date(), 'DD/MM/YYYY');
const slug = slugify('Hello World!'); // 'hello-world'
```

---

## ⚙️ Service Configuration

### Google Analytics Setup

1. Get your Measurement ID from Google Analytics 4
2. Add to app initialization:

```javascript
await app.init({
  analyticsId: 'G-XXXXXXXXXX', // Your actual ID
  enableAnalytics: true
});
```

Or use HTML attribute:

```html
<html data-auto-init data-analytics-id="G-XXXXXXXXXX">
```

### Translation Files Setup

Create JSON files in `/locales/` directory:

**Structure:**
```
locales/
├── en/
│   └── translations.json
├── pl/
│   └── translations.json
└── nl/
    └── translations.json
```

**Example `/locales/en/translations.json`:**
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "projects": "Projects",
    "contact": "Contact"
  },
  "home": {
    "hero": {
      "title": "Audio Designer & Developer",
      "subtitle": "Creating immersive audio experiences"
    }
  },
  "buttons": {
    "close": "Close",
    "submit": "Submit",
    "cancel": "Cancel"
  }
}
```

---

## 🔄 Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

Keep old and new code side-by-side:

```html
<head>
  <!-- New refactored CSS -->
  <link rel="stylesheet" href="assets/css/main-refactored.css">

  <!-- Keep old CSS temporarily -->
  <link rel="stylesheet" href="assets/css/old-styles.css">
</head>

<body>
  <!-- Content -->

  <!-- New refactored JS -->
  <script type="module" src="assets/js/refactored/app.js"></script>

  <!-- Keep old JS temporarily -->
  <script src="assets/js/old-scripts.js"></script>
</body>
```

**Process:**
1. Add refactored CSS/JS alongside old code
2. Update one component at a time
3. Test thoroughly
4. Remove old code once confirmed working

### Strategy 2: Page-by-Page Migration

1. Start with least critical page (e.g., component-examples.html)
2. Fully integrate refactored code
3. Test thoroughly
4. Move to next page
5. Repeat until all pages migrated

### Strategy 3: Component-by-Component

1. Keep old CSS/JS
2. Add refactored code
3. Update HTML to use refactored components (buttons first, then cards, etc.)
4. Test each component
5. Remove old component CSS/JS when done

---

## 🐛 Troubleshooting

### Issue: Styles not applying

**Check:**
1. Is `main-refactored.css` loaded?
2. Are you using correct BEM class names?
3. Browser cache - do hard refresh (Ctrl+Shift+R)
4. Check browser console for CSS load errors

**Solution:**
```html
<!-- Verify path is correct -->
<link rel="stylesheet" href="assets/css/main-refactored.css">
```

### Issue: JavaScript not initializing

**Check:**
1. Are you using `type="module"` in script tag?
2. Is path to `app.js` correct?
3. Check browser console for errors
4. Is DOM ready before initialization?

**Solution:**
```html
<script type="module">
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  async function initApp() {
    const { app } = await import('./assets/js/refactored/app.js');
    await app.init({ /* config */ });
  }
</script>
```

### Issue: Translations not working

**Check:**
1. Are translation JSON files in correct location?
2. Is TranslationService initialized?
3. Are `data-i18n` attributes correct?
4. Check browser console for fetch errors

**Solution:**
```javascript
// Check if initialized
import { translationService } from './assets/js/refactored/services/TranslationService.js';

console.log('Current language:', translationService.getCurrentLanguage());
console.log('Supported languages:', translationService.getSupportedLanguages());
```

### Issue: Analytics not tracking

**Check:**
1. Is correct Measurement ID provided?
2. Is consent granted?
3. Is network blocked by ad blocker?
4. Check Google Analytics DebugView

**Solution:**
```javascript
import { analyticsService } from './assets/js/refactored/services/AnalyticsService.js';

// Enable debug mode
await analyticsService.init('G-XXXXXXXXXX', { debug: true });

// Grant consent
analyticsService.setConsent(true);

// Test event
analyticsService.trackEvent('test_event', { test: true });
```

### Issue: Utility classes not working

**Check:**
1. Is `main-refactored.css` loaded after other CSS?
2. Are you using correct class names?
3. Is `!important` being overridden?

**Solution:**
```html
<!-- Load refactored CSS last for proper cascade -->
<link rel="stylesheet" href="assets/css/old-styles.css">
<link rel="stylesheet" href="assets/css/main-refactored.css">
```

---

## 📞 Need Help?

- **Documentation:** See `assets/js/refactored/README.md` for full API docs
- **Examples:** Open `component-examples.html` for live examples
- **Issues:** Check browser console for error messages

---

**Last Updated:** 2025-11-13
**Version:** Phase 6 Part 1
