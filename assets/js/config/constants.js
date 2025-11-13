/**
 * Global Constants
 * Centralized configuration for magic numbers and commonly used values
 * Makes codebase more maintainable and consistent
 */

export const PERFORMANCE_CONFIG = {
  // Lazy loading
  LAZY_LOAD_MARGIN: '300px',
  LAZY_LOAD_THRESHOLD: 0.01,

  // Intersection Observer
  INTERSECTION_THRESHOLD: 0.01,
  INTERSECTION_ROOT_MARGIN: '50px',

  // Debounce & Throttle
  DEBOUNCE_DELAY: 150,
  SCROLL_DEBOUNCE: 100,
  RESIZE_DEBOUNCE: 250,

  // Timeouts
  DURATION_TIMEOUT_MS: 10000,
  IDLE_CALLBACK_TIMEOUT: 1500,

  // Limits
  MAX_INITIAL_PREFETCH: 2,
  MAX_RETRIES: 3,
};

export const ANIMATION_CONFIG = {
  // Durations (ms)
  TRANSITION_FAST: 200,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,
  FADE_IN_DURATION: 150,
  PRELOAD_STYLE_REMOVAL_DELAY: 150, // delay before removing preload styles

  // Easing
  EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.6, 1)',
  EASE_BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export const SCROLL_CONFIG = {
  // Scroll detection
  SCROLL_THRESHOLD: 50,
  HEADER_SCROLL_DISTANCE: 100,

  // Smooth scrolling
  SCROLL_BEHAVIOR: 'smooth',
  SCROLL_OFFSET: 80,
};

export const AUDIO_CONFIG = {
  // Player settings
  DEFAULT_VOLUME: 0.7,
  VOLUME_STEP: 0.1,
  SEEK_STEP: 5, // seconds

  // Update intervals
  TIME_UPDATE_INTERVAL: 100, // ms
  PROGRESS_UPDATE_FPS: 60,

  // Player UI
  TRACK_SKIP_DELAY: 500, // delay before skipping to next track (ms)
  DRAG_THRESHOLD: 3, // minimum pixel movement to count as drag
  PROGRESS_UPDATE_PRECISION: 0.1, // progress bar update precision (0.1 = 100ms)

  // Timeouts
  METADATA_LOAD_TIMEOUT: 5000, // timeout for loading audio metadata
};

export const BREAKPOINTS = {
  MOBILE_SM: 480,
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
  DESKTOP_LG: 1536,
};

export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  THEME: 'theme',
  VOLUME: 'playerVolume',
  ANALYTICS_CONSENT: 'analyticsConsent',
  LAST_PLAYED_TRACK: 'lastPlayedTrack',
};

export const API_CONFIG = {
  // Timeouts
  FETCH_TIMEOUT: 5000,
  RETRY_DELAY: 1000,

  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const CACHE_CONFIG = {
  // Cache durations (in milliseconds)
  IMAGE_CACHE: 7 * 24 * 60 * 60 * 1000, // 7 days
  DATA_CACHE: 60 * 60 * 1000, // 1 hour
  TRANSLATION_CACHE: 24 * 60 * 60 * 1000, // 24 hours
};

export const ACCESSIBILITY_CONFIG = {
  // Focus
  FOCUS_OUTLINE_WIDTH: 3,
  FOCUS_OUTLINE_OFFSET: 2,
  FOCUS_OUTLINE_COLOR: '#60a5fa',

  // Contrast
  MIN_CONTRAST_RATIO: 4.5, // WCAG AA for normal text
  MIN_CONTRAST_RATIO_LARGE: 3, // WCAG AA for large text

  // Timing
  ANNOUNCEMENT_DELAY: 100, // for screen readers
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  FILENAME: /[^/\\]+$/,
};

// Default language
export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGS = ['en', 'pl', 'nl'];

// Environment detection
export const IS_DEV =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';
export const IS_PROD = !IS_DEV;

// Feature detection
export const FEATURES = {
  HAS_INTERSECTION_OBSERVER: 'IntersectionObserver' in window,
  HAS_IDLE_CALLBACK: 'requestIdleCallback' in window,
  HAS_WEBP: (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })(),
  HAS_AVIF: (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  })(),
  PREFERS_REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)')
    .matches,
  PREFERS_HIGH_CONTRAST: window.matchMedia('(prefers-contrast: high)').matches,
};

// Export all as default object for convenience
export default {
  PERFORMANCE_CONFIG,
  ANIMATION_CONFIG,
  SCROLL_CONFIG,
  AUDIO_CONFIG,
  BREAKPOINTS,
  STORAGE_KEYS,
  API_CONFIG,
  CACHE_CONFIG,
  ACCESSIBILITY_CONFIG,
  REGEX_PATTERNS,
  DEFAULT_LANG,
  SUPPORTED_LANGS,
  IS_DEV,
  IS_PROD,
  FEATURES,
};
