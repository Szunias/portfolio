/**
 * Application Configuration
 * Centralized configuration for the entire application
 *
 * @module config
 */

// Re-export everything from original constants
export * from '../../config/constants.js';

// Additional configuration can be added here

/**
 * DOM Selectors
 */
export const SELECTORS = {
  HEADER: '#navigation-header',
  MOBILE_MENU: '#mobile-navigation',
  SKIP_LINK: '.skip-link',
  MAIN_CONTENT: 'main',
  AUDIO_PLAYER: '#audio-player',
  TOAST_CONTAINER: '#toast-container',
  MODAL_OVERLAY: '.modal-overlay',
};

/**
 * CSS Classes
 */
export const CSS_CLASSES = {
  // State classes
  ACTIVE: 'active',
  OPEN: 'open',
  CLOSED: 'closed',
  LOADING: 'loading',
  ERROR: 'error',
  HIDDEN: 'hidden',
  VISIBLE: 'visible',

  // Header classes
  HEADER_SCROLLED: 'header--scrolled',

  // Navigation classes
  NAV_LINK_ACTIVE: 'nav__link--active',
  NAV_TOGGLE_ACTIVE: 'nav__toggle--active',
  NAV_LIST_OPEN: 'nav__list--open',
  NAV_OVERLAY_VISIBLE: 'nav-overlay--visible',
  LANG_BUTTON_ACTIVE: 'nav__lang-button--active',

  // Button classes
  BTN_LOADING: 'btn--loading',
  BTN_DISABLED: 'btn--disabled',

  // Modal classes
  MODAL_OPEN: 'modal-overlay--open',

  // Toast classes
  TOAST_SUCCESS: 'toast--success',
  TOAST_ERROR: 'toast--error',
  TOAST_WARNING: 'toast--warning',
  TOAST_INFO: 'toast--info',

  // Audio player classes
  PLAYER_PLAYING: 'audio-player--playing',
  PLAYER_PAUSED: 'audio-player--paused',
  PLAYER_LOADING: 'audio-player--loading',
};

/**
 * Keyboard Keys
 */
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  TAB: 'Tab',
};

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  NOT_FOUND: 'Resource not found.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  AUDIO_LOAD_ERROR: 'Failed to load audio file.',
  TRANSLATION_LOAD_ERROR: 'Failed to load translations.',
};

export default {
  SELECTORS,
  CSS_CLASSES,
  KEYS,
  HTTP_METHODS,
  HTTP_STATUS,
  ERROR_MESSAGES,
};
