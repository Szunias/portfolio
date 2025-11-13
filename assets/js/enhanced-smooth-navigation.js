/**
 * Enhanced Smooth Navigation System
 *
 * Eliminuje "flashing" przy przejściach między stronami poprzez:
 * - AJAX navigation bez przeładowania strony
 * - View Transition API dla nowoczesnych przeglądarek
 * - Zachowanie nawigacji i headera (bez re-render)
 * - Preloading stron przy hover
 * - Cache dla instant navigation
 * - Pełna integracja z systemem tłumaczeń
 */

(function() {
  'use strict';

  // ============================================================================
  // KONFIGURACJA
  // ============================================================================

  const CONFIG = {
    // Czas trwania animacji (ms)
    fadeOutDuration: 150,
    fadeInDuration: 200,

    // Preloading
    preloadDelay: 50,        // Opóźnienie przed preloadem przy hover
    preloadOnHover: true,    // Czy preloadować przy hover

    // Cache
    cacheSize: 10,           // Maksymalna liczba stron w cache
    cacheCritical: true,     // Czy cache'ować krytyczne strony przy starcie

    // Debug
    debug: false             // Logi w konsoli
  };

  // Krytyczne strony do preloadu
  const CRITICAL_PAGES = [
    '/',
    '/index.html',
    '/about.html',
    '/projects/',
    '/projects/index.html'
  ];

  // ============================================================================
  // STATE
  // ============================================================================

  let isNavigating = false;
  let currentPath = window.location.pathname;
  const pageCache = new Map();
  const preloadQueue = new Set();

  // ============================================================================
  // UTILITIES
  // ============================================================================

  function log(...args) {
    if (CONFIG.debug) {
      console.log('[SmoothNav]', ...args);
    }
  }

  function normalizeUrl(url) {
    // Normalizuj URL (usuń trailing slash, zachowaj index.html)
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  function isSameOrigin(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // LINK INTERCEPTION
  // ============================================================================

  function shouldInterceptLink(link, href) {
    // Sprawdź czy link powinien być przechwycony

    if (!href || href === '#') return false;

    // Ignoruj zewnętrzne linki
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!isSameOrigin(href)) return false;
    }

    // Ignoruj specjalne protokoły
    if (href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')) {
      return false;
    }

    // Ignoruj linki z target="_blank" lub download
    if (link.hasAttribute('target') || link.hasAttribute('download')) {
      return false;
    }

    // Ignoruj jeśli link ma data-no-smooth
    if (link.hasAttribute('data-no-smooth')) {
      return false;
    }

    // Ignoruj jeśli to ten sam URL
    const targetPath = normalizeUrl(href);
    if (targetPath === currentPath) return false;

    return true;
  }

  function handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!shouldInterceptLink(link, href)) return;

    e.preventDefault();
    e.stopPropagation();

    const targetPath = normalizeUrl(href);
    navigateToPage(targetPath);
  }

  function handleLinkHover(e) {
    if (!CONFIG.preloadOnHover) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!shouldInterceptLink(link, href)) return;

    const targetPath = normalizeUrl(href);

    // Nie preloaduj jeśli już jest w cache lub w kolejce
    if (pageCache.has(targetPath) || preloadQueue.has(targetPath)) return;

    preloadQueue.add(targetPath);
    setTimeout(() => {
      preloadPage(targetPath);
    }, CONFIG.preloadDelay);
  }

  // ============================================================================
  // PAGE LOADING
  // ============================================================================

  async function fetchPage(url) {
    log('Fetching page:', url);

    const response = await fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return parsePage(html);
  }

  function parsePage(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return {
      title: doc.title || '',
      main: doc.querySelector('main')?.innerHTML || '',
      body: doc.body.innerHTML,

      // Metadata
      meta: {
        description: doc.querySelector('meta[name="description"]')?.content || '',
        keywords: doc.querySelector('meta[name="keywords"]')?.content || '',
        ogTitle: doc.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: doc.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: doc.querySelector('meta[property="og:image"]')?.content || ''
      },

      // Scripts do wykonania
      scripts: Array.from(doc.querySelectorAll('script[data-reinit]')).map(s => s.textContent)
    };
  }

  async function loadPage(url) {
    // Sprawdź cache
    if (pageCache.has(url)) {
      log('Loading from cache:', url);
      return pageCache.get(url);
    }

    // Fetch i cache
    const pageData = await fetchPage(url);
    addToCache(url, pageData);

    return pageData;
  }

  async function preloadPage(url) {
    if (pageCache.has(url)) return;

    try {
      log('Preloading:', url);
      await loadPage(url);
    } catch (error) {
      log('Preload failed:', url, error);
    } finally {
      preloadQueue.delete(url);
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  function addToCache(url, pageData) {
    // Usuń najstarszy wpis jeśli cache pełny
    if (pageCache.size >= CONFIG.cacheSize) {
      const firstKey = pageCache.keys().next().value;
      pageCache.delete(firstKey);
      log('Cache evicted:', firstKey);
    }

    pageCache.set(url, pageData);
    log('Cached:', url, `(${pageCache.size}/${CONFIG.cacheSize})`);
  }

  function clearCache() {
    pageCache.clear();
    preloadQueue.clear();
    log('Cache cleared');
  }

  // ============================================================================
  // PAGE NAVIGATION
  // ============================================================================

  async function navigateToPage(url) {
    if (isNavigating) {
      log('Navigation in progress, ignoring:', url);
      return;
    }

    isNavigating = true;
    log('Navigating to:', url);

    try {
      // Sprawdź czy przeglądarka wspiera View Transition API
      if (document.startViewTransition) {
        await navigateWithViewTransition(url);
      } else {
        await navigateWithFallback(url);
      }

      // Aktualizuj historię przeglądarki
      if (url !== currentPath) {
        history.pushState({ path: url }, '', url);
        currentPath = url;
      }

      log('Navigation complete:', url);

    } catch (error) {
      log('Navigation failed:', error);
      // Fallback do standardowej nawigacji
      window.location.href = url;
    } finally {
      isNavigating = false;
    }
  }

  async function navigateWithViewTransition(url) {
    log('Using View Transition API');

    // Załaduj stronę
    const pageData = await loadPage(url);

    // Użyj View Transition API
    const transition = document.startViewTransition(async () => {
      updatePageContent(pageData, url);
    });

    await transition.finished;
  }

  async function navigateWithFallback(url) {
    log('Using CSS transition fallback');

    const mainEl = document.querySelector('main');
    if (!mainEl) {
      // Brak main, użyj standardowej nawigacji
      throw new Error('No main element found');
    }

    // Fade out
    mainEl.style.transition = `opacity ${CONFIG.fadeOutDuration}ms ease-out`;
    mainEl.style.opacity = '0';

    await new Promise(resolve => setTimeout(resolve, CONFIG.fadeOutDuration));

    // Załaduj i zastąp zawartość
    const pageData = await loadPage(url);
    updatePageContent(pageData, url);

    // Fade in
    mainEl.style.transition = `opacity ${CONFIG.fadeInDuration}ms ease-in`;
    requestAnimationFrame(() => {
      mainEl.style.opacity = '1';
    });

    await new Promise(resolve => setTimeout(resolve, CONFIG.fadeInDuration));

    // Usuń inline styles
    mainEl.style.transition = '';
    mainEl.style.opacity = '';
  }

  function updatePageContent(pageData, url) {
    log('Updating page content');

    // Aktualizuj title
    document.title = pageData.title;

    // Aktualizuj meta tags
    updateMetaTags(pageData.meta);

    // Aktualizuj main content
    const mainEl = document.querySelector('main');
    if (mainEl && pageData.main) {
      mainEl.innerHTML = pageData.main;
    } else {
      // Fallback: zastąp cały body oprócz headera
      const header = document.querySelector('header');
      const newBody = document.createElement('div');
      newBody.innerHTML = pageData.body;

      // Zachowaj header
      document.body.innerHTML = '';
      if (header) document.body.appendChild(header);

      // Dodaj nową zawartość
      const newMain = newBody.querySelector('main');
      if (newMain) {
        document.body.appendChild(newMain);
      }
    }

    // Scroll do góry
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Reinicjalizuj skrypty
    reinitializeScripts(pageData);

    // Zaznacz aktywny link w nawigacji
    updateActiveNavLink(url);
  }

  function updateMetaTags(meta) {
    // Aktualizuj description
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && meta.description) {
      descMeta.setAttribute('content', meta.description);
    }

    // Aktualizuj keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta && meta.keywords) {
      keywordsMeta.setAttribute('content', meta.keywords);
    }

    // Aktualizuj Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.ogTitle) {
      ogTitle.setAttribute('content', meta.ogTitle);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && meta.ogDescription) {
      ogDesc.setAttribute('content', meta.ogDescription);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && meta.ogImage) {
      ogImage.setAttribute('content', meta.ogImage);
    }
  }

  function updateActiveNavLink(url) {
    // Usuń active ze wszystkich linków
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
      link.classList.remove('active');
    });

    // Dodaj active do odpowiedniego linka
    const normalizedUrl = normalizeUrl(url);
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(link => {
      const linkUrl = normalizeUrl(link.getAttribute('href'));
      if (linkUrl === normalizedUrl) {
        link.classList.add('active');
      }
    });
  }

  // ============================================================================
  // SCRIPT REINITIALIZATION
  // ============================================================================

  function reinitializeScripts(pageData) {
    log('Reinitializing scripts');

    // 1. System tłumaczeń
    reinitializeTranslations();

    // 2. Animacje scroll-based
    reinitializeScrollAnimations();

    // 3. Event listeners specyficzne dla strony
    reinitializeEventListeners();

    // 4. Wykonaj custom scripts
    if (pageData.scripts && pageData.scripts.length > 0) {
      pageData.scripts.forEach(script => {
        try {
          eval(script);
        } catch (error) {
          log('Script execution failed:', error);
        }
      });
    }
  }

  function reinitializeTranslations() {
    // Reinicjalizuj BulletproofI18n
    if (window.BulletproofI18n && typeof window.BulletproofI18n.init === 'function') {
      log('Reinitializing BulletproofI18n');
      window.BulletproofI18n.init();
    }

    // Fallback: stary system tłumaczeń
    else if (window.setLanguage && typeof window.setLanguage === 'function') {
      const currentLang = localStorage.getItem('language') || 'en';
      log('Reinitializing translations:', currentLang);
      window.setLanguage(currentLang);
    }
  }

  function reinitializeScrollAnimations() {
    // Intersection Observer dla .fade-in elementów
    const fadeElements = document.querySelectorAll('.fade-in, .animate-on-scroll');

    if (fadeElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
      el.classList.remove('visible');
      observer.observe(el);
    });
  }

  function reinitializeEventListeners() {
    // Mobile menu (jeśli nawigacja została przeładowana)
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileToggle && mobileMenu) {
      // Usuń stare listenery poprzez clonowanie
      const newToggle = mobileToggle.cloneNode(true);
      mobileToggle.parentNode?.replaceChild(newToggle, mobileToggle);

      newToggle.addEventListener('click', (e) => {
        e.preventDefault();
        newToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileOverlay?.classList.toggle('active');
        document.body.classList.toggle('mobile-menu-open');
      });
    }

    if (mobileOverlay) {
      const newOverlay = mobileOverlay.cloneNode(true);
      mobileOverlay.parentNode?.replaceChild(newOverlay, mobileOverlay);

      newOverlay.addEventListener('click', () => {
        mobileToggle?.classList.remove('active');
        mobileMenu?.classList.remove('active');
        newOverlay.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
      });
    }

    // Zamknij mobile menu po kliknięciu w link
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle?.classList.remove('active');
        mobileMenu?.classList.remove('active');
        mobileOverlay?.classList.remove('active');
        document.body.classList.remove('mobile-menu-open');
      });
    });
  }

  // ============================================================================
  // BROWSER HISTORY
  // ============================================================================

  function handlePopState(e) {
    if (e.state && e.state.path) {
      log('Popstate:', e.state.path);
      navigateToPage(e.state.path);
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function init() {
    log('Initializing Enhanced Smooth Navigation');

    // Event listeners
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('mouseover', handleLinkHover);
    window.addEventListener('popstate', handlePopState);

    // Zapisz aktualną stronę do historii
    history.replaceState({ path: currentPath }, '', currentPath);

    // Preload krytycznych stron
    if (CONFIG.cacheCritical) {
      setTimeout(() => {
        CRITICAL_PAGES.forEach(page => {
          if (normalizeUrl(page) !== currentPath) {
            preloadPage(normalizeUrl(page));
          }
        });
      }, 1000);
    }

    log('Smooth navigation initialized');
  }

  // ============================================================================
  // START
  // ============================================================================

  // Inicjalizuj gdy DOM gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export dla debugowania
  window.smoothNav = {
    navigate: navigateToPage,
    preload: preloadPage,
    clearCache,
    cache: pageCache,
    config: CONFIG
  };

  log('Enhanced Smooth Navigation loaded');
})();
