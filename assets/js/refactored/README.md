# Refactored JavaScript Components

Modern, modular JavaScript architecture for Igor Szuniewicz Portfolio.

## 📁 Structure

```
assets/js/refactored/
├── core/               # Core utilities
│   ├── EventEmitter.js    - Event system base class
│   └── config.js          - Centralized configuration
├── utils/              # Helper utilities
│   └── storage.js         - LocalStorage wrapper
└── components/         # UI Components
    ├── Navigation.js      - Header navigation
    ├── Modal.js           - Modal dialogs
    ├── Toast.js           - Toast notifications
    └── AudioPlayer.js     - Full-featured audio player
```

## 🚀 Quick Start

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

| Component | Size (minified) |
|-----------|----------------|
| EventEmitter | ~1.5 KB |
| Storage | ~2 KB |
| Navigation | ~6 KB |
| Modal | ~5 KB |
| Toast | ~6 KB |
| AudioPlayer | ~12 KB |
| **Total** | **~32 KB** |

## 🤝 Contributing

1. Follow existing code style
2. Add JSDoc comments
3. Update this README
4. Add tests if applicable
5. Keep bundle size minimal

## 📝 License

MIT License - Igor Szuniewicz © 2025
