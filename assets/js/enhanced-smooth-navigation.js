/**
 * Enhanced Smooth Navigation System
 * Main entry point - uses modular architecture
 */

import { CacheManager } from './ajax/cache.js';
import { CleanupManager } from './ajax/cleanup.js';
import { MediaLoader } from './ajax/media-loader.js';
import { ScriptReinitializer } from './ajax/script-reinit.js';
import { PageHandlers } from './ajax/page-handlers.js';
import { NavigationCore } from './ajax/core.js';
import { NavigationComponent } from './components/navigation.js'; // <--- DODAJ TĘ LINIJKĘ

// ============================================================================
// CONFIGURATION
// ============================================================================

// Domyślna konfiguracja
const DEFAULT_CONFIG = {
  // Animation durations (ms)
  fadeOutDuration: 150,
  fadeInDuration: 200,

  // Preloading
  preloadDelay: 50,
  preloadOnHover: true,

  // Cache
  cacheSize: 10,
  cacheCritical: true,

  // Debug - auto-detect localhost
  debug: (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.includes('.local')
  )
};

// Połączenie domyślnej konfiguracji z ewentualną konfiguracją użytkownika (window.smoothNavOptions)
const USER_CONFIG = window.smoothNavOptions || {};
const CONFIG = { ...DEFAULT_CONFIG, ...USER_CONFIG };

// ============================================================================
// LOGGING
// ============================================================================

function log(...args) {
  if (CONFIG.debug) {
    console.log('[SmoothNav]', ...args);
  }
}

// ============================================================================
// INITIALIZATION LOGIC
// ============================================================================

let navigationCore;
let cacheManager;
let cleanupManager;
let mediaLoader;
let scriptReinitializer;
let pageHandlers;

function init() {
  try {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('Enhanced Smooth Navigation - Modular Architecture');
    log('Version: 2.0.1');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    log('Initializing Navigation UI...');           // <--- Opcjonalny log
    const navComponent = new NavigationComponent(); // <--- WKLEJ TO
    navComponent.init();
    
    // 1. Initialize Modules
    log('Initializing modules...');
    cacheManager = new CacheManager(CONFIG, log);
    cleanupManager = new CleanupManager(log);
    mediaLoader = new MediaLoader(log);
    scriptReinitializer = new ScriptReinitializer(log, cleanupManager, mediaLoader);
    pageHandlers = new PageHandlers(log, cleanupManager);
    
    navigationCore = new NavigationCore(
      CONFIG,
      log,
      cacheManager,
      cleanupManager,
      scriptReinitializer,
      mediaLoader,
      pageHandlers
    );

    // 2. Initialize Core
    navigationCore.init();

    // 3. Lazy Loading (Initial Page)
    log('━━━ INITIAL PAGE LOAD ━━━');
    mediaLoader.initializeUniversalLazyLoading();

    // 4. Setup Public API
    exposePublicApi();
    
    log('━━━ INITIALIZATION COMPLETE ━━━');

  } catch (error) {
    console.error('[SmoothNav] Critical Initialization Error:', error);
    // Fallback: upewnij się, że standardowa nawigacja działa, jeśli skrypt padnie
    document.documentElement.classList.remove('is-loading', 'is-transitioning');
  }
}

// ============================================================================
// GLOBAL EVENT LISTENERS
// ============================================================================

function setupGlobalListeners() {
  // Language Change Handler
  // Używamy Named Function, aby uniknąć duplikatów przy hot-reload/reinit
  const handleLanguageChange = (e) => {
    const newLang = e.detail?.language;
    log(`Language changed to: ${newLang}`);

    if (window.i18n && window.i18n._applyTranslations) {
      setTimeout(() => window.i18n._applyTranslations(), 10);
    }

    if (window.location.pathname.includes('music') && window.refreshMusicList) {
      setTimeout(() => window.refreshMusicList(), 50);
    }
  };

  // Zabezpieczenie przed wielokrotnym podpięciem
  window.removeEventListener('languageChanged', handleLanguageChange);
  window.addEventListener('languageChanged', handleLanguageChange);
  
  log('Global language listeners attached');
}

// ============================================================================
// PUBLIC API
// ============================================================================

function exposePublicApi() {
  window.smoothNav = {
    navigate: (url) => navigationCore?.navigateToPage(url),
    preload: (url) => cacheManager?.schedulePreload(url, (u) => navigationCore?.loadPage(u)),
    clearCache: () => cacheManager?.clear(),
    cache: cacheManager,
    config: CONFIG,
    
    // Module access for debugging
    modules: {
      cache: cacheManager,
      cleanup: cleanupManager,
      media: mediaLoader,
      scriptReinit: scriptReinitializer,
      pageHandlers: pageHandlers,
      core: navigationCore
    }
  };
}

// ============================================================================
// STARTUP
// ============================================================================

// Uruchamiamy listenery globalne od razu
setupGlobalListeners();

// Inicjalizacja systemu
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}