# Refactored JavaScript Components

Modern, modular JavaScript architecture for Igor Szuniewicz Portfolio.

## 📁 Structure

```
assets/js/refactored/
├── app.js              # Main application entry point
├── core/               # Core utilities
│   ├── EventEmitter.js    - Event system base class
│   └── config.js          - Centralized configuration
├── utils/              # Helper utilities
│   ├── storage.js         - LocalStorage wrapper
│   ├── dom.js            - DOM manipulation utilities (40+ functions)
│   └── helpers.js        - General utilities (60+ functions)
├── components/         # UI Components
│   ├── Navigation.js      - Header navigation
│   ├── Modal.js           - Modal dialogs
│   ├── Toast.js           - Toast notifications
│   └── AudioPlayer.js     - Full-featured audio player
└── services/           # Business logic services
    ├── TranslationService.js - Internationalization (i18n)
    └── AnalyticsService.js   - Google Analytics 4 integration
```

## 🚀 Quick Start

### App Initialization

The main app entry point initializes all services and components:

```javascript
import { app } from './app.js';

// Initialize with configuration
await app.init({
  analyticsId: 'G-XXXXXXXXXX',
  defaultLanguage: 'en',
  enableAnalytics: true,
  debugMode: false
});

// App is now ready!
console.log('App initialized:', app.isReady());

// Get services
const translation = app.getService('translation');
const analytics = app.getService('analytics');

// Get components
const navigation = app.getComponent('navigation');
```

**Auto-initialization:**
Add attributes to `<html>` tag:
```html
<html data-auto-init data-analytics-id="G-XXXXXXXXXX">
```

### Translation Service

```javascript
import { translationService } from './services/TranslationService.js';

// Initialize
await translationService.init();

// Change language
await translationService.changeLanguage('pl');

// Translate keys
const text = translationService.translate('nav.home'); // "Home"
const greeting = translationService.translate('greeting', { name: 'Igor' }); // "Hello, Igor!"

// Get current language
const lang = translationService.getCurrentLanguage(); // 'en'

// Listen to events
translationService.on('languageChanged', ({ language }) => {
  console.log('Language changed to:', language);
});
```

**HTML Integration:**
```html
<!-- Text content -->
<p data-i18n="about.intro">Loading...</p>

<!-- Placeholder -->
<input data-i18n-placeholder="form.email" placeholder="Loading...">

<!-- ARIA label -->
<button data-i18n-aria-label="buttons.close" aria-label="Loading...">X</button>

<!-- Title attribute -->
<a data-i18n-title="links.github" title="Loading...">GitHub</a>
```

### Analytics Service

```javascript
import { analyticsService } from './services/AnalyticsService.js';

// Initialize
await analyticsService.init('G-XXXXXXXXXX', {
  debug: false,
  anonymizeIp: true
});

// Set consent
analyticsService.setConsent(true);

// Track events
analyticsService.trackEvent('button_click', {
  button_name: 'download',
  button_location: 'hero'
});

// Track page views
analyticsService.trackPageView('/about', 'About - Igor Szuniewicz');

// Track audio playback
analyticsService.trackAudioPlay('Sample Track', 'Igor Szuniewicz', 180);

// Track project views
analyticsService.trackProjectView('Akantilado', 'Game Audio');

// Track downloads
analyticsService.trackDownload('resume.pdf', 'PDF');

// Track outbound links
analyticsService.trackOutboundLink('https://github.com/user', 'GitHub');

// Track form submissions
analyticsService.trackFormSubmit('contact-form', 'contact');

// Track errors
analyticsService.trackError('Failed to load audio', 'AudioPlayer', false);

// Track performance
analyticsService.trackPerformance('page_load_time', 1250, 'ms');
```

### DOM Utilities

```javascript
import { $, $$, on, createElement, fadeIn, slideDown } from './utils/dom.js';

// Element selection
const header = $('.header');
const buttons = $$('.btn');

// Event handling with delegation
on(document, 'click', '.btn', (e) => {
  console.log('Button clicked:', e.target);
});

// Create elements
const div = createElement('div', {
  className: 'card',
  id: 'card-1'
}, [
  createElement('h2', {}, ['Title']),
  createElement('p', {}, ['Description'])
]);

// Animations
await fadeIn('.modal', 300);
await slideDown('.dropdown', 300);

// Class manipulation
addClass('.card', 'active');
removeClass('.card', 'hidden');
toggleClass('.menu', 'open');

// Visibility
show('.modal');
hide('.modal');
toggle('.dropdown');
```

### Helper Utilities

```javascript
import {
  debounce,
  throttle,
  isValidEmail,
  formatDate,
  slugify,
  deepClone
} from './utils/helpers.js';

// Function utilities
const debouncedSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);

const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

// Validators
isValidEmail('user@example.com'); // true
isValidURL('https://example.com'); // true
isValidPhone('+1-234-567-8900'); // true

const passwordResult = validatePassword('MyPass123!', {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true
});
// { valid: true, strength: 'medium', errors: [] }

// String utilities
capitalize('hello world'); // 'Hello world'
titleCase('hello world'); // 'Hello World'
camelCase('hello-world'); // 'helloWorld'
kebabCase('helloWorld'); // 'hello-world'
slugify('Hello World!'); // 'hello-world'
truncate('Long text here', 10); // 'Long te...'

// Number utilities
clamp(15, 0, 10); // 10
random(1, 10); // Random number between 1-10
formatNumber(1234567); // '1,234,567'
formatBytes(1048576); // '1 MB'
percentage(25, 100); // 25

// Date/Time utilities
formatDate(new Date(), 'YYYY-MM-DD'); // '2025-11-13'
formatDate(new Date(), 'DD/MM/YYYY HH:mm'); // '13/11/2025 14:30'
timeAgo(new Date(Date.now() - 3600000)); // '1 hour ago'
formatTime(90); // '1:30'
formatTime(3665); // '1:01:05'

// Array utilities
shuffle([1, 2, 3, 4, 5]); // [3, 1, 5, 2, 4]
unique([1, 2, 2, 3, 3]); // [1, 2, 3]
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Object utilities
const clone = deepClone({ a: 1, b: { c: 2 } });
const merged = deepMerge({ a: 1 }, { b: 2 }, { c: 3 });
pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
```

### Navigation Component

```javascript
import { Navigation } from './components/Navigation.js';

const nav = new Navigation({
  containerId: 'app-header',
  currentLang: 'en',
  onLanguageChange: (lang) => {
    console.log('Language changed to:', lang);
  }
});

nav.init();

// Listen to events
nav.on('mobileMenuOpen', () => {
  console.log('Mobile menu opened');
});

nav.on('languageChange', ({ language }) => {
  // Handle language change
  loadTranslations(language);
});
```

### Modal Component

```javascript
import { Modal } from './components/Modal.js';

// Simple modal
const modal = new Modal({
  title: 'Welcome',
  content: '<p>Welcome to my portfolio!</p>',
  size: 'md',
  closeOnOverlay: true
});

modal.open();

// Confirm dialog (Promise-based)
const confirmed = await Modal.confirm(
  'Are you sure you want to delete this?',
  {
    title: 'Confirm Delete',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  }
);

if (confirmed) {
  // User clicked confirm
}

// Alert dialog
await Modal.alert('Operation completed!', {
  title: 'Success'
});
```

### Toast Notifications

```javascript
import { toast } from './components/Toast.js';

// Simple notifications
toast.success('Saved successfully!');
toast.error('Something went wrong');
toast.warning('Please review your changes');
toast.info('New version available');

// With options
toast.success('File uploaded', {
  title: 'Upload Complete',
  duration: 5000,
  position: 'bottom-right',
  closable: true
});

// Close all toasts
toast.closeAll();
```

### AudioPlayer Component

```javascript
import { AudioPlayer } from './components/AudioPlayer.js';

const tracks = [
  {
    title: 'Epic Journey',
    artist: 'Igor Szuniewicz',
    cover: '/assets/images/covers/epic-journey.jpg',
    duration: '3:24',
    sources: [
      { url: '/assets/audio/epic-journey.mp3', type: 'audio/mpeg' }
    ]
  },
  // ... more tracks
];

const player = new AudioPlayer({
  container: '#audio-player',
  tracks: tracks,
  volume: 0.7,
  autoplay: false,
  shuffle: false,
  repeat: 'off',
  showPlaylist: true,
  showVolume: true
});

player.init();

// Control playback
player.play();
player.pause();
player.togglePlay();
player.next();
player.previous();
player.playTrack(3); // Play track at index 3

// Volume control
player.setVolume(0.5); // 50%
player.toggleMute();

// Seek
player.seek(30); // Seek to 30 seconds

// Modes
player.toggleShuffle();
player.toggleRepeat(); // Cycles: off -> all -> one -> off

// Listen to events
player.on('play', () => {
  console.log('Playing');
});

player.on('pause', () => {
  console.log('Paused');
});

player.on('trackChanged', ({ track, index }) => {
  console.log('Now playing:', track.title);
});

player.on('volumeChange', ({ volume }) => {
  console.log('Volume:', volume);
});

// Destroy when done
player.destroy();
```

## 📚 API Documentation

### EventEmitter (Base Class)

All components extend EventEmitter for event-driven architecture.

```javascript
class MyComponent extends EventEmitter {
  doSomething() {
    this.emit('something', { data: 'value' });
  }
}

const component = new MyComponent();

// Listen to events
const unsubscribe = component.on('something', (data) => {
  console.log(data);
});

// Listen once
component.once('something', (data) => {
  console.log('This will only fire once');
});

// Remove listener
component.off('something', callback);
unsubscribe(); // Alternative way to remove

// Remove all listeners
component.removeAllListeners();
component.removeAllListeners('something'); // For specific event
```

### Storage Utility

Safe localStorage wrapper with memory fallback.

```javascript
import { Storage } from './utils/storage.js';

// Set value (auto JSON serialization)
Storage.set('user', { name: 'Igor', role: 'admin' });

// Get value (auto JSON parsing)
const user = Storage.get('user'); // { name: 'Igor', role: 'admin' }

// Get with default
const theme = Storage.get('theme', 'dark');

// Check if exists
if (Storage.has('token')) {
  // Do something
}

// Remove
Storage.remove('user');

// Clear all
Storage.clear();

// Get all keys
const keys = Storage.keys();

// Get count
const count = Storage.length;
```

## 🎹 Keyboard Shortcuts

### AudioPlayer

- **Space** - Play/Pause
- **Arrow Left** - Previous track
- **Arrow Right** - Next track
- **M** - Toggle mute
- **S** - Toggle shuffle
- **R** - Toggle repeat

### Navigation

- **Escape** - Close mobile menu

### Modal

- **Escape** - Close modal
- **Tab** - Navigate between focusable elements

## ♿ Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Proper ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ High contrast support
- ✅ Reduced motion support

## 🔧 Configuration

### Global Config

All configuration is centralized in `core/config.js`:

```javascript
import {
  AUDIO_CONFIG,
  STORAGE_KEYS,
  BREAKPOINTS,
  CSS_CLASSES,
  KEYS
} from './core/config.js';

// Use in your components
const volume = AUDIO_CONFIG.DEFAULT_VOLUME;
const key = STORAGE_KEYS.LANGUAGE;
const isMobile = window.innerWidth < BREAKPOINTS.MOBILE;
```

## 🎨 Styling

Components use BEM CSS classes defined in `/assets/css/04-components/`.

Example:
- `.audio-player` - Component block
- `.audio-player__controls` - Element
- `.audio-player--playing` - Modifier

See `/assets/css/04-components/README.md` for CSS documentation.

## 🧪 Testing

```javascript
// Example test (using Vitest)
import { describe, it, expect } from 'vitest';
import { Storage } from './utils/storage.js';

describe('Storage', () => {
  it('should store and retrieve values', () => {
    Storage.set('test', 'value');
    expect(Storage.get('test')).toBe('value');
  });

  it('should return default if key not found', () => {
    expect(Storage.get('nonexistent', 'default')).toBe('default');
  });
});
```

## 🔄 Migration Guide

### From Old to New

**Old way:**
```javascript
// Old procedural code
function loadNavigation() {
  // ...
}
loadNavigation();
```

**New way:**
```javascript
// New class-based component
import { Navigation } from './refactored/components/Navigation.js';

const nav = new Navigation({ containerId: 'app-header' });
nav.init();
```

Both can coexist during migration!

## 📦 Bundle Size

| Component/Service | Size (minified) |
|-------------------|----------------|
| **Core** | |
| EventEmitter | ~1.5 KB |
| Config | ~3 KB |
| App | ~4 KB |
| **Utilities** | |
| Storage | ~2 KB |
| DOM Utilities | ~8 KB |
| Helper Utilities | ~10 KB |
| **Components** | |
| Navigation | ~6 KB |
| Modal | ~5 KB |
| Toast | ~6 KB |
| AudioPlayer | ~12 KB |
| **Services** | |
| TranslationService | ~7 KB |
| AnalyticsService | ~6 KB |
| **Total** | **~70 KB** |

*Note: These are estimates for minified code. With gzip compression, expect ~40-50% reduction.*

## 🤝 Contributing

1. Follow existing code style
2. Add JSDoc comments
3. Update this README
4. Add tests if applicable
5. Keep bundle size minimal

## 📝 License

MIT License - Igor Szuniewicz © 2025
