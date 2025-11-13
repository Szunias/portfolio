/**
 * Navigation Component
 * Handles header navigation, mobile menu, and language switching
 *
 * @class Navigation
 * @example
 * const nav = new Navigation({
 *   containerId: 'app-header',
 *   onLanguageChange: (lang) => console.log('Language changed:', lang)
 * });
 * nav.init();
 */

import { BREAKPOINTS, STORAGE_KEYS } from '../core/config.js';
import { EventEmitter } from '../core/EventEmitter.js';
import { Storage } from '../utils/storage.js';

export class Navigation extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.containerId - Container element ID
   * @param {Function} options.onLanguageChange - Language change callback
   * @param {string} options.currentLang - Current language code
   */
  constructor(options = {}) {
    super();

    this.options = {
      containerId: 'app-header',
      currentLang: Storage.get(STORAGE_KEYS.LANGUAGE) || 'en',
      onLanguageChange: null,
      ...options
    };

    // State
    this.state = {
      isMobileMenuOpen: false,
      isScrolled: false,
      currentLanguage: this.options.currentLang
    };

    // Elements (will be set after render)
    this.elements = {
      header: null,
      mobileToggle: null,
      mobileMenu: null,
      mobileOverlay: null,
      langButtons: [],
      navLinks: []
    };
  }

  /**
   * Initialize the navigation component
   * @public
   */
  init() {
    this._render();
    this._cacheElements();
    this._attachEventListeners();
    this._setActiveLink();
    this._initScrollEffect();

    this.emit('initialized');
  }

  /**
   * Render navigation HTML
   * @private
   */
  _render() {
    const container = document.getElementById(this.options.containerId) || document.body;

    const html = this._getTemplate();
    container.insertAdjacentHTML('afterbegin', html);
  }

  /**
   * Get navigation template
   * @private
   * @returns {string} HTML template
   */
  _getTemplate() {
    return `
      <!-- Header -->
      <header class="header" id="navigation-header" role="banner">
        <div class="header__container container">
          <a href="/" class="header__logo" aria-label="Igor Szuniewicz - Home">
            Igor Szuniewicz
          </a>

          <nav class="nav" role="navigation" aria-label="Main navigation">
            <ul class="nav__list">
              <li class="nav__item">
                <a href="/" class="nav__link" data-i18n="nav.home">Home</a>
              </li>
              <li class="nav__item">
                <a href="/about.html" class="nav__link" data-i18n="nav.about">About</a>
              </li>
              <li class="nav__item">
                <a href="/projects/" class="nav__link" data-i18n="nav.projects">Projects</a>
              </li>
              <li class="nav__item">
                <a href="/music.html" class="nav__link" data-i18n="nav.music">Music</a>
              </li>
              <li class="nav__item">
                <a href="/contact.html" class="nav__link" data-i18n="nav.contact">Contact</a>
              </li>
            </ul>

            <!-- Language Switcher -->
            <div class="nav__lang-switcher" role="group" aria-label="Language switcher">
              <button
                class="nav__lang-button"
                data-lang="en"
                aria-label="Switch to English"
                aria-pressed="${this.state.currentLanguage === 'en'}">
                EN
              </button>
              <button
                class="nav__lang-button"
                data-lang="pl"
                aria-label="Przełącz na polski"
                aria-pressed="${this.state.currentLanguage === 'pl'}">
                PL
              </button>
              <button
                class="nav__lang-button"
                data-lang="nl"
                aria-label="Schakel over naar Nederlands"
                aria-pressed="${this.state.currentLanguage === 'nl'}">
                NL
              </button>
            </div>

            <!-- Mobile Toggle -->
            <button
              class="nav__toggle"
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
              aria-controls="mobile-navigation">
              <span class="nav__toggle-bar"></span>
              <span class="nav__toggle-bar"></span>
              <span class="nav__toggle-bar"></span>
            </button>
          </nav>
        </div>
      </header>

      <!-- Mobile Overlay -->
      <div class="nav-overlay" id="nav-overlay" aria-hidden="true"></div>
    `;
  }

  /**
   * Cache DOM elements
   * @private
   */
  _cacheElements() {
    this.elements.header = document.getElementById('navigation-header');
    this.elements.mobileToggle = document.getElementById('mobile-menu-toggle');
    this.elements.mobileOverlay = document.getElementById('nav-overlay');
    this.elements.langButtons = Array.from(
      document.querySelectorAll('[data-lang]')
    );
    this.elements.navLinks = Array.from(
      document.querySelectorAll('.nav__link')
    );
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachEventListeners() {
    // Mobile menu toggle
    if (this.elements.mobileToggle) {
      this.elements.mobileToggle.addEventListener('click', () => {
        this._toggleMobileMenu();
      });
    }

    // Mobile overlay click
    if (this.elements.mobileOverlay) {
      this.elements.mobileOverlay.addEventListener('click', () => {
        this._closeMobileMenu();
      });
    }

    // Language buttons
    this.elements.langButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        this._handleLanguageChange(lang);
      });
    });

    // Close mobile menu on nav link click
    this.elements.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < BREAKPOINTS.TABLET) {
          this._closeMobileMenu();
        }
      });
    });

    // Escape key to close mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isMobileMenuOpen) {
        this._closeMobileMenu();
      }
    });

    // Resize handler (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth >= BREAKPOINTS.TABLET && this.state.isMobileMenuOpen) {
          this._closeMobileMenu();
        }
      }, 150);
    });
  }

  /**
   * Initialize scroll effect for header
   * @private
   */
  _initScrollEffect() {
    let ticking = false;
    const scrollThreshold = 50;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > scrollThreshold;

          if (scrolled !== this.state.isScrolled) {
            this.state.isScrolled = scrolled;
            this.elements.header?.classList.toggle('header--scrolled', scrolled);
            this.emit('scroll', { isScrolled: scrolled });
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * Set active link based on current page
   * @private
   */
  _setActiveLink() {
    const currentPath = this._normalizePath(window.location.pathname);

    this.elements.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http')) return;

      const targetPath = this._normalizePath(href);
      const isProjectsLink = targetPath === '/projects';
      const isActive = isProjectsLink
        ? currentPath === '/projects' || currentPath.startsWith('/projects/')
        : targetPath === currentPath;

      link.classList.toggle('nav__link--active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  /**
   * Normalize URL path
   * @private
   * @param {string} path - URL path
   * @returns {string} Normalized path
   */
  _normalizePath(path) {
    if (!path) return '/';

    try {
      const url = new URL(path, window.location.origin);
      let pathname = url.pathname;

      // Remove trailing slash except for root
      if (pathname !== '/' && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }

      // Remove /index.html
      if (pathname.endsWith('/index.html')) {
        pathname = pathname.replace('/index.html', '') || '/';
      }

      return pathname;
    } catch (error) {
      console.error('Error normalizing path:', path, error);
      return '/';
    }
  }

  /**
   * Toggle mobile menu
   * @private
   */
  _toggleMobileMenu() {
    if (this.state.isMobileMenuOpen) {
      this._closeMobileMenu();
    } else {
      this._openMobileMenu();
    }
  }

  /**
   * Open mobile menu
   * @private
   */
  _openMobileMenu() {
    this.state.isMobileMenuOpen = true;

    // Update UI
    this.elements.mobileToggle?.classList.add('nav__toggle--active');
    this.elements.mobileToggle?.setAttribute('aria-expanded', 'true');

    // Show navigation list
    const navList = document.querySelector('.nav__list');
    navList?.classList.add('nav__list--open');
    navList?.setAttribute('aria-hidden', 'false');

    // Show overlay
    this.elements.mobileOverlay?.classList.add('nav-overlay--visible');
    this.elements.mobileOverlay?.setAttribute('aria-hidden', 'false');

    // Prevent body scroll
    document.body.classList.add('nav-open');

    // Trap focus in menu
    this._trapFocus();

    this.emit('mobileMenuOpen');
  }

  /**
   * Close mobile menu
   * @private
   */
  _closeMobileMenu() {
    this.state.isMobileMenuOpen = false;

    // Update UI
    this.elements.mobileToggle?.classList.remove('nav__toggle--active');
    this.elements.mobileToggle?.setAttribute('aria-expanded', 'false');

    // Hide navigation list
    const navList = document.querySelector('.nav__list');
    navList?.classList.remove('nav__list--open');
    navList?.setAttribute('aria-hidden', 'true');

    // Hide overlay
    this.elements.mobileOverlay?.classList.remove('nav-overlay--visible');
    this.elements.mobileOverlay?.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.classList.remove('nav-open');

    // Release focus trap
    this._releaseFocus();

    this.emit('mobileMenuClose');
  }

  /**
   * Handle language change
   * @private
   * @param {string} lang - Language code
   */
  _handleLanguageChange(lang) {
    if (lang === this.state.currentLanguage) return;

    this.state.currentLanguage = lang;

    // Update button states
    this.elements.langButtons.forEach(button => {
      const isActive = button.dataset.lang === lang;
      button.classList.toggle('nav__lang-button--active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });

    // Save to storage
    Storage.set(STORAGE_KEYS.LANGUAGE, lang);

    // Emit event
    this.emit('languageChange', { language: lang });

    // Call callback if provided
    if (typeof this.options.onLanguageChange === 'function') {
      this.options.onLanguageChange(lang);
    }
  }

  /**
   * Trap focus within mobile menu
   * @private
   */
  _trapFocus() {
    const focusableElements = document.querySelectorAll(
      '.nav__list--open a, .nav__lang-button, .nav__toggle'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    this._focusTrap = handleTabKey;
  }

  /**
   * Release focus trap
   * @private
   */
  _releaseFocus() {
    if (this._focusTrap) {
      document.removeEventListener('keydown', this._focusTrap);
      this._focusTrap = null;
    }
  }

  /**
   * Destroy the navigation component
   * @public
   */
  destroy() {
    this._releaseFocus();
    this.removeAllListeners();

    if (this.elements.header) {
      this.elements.header.remove();
    }

    if (this.elements.mobileOverlay) {
      this.elements.mobileOverlay.remove();
    }

    this.emit('destroyed');
  }
}

export default Navigation;
