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

(function () {
  'use strict';

  // ============================================================================
  // KONFIGURACJA
  // ============================================================================

  const CONFIG = {
    // Czas trwania animacji (ms)
    fadeOutDuration: 150,
    fadeInDuration: 200,

    // Preloading
    preloadDelay: 50, // Opóźnienie przed preloadem przy hover
    preloadOnHover: true, // Czy preloadować przy hover

    // Cache
    cacheSize: 10, // Maksymalna liczba stron w cache
    cacheCritical: true, // Czy cache'ować krytyczne strony przy starcie

    // Debug
    debug: true // Logi w konsoli
  };

  // Krytyczne strony do preloadu (już znormalizowane)
  const CRITICAL_PAGES = ['/', '/about.html', '/projects', '/contact.html', '/music.html'];

  // ============================================================================
  // STATE
  // ============================================================================

  let isNavigating = false;
  let currentPath = window.location.pathname; // Will be normalized in init()
  const pageCache = new Map();
  const preloadQueue = new Set();
  const activePreloadTimeouts = new Map(); // Track active timeouts to prevent duplicates
  let scrollAnimationObserver = null; // Prevent memory leak

  // ============================================================================
  // UTILITIES
  // ============================================================================

  function log(...args) {
    if (CONFIG.debug) {
      console.log('[SmoothNav]', ...args);
    }
  }

  function normalizeUrl(url, baseUrl = window.location.href) {
    // Normalizuj URL (usuń trailing slash, konwertuj index.html do /)
    try {
      // CRITICAL: Use baseUrl to resolve relative URLs correctly
      // This ensures /projects/richter.html stays /projects/richter.html
      const urlObj = new URL(url, baseUrl);
      let pathname = urlObj.pathname;

      // Usuń trailing slash (oprócz root '/')
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }

      // Konwertuj /index.html → /
      if (pathname === '/index.html') {
        pathname = '/';
      }

      // Konwertuj /xxx/index.html → /xxx
      if (pathname.endsWith('/index.html')) {
        pathname = pathname.slice(0, -11); // Remove '/index.html'
      }

      return pathname;
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

    // Ignoruj anchor links (#section) - to tylko hash, niech przeglądarka scrolluje normalnie
    if (href.startsWith('#')) {
      return false;
    }

    // Ignoruj anchor links na tej samej stronie (/page.html#section)
    // Wyciągnij pathname i hash z href
    try {
      const url = new URL(href, window.location.href); // Use full href, not just origin!
      // Jeśli pathname taki sam jak current, ale jest hash - to anchor link
      // Używamy url.pathname (nie url.href!) bo to tylko pathname
      const normalizedPath = normalizeUrl(url.pathname);
      log('  Checking anchor:', normalizedPath, '===', currentPath, '&& hash:', url.hash);
      if (normalizedPath === currentPath && url.hash) {
        log('  → Anchor link on same page, allowing browser scroll');
        return false; // Pozwól przeglądarce obsłużyć scroll do anchora
      }
    } catch {
      // Jeśli URL parsing nie udał się, kontynuuj normalnie
    }

    // Ignoruj zewnętrzne linki
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!isSameOrigin(href)) return false;
    }

    // Ignoruj specjalne protokoły
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
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

    // CRITICAL: Resolve relative URLs first, then normalize
    // IMPORTANT: Use currentPath, not window.location.href for base URL
    let absoluteUrl;
    let baseUrl = null;
    try {
      // If we're on /projects page and href is relative (like "shadow-frames.html")
      // it should resolve to /projects/shadow-frames.html
      // Build base URL from currentPath (which is kept up-to-date during AJAX nav)
      let basePath = currentPath;
      if (!basePath.includes('.') && !basePath.endsWith('/')) {
        basePath = basePath + '/';
      }
      baseUrl = new URL(basePath, window.location.origin).href;
      absoluteUrl = new URL(href, baseUrl).href;
    } catch {
      absoluteUrl = href;
      baseUrl = window.location.href; // fallback
    }
    const targetPath = normalizeUrl(absoluteUrl);

    log('  → URL resolution:', {
      'original href': href,
      currentPath: currentPath,
      baseUrl: baseUrl,
      'window.location.href': window.location.href,
      'resolved absoluteUrl': absoluteUrl,
      'normalized targetPath': targetPath
    });

    // CRITICAL: Disable AJAX navigation for problematic pages
    // 1. Individual project pages - complex assets don't work well with AJAX
    // 2. Contact page - FontAwesome icons positioning broken with AJAX
    // This MUST be checked BEFORE the same-path check

    // Disable for individual project pages
    if (targetPath.includes('/projects/') && targetPath.endsWith('.html')) {
      // It's a file in /projects/ directory
      // Allow only /projects/index.html to use AJAX
      if (!targetPath.endsWith('/index.html')) {
        log('  ✓✓✓ PROJECT PAGE DETECTED - DISABLING AJAX for:', targetPath);
        log('  ✓✓✓ Returning FALSE from shouldInterceptLink');
        return false; // Disable AJAX - use normal navigation
      }
    }

    // CRITICAL FIX: Disable AJAX for contact page - FontAwesome icons break
    if (targetPath === '/contact.html' || targetPath === '/contact') {
      log('  ✓✓✓ CONTACT PAGE - DISABLING AJAX (FontAwesome positioning issues)');
      return false; // Use full page reload for contact
    }

    // Ignoruj jeśli to ten sam URL (pathname bez hash)
    if (targetPath === currentPath) return false;

    return true;
  }

  function handleLinkClick(e) {
    log('[handleLinkClick] Event received, target:', e.target.tagName, e.target.className);

    const link = e.target.closest('a');
    if (!link) {
      log('[handleLinkClick] No link found via closest()');
      return;
    }

    const href = link.getAttribute('href');
    log('Link clicked:', href);
    log('  Link element:', link);
    log('  e.target:', e.target);
    log('  window.location.pathname:', window.location.pathname);
    log('  window.location.href:', window.location.href);
    log('  currentPath:', currentPath);

    // CRITICAL: Check if this is a project page link BEFORE calling shouldInterceptLink
    // This provides better debugging info
    if (href && (href.includes('projects/') || href.includes('.html'))) {
      log('  Potential project link detected, will check in shouldInterceptLink');
    }

    if (!shouldInterceptLink(link, href)) {
      log('Link not intercepted - using normal browser navigation for:', href);

      // CRITICAL FIX: For relative project links, we need to set the correct full path
      // When on /projects page and clicking "amorak.html", browser needs "/projects/amorak.html"
      // Check both currentPath (for AJAX nav) and window.location.pathname (for initial load)
      const isOnProjectsPage =
        currentPath === '/projects' ||
        currentPath === '/projects/' ||
        window.location.pathname === '/projects' ||
        window.location.pathname === '/projects/';

      if (isOnProjectsPage && href && !href.startsWith('/') && !href.startsWith('http')) {
        // It's a relative link from /projects page - fix the path
        e.preventDefault(); // We need to prevent default to set correct URL
        const correctUrl = '/projects/' + href;
        log('  → Fixing relative project URL:', href, '→', correctUrl);
        window.location.href = correctUrl;
        return;
      }

      // For other cases, let browser handle normally
      return;
    }

    // Only prevent default if we're going to handle it with AJAX
    e.preventDefault();
    e.stopPropagation();

    // CRITICAL: For relative URLs on directory pages (like /projects/),
    // we need to resolve them correctly BEFORE normalization.
    // PROBLEM: link.href uses window.location.href which may be outdated after AJAX nav
    // SOLUTION: Use currentPath to construct the correct base URL

    // First, resolve the href to absolute URL
    let absoluteUrl;
    try {
      // If href is already absolute URL, use it
      if (href.startsWith('http://') || href.startsWith('https://')) {
        absoluteUrl = href;
      } else {
        // CRITICAL: Construct base URL from currentPath instead of window.location
        // This ensures relative URLs are resolved correctly after AJAX navigation
        // IMPORTANT: For directory paths, add trailing slash so relative URLs resolve correctly
        let basePath = currentPath;
        if (!basePath.includes('.') && !basePath.endsWith('/')) {
          basePath = basePath + '/';
        }
        const baseUrl = new URL(basePath, window.location.origin).href;
        log('  Resolving relative URL with base:', baseUrl);
        absoluteUrl = new URL(href, baseUrl).href;
      }
      log('  Click - Resolved href:', href, '→', absoluteUrl);
    } catch (err) {
      // If URL parsing fails, use href as-is
      absoluteUrl = href;
      log('  Failed to resolve href, using as-is:', href, err);
    }

    // Now normalize the absolute URL
    const targetPath = normalizeUrl(absoluteUrl);

    // DOUBLE CHECK: If this is a project page, it should have been caught by shouldInterceptLink
    // This is a safety check in case something went wrong
    if (
      targetPath.includes('/projects/') &&
      targetPath.endsWith('.html') &&
      !targetPath.endsWith('/index.html')
    ) {
      log('  WARNING: Project page slipped through! Force-disabling AJAX for:', targetPath);
      // Remove event prevention and let browser handle it normally
      window.location.href = href;
      return;
    }

    log('Navigating with AJAX to normalized path:', targetPath);
    navigateToPage(targetPath);
  }

  function handleLinkHover(e) {
    if (!CONFIG.preloadOnHover) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // Don't even check shouldInterceptLink for project pages - just skip
    if (href && href.includes('.html') && !href.includes('index.html')) {
      // Likely a project page, skip preloading
      return;
    }

    if (!shouldInterceptLink(link, href)) return;

    // CRITICAL: Resolve relative URLs before normalization
    // Use currentPath as base URL to handle post-AJAX navigation correctly
    let absoluteUrl;
    try {
      // If href is already absolute URL, use it
      if (href.startsWith('http://') || href.startsWith('https://')) {
        absoluteUrl = href;
      } else {
        // Construct base URL from currentPath instead of window.location
        // Add trailing slash for directory paths
        let basePath = currentPath;
        if (!basePath.includes('.') && !basePath.endsWith('/')) {
          basePath = basePath + '/';
        }
        const baseUrl = new URL(basePath, window.location.origin).href;
        absoluteUrl = new URL(href, baseUrl).href;
      }
      log('  Hover - Resolved href:', href, '→', absoluteUrl);
    } catch {
      absoluteUrl = href;
    }
    const targetPath = normalizeUrl(absoluteUrl);

    // Nie preloaduj jeśli już jest w cache, w kolejce, lub timeout już działa
    if (
      pageCache.has(targetPath) ||
      preloadQueue.has(targetPath) ||
      activePreloadTimeouts.has(targetPath)
    ) {
      return;
    }

    // Dodaj do queue i ustaw timeout
    preloadQueue.add(targetPath);
    const timeoutId = setTimeout(() => {
      activePreloadTimeouts.delete(targetPath); // Usuń timeout po wykonaniu
      preloadPage(targetPath);
    }, CONFIG.preloadDelay);

    // Śledź aktywny timeout
    activePreloadTimeouts.set(targetPath, timeoutId);
  }

  // ============================================================================
  // PAGE LOADING
  // ============================================================================

  async function fetchPage(url) {
    log('━━━ fetchPage START ━━━');
    log('  Requested URL:', url);

    // Konwertuj znormalizowany path na właściwy file path dla fetch
    let fetchUrl = url;

    // Root path
    if (url === '/') {
      fetchUrl = '/index.html';
      log('  → Root path, using:', fetchUrl);
    }
    // Path bez rozszerzenia = katalog, dodaj index.html
    else if (!url.includes('.')) {
      fetchUrl = url + '/index.html';
      log('  → Directory path (no extension), using:', fetchUrl);
    }
    // Path z trailing slash
    else if (url.endsWith('/')) {
      fetchUrl = url + 'index.html';
      log('  → Trailing slash, using:', fetchUrl);
    }
    // Path z rozszerzeniem - użyj jak jest
    else {
      log('  → File path, using as-is:', fetchUrl);
    }

    const response = await fetch(fetchUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    log('  Response status:', response.status);
    log('  Response URL:', response.url);
    log('  Was redirected:', fetchUrl !== new URL(response.url).pathname);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    log('  HTML length:', html.length);
    log('  HTML preview:', html.substring(0, 200).replace(/\s+/g, ' '));

    const pageData = parsePage(html);
    log('  Parsed title:', pageData.title);
    log('━━━ fetchPage END ━━━');

    return pageData;
  }

  function parsePage(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get main element
    const mainElement = doc.querySelector('main');

    // Extract inline styles from head
    const inlineStyles = Array.from(doc.querySelectorAll('head style')).map(
      (style) => style.textContent
    );

    // Extract stylesheet links from head
    const stylesheetLinks = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]')).map(
      (link) => ({
        href: link.getAttribute('href'),
        media: link.getAttribute('media') || 'all'
      })
    );

    return {
      title: doc.title || '',
      // Use null jeśli brak main, nie empty string (null !== '' dla warunków)
      main: mainElement ? mainElement.innerHTML : null,
      body: doc.body.innerHTML,

      // Styles from head - CRITICAL for proper rendering!
      styles: {
        inline: inlineStyles,
        links: stylesheetLinks
      },

      // Metadata
      meta: {
        description: doc.querySelector('meta[name="description"]')?.content || '',
        keywords: doc.querySelector('meta[name="keywords"]')?.content || '',
        ogTitle: doc.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: doc.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: doc.querySelector('meta[property="og:image"]')?.content || ''
      },

      // Scripts do wykonania
      scripts: Array.from(doc.querySelectorAll('script[data-reinit]')).map((s) => s.textContent)
    };
  }

  async function loadPage(url) {
    log('loadPage called for:', url);

    // Sprawdź cache
    if (pageCache.has(url)) {
      log('✓ Loading from cache:', url);
      const cached = pageCache.get(url);
      log('  Cached page title:', cached.title);
      return cached;
    }

    // Fetch i cache
    log('⚠ Cache miss, fetching:', url);
    const pageData = await fetchPage(url);
    log('✓ Fetched page:', url, 'title:', pageData.title);
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
    log('✓ Cached:', url, `(${pageCache.size}/${CONFIG.cacheSize})`, '- Title:', pageData.title);

    // Log all cache keys for debugging
    if (CONFIG.debug) {
      const allKeys = Array.from(pageCache.keys());
      log('  Cache keys:', allKeys.join(', '));
    }
  }

  function clearCache() {
    // Clear cache
    pageCache.clear();
    preloadQueue.clear();

    // Cancel all pending preload timeouts
    activePreloadTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    activePreloadTimeouts.clear();

    // Disconnect scroll animation observer
    if (scrollAnimationObserver) {
      scrollAnimationObserver.disconnect();
      scrollAnimationObserver = null;
    }

    log('Cache cleared');
  }

  // ============================================================================
  // PAGE NAVIGATION
  // ============================================================================

  async function navigateToPage(url) {
    if (isNavigating) {
      log('⚠ Navigation in progress, ignoring:', url);
      return;
    }

    isNavigating = true;
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('▶ NAVIGATION START');
    log('  From:', currentPath);
    log('  To:', url);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // CRITICAL: Update currentPath BEFORE navigation
      // This ensures reinitializePageSpecificScripts() uses correct path
      const previousPath = currentPath;
      currentPath = url;
      log('✓ currentPath updated:', currentPath);

      // Sprawdź czy przeglądarka wspiera View Transition API
      if (document.startViewTransition) {
        await navigateWithViewTransition(url);
      } else {
        await navigateWithFallback(url);
      }

      // Aktualizuj historię przeglądarki
      if (url !== previousPath) {
        history.pushState({ path: url }, '', url);
      }

      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      log('✓ NAVIGATION COMPLETE');
      log('  Current path:', currentPath);
      log('  Current title:', document.title);
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      log('✗ NAVIGATION FAILED:', error);
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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

    let mainEl = document.querySelector('main');
    if (!mainEl) {
      // Brak main, użyj standardowej nawigacji
      throw new Error('No main element found');
    }

    // Fade out
    mainEl.style.transition = `opacity ${CONFIG.fadeOutDuration}ms ease-out`;
    mainEl.style.opacity = '0';

    await new Promise((resolve) => setTimeout(resolve, CONFIG.fadeOutDuration));

    // Załaduj i zastąp zawartość
    const pageData = await loadPage(url);
    updatePageContent(pageData, url);

    // WAŻNE: Po updatePageContent, stary mainEl może być zastąpiony!
    // Pobierz NOWY element z DOM
    mainEl = document.querySelector('main');
    if (!mainEl) {
      log('Warning: No main element after update');
      return;
    }

    // Fade in NOWEGO elementu
    mainEl.style.transition = `opacity ${CONFIG.fadeInDuration}ms ease-in`;
    requestAnimationFrame(() => {
      mainEl.style.opacity = '1';
    });

    await new Promise((resolve) => setTimeout(resolve, CONFIG.fadeInDuration));

    // Usuń inline styles
    mainEl.style.transition = '';
    mainEl.style.opacity = '';
  }

  function updatePageContent(pageData, url) {
    log('━━━ updatePageContent START ━━━');
    log('  URL:', url);
    log('  Page title:', pageData.title);
    log('  Current document title:', document.title);
    log('  Inline styles count:', pageData.styles?.inline?.length || 0);

    // Aktualizuj title
    document.title = pageData.title;
    log('✓ Title updated to:', pageData.title);

    // CRITICAL: Load styles BEFORE updating content!
    updateStyles(pageData.styles);
    log('✓ Styles updated');

    // Aktualizuj meta tags
    updateMetaTags(pageData.meta);

    // ========================================================================
    // CRITICAL FIX: Replace ENTIRE body content (except header & infrastructure)
    // Problem: tylko zamienialiśmy <main>, ale hero sections i inne elementy
    // POZA <main> zostawały z poprzedniej strony!
    // ========================================================================

    log('  Replacing body content...');

    // Elementy które musimy ZACHOWAĆ (infrastructure)
    const infrastructureSelectors = [
      'header', // Navigation
      '.bg-gradient', // Background
      '.bg-grid',
      '.bg-orbs',
      '.skip-link',
      '.mobile-menu-overlay', // Mobile menu
      '.mobile-menu'
    ];

    // Zbierz elementy do zachowania
    const elementsToKeep = new Set();
    infrastructureSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => elementsToKeep.add(el));
    });

    // CRITICAL: Keep CORE scripts (infrastructure), remove page-specific
    const coreScriptPaths = [
      'enhanced-smooth-navigation.js',
      'components/navigation.js',
      'components/custom-cursor.js',
      'components/toast.js',
      'components/back-to-top.js',
      'translations.js',
      'preload-lang.js'
    ];

    // Keep core scripts, mark page-specific scripts for removal
    document.querySelectorAll('script[src]').forEach((script) => {
      const src = script.getAttribute('src') || '';
      const isCore = coreScriptPaths.some((corePath) => src.includes(corePath));

      if (isCore) {
        elementsToKeep.add(script);
        log(`    → Keeping core script: ${src}`);
      } else if (src) {
        log(`    → Will remove page-specific script: ${src}`);
        // Don't add to elementsToKeep - will be removed
      }
    });

    // Keep inline styles (they're managed separately by updateStyles)
    document.querySelectorAll('style').forEach((style) => {
      elementsToKeep.add(style);
    });

    // Usuń wszystko OPRÓCZ infrastructure
    const bodyChildren = Array.from(document.body.children);
    log(
      `  Removing ${bodyChildren.length} body children (keeping ${elementsToKeep.size} infrastructure elements)`
    );

    bodyChildren.forEach((child) => {
      if (!elementsToKeep.has(child)) {
        child.remove();
      }
    });

    // Parse nową zawartość body
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pageData.body;

    // Znajdź header w starej zawartości (żeby wiedzieć gdzie wstawiać nowe elementy)
    const existingHeader = document.querySelector('header');

    // Wstaw nową zawartość (OPRÓCZ header i innych infrastructure)
    const newElements = Array.from(tempDiv.children);
    log(`  Adding ${newElements.length} new elements from fetched page`);

    // CRITICAL: Track last inserted element to maintain order
    // Without this, elements get inserted in REVERSE order!
    let lastInsertedElement = existingHeader;

    newElements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const isInfrastructure = infrastructureSelectors.some((selector) => {
        if (selector.startsWith('.')) {
          return el.classList.contains(selector.substring(1));
        }
        return tagName === selector;
      });

      // Special handling for scripts
      if (tagName === 'script') {
        const src = el.getAttribute('src') || '';
        const isCore = coreScriptPaths.some((corePath) => src.includes(corePath));

        if (!isCore && src) {
          // This is a page-specific script - add it!
          log(`    → Adding page-specific script: ${src}`);

          // Create new script element (copying doesn't work, must create fresh)
          const newScript = document.createElement('script');
          newScript.type = el.type || 'module';
          newScript.src = el.src;

          // Copy other attributes
          Array.from(el.attributes).forEach((attr) => {
            if (attr.name !== 'src' && attr.name !== 'type') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });

          document.body.appendChild(newScript);
        } else {
          log(`    → Skipped core script: ${src}`);
        }
        return;
      }

      // Pomiń infrastructure (już mamy)
      if (!isInfrastructure) {
        // Wstaw AFTER last inserted element (to maintain order!)
        if (lastInsertedElement && lastInsertedElement.nextSibling) {
          document.body.insertBefore(el, lastInsertedElement.nextSibling);
        } else if (lastInsertedElement) {
          // No next sibling, append after parent
          lastInsertedElement.parentNode.appendChild(el);
        } else {
          // No reference, append to body
          document.body.appendChild(el);
        }

        lastInsertedElement = el; // Update reference for next element
        log(`    → Added <${tagName}> element`);
      } else {
        log(`    → Skipped <${tagName}> (infrastructure)`);
      }
    });

    log('✓ Body content replaced');

    // Scroll do góry
    window.scrollTo({ top: 0, behavior: 'instant' });

    // CRITICAL: Force immediate script reinitialization
    // This must happen IMMEDIATELY after content swap
    setTimeout(() => {
      log('━━━ FORCE REINITIALIZING ALL SCRIPTS AND LAZY LOADING ━━━');

      // 1. FIRST PASS: Aggressive image loading
      log('  → Pass 1: Loading all images');
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        // If has data-src, use it
        if (img.dataset.src && img.dataset.src !== img.src) {
          const srcValue = img.dataset.src;
          img.src = srcValue;
          img.removeAttribute('data-src');
          log(`    • Image loaded: ${srcValue.substring(srcValue.lastIndexOf('/') + 1)}`);
        }
        // Force eager loading
        img.loading = 'eager';
        // Remove lazy classes to force visibility
        img.classList.add('loaded');
      });

      // 2. SECOND PASS: Aggressive video loading
      log('  → Pass 2: Loading all videos');
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        // Set all required attributes for autoplay
        if (video.hasAttribute('data-autoplay') || video.hasAttribute('autoplay')) {
          video.setAttribute('autoplay', '');
          video.setAttribute('muted', '');
          video.setAttribute('playsinline', '');
          video.setAttribute('loop', '');
          video.removeAttribute('data-autoplay');
        }

        // Load sources
        const sources = video.querySelectorAll('source');
        let sourcesLoaded = 0;
        sources.forEach((source) => {
          if (source.dataset.src && !source.src) {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
            sourcesLoaded++;
          }
        });

        // Reload video if sources were loaded
        if (sourcesLoaded > 0) {
          video.load();
          video.classList.add('loaded');
          log(`    • Video loaded with ${sourcesLoaded} sources`);

          // Try to play if in viewport
          const rect = video.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0 && video.hasAttribute('autoplay')) {
            video.play().catch(() => {
              // Autoplay blocked - that's ok
            });
          }
        }
      });

      // 3. THIRD PASS: Aggressive iframe loading
      log('  → Pass 3: Loading all iframes');
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        if (iframe.dataset.src && !iframe.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          iframe.classList.add('loaded');
          log(`    • Iframe loaded: ${iframe.src.substring(0, 50)}...`);
        }
      });

      // 4. Force re-run performance boost (this will catch any remaining lazy elements)
      if (typeof window.runOptimizations === 'function') {
        log('  → Running performance optimizations');
        window.runOptimizations();
      }

      // 5. Then run normal reinitialization
      log('  → Reinitializing scripts');
      reinitializeScripts(pageData);

      // 6. CRITICAL: Reinitialize translations IMMEDIATELY (before event dispatch)
      // Pass currentPath because window.location.pathname hasn't been updated yet
      log('  → Reinitializing translations (immediate) for path:', currentPath);
      reinitializeTranslations(currentPath);

      // 7. Dispatch event for any other scripts
      window.dispatchEvent(new Event('pageContentLoaded'));
      log('  → Dispatched pageContentLoaded event');

      // 8. FINAL PASS: Clean up any remaining data-src attributes (300ms delay)
      setTimeout(() => {
        log('  → Final cleanup pass');

        // Fix any remaining images
        document.querySelectorAll('img[data-src]').forEach((img) => {
          const srcValue = img.dataset.src;
          img.src = srcValue;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          log(`    • Cleaned up image: ${srcValue.substring(srcValue.lastIndexOf('/') + 1)}`);
        });

        // Fix any remaining videos
        document.querySelectorAll('video source[data-src]').forEach((source) => {
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
          const video = source.closest('video');
          if (video) {
            video.load();
            video.classList.add('loaded');
          }
        });

        // Fix any remaining iframes
        document.querySelectorAll('iframe[data-src]').forEach((iframe) => {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          iframe.classList.add('loaded');
        });

        // Run performance-boost optimizations AGAIN (catches dynamically added elements)
        if (window.optimizeImages) window.optimizeImages();
        if (window.optimizeVideoLoading) window.optimizeVideoLoading();
        if (window.optimizeIframeLoading) window.optimizeIframeLoading();

        // Force i18n to apply translations
        if (window.i18n && window.i18n._applyTranslations) {
          window.i18n._applyTranslations();
        }

        log('━━━ ALL REINITIALIZATION COMPLETE ━━━');
      }, 300);
    }, 10); // Very short delay to ensure DOM is ready

    // Zaznacz aktywny link w nawigacji
    updateActiveNavLink(url);

    log('━━━ updatePageContent COMPLETE ━━━');
    log('  Final document.title:', document.title);
    log('  Final URL:', url);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  function updateStyles(styles) {
    if (!styles) return;

    // Remove old page-specific styles (marked with data-page-style)
    document.querySelectorAll('style[data-page-style], link[data-page-style]').forEach((el) => {
      el.remove();
    });

    // Add new inline styles
    if (styles.inline && styles.inline.length > 0) {
      styles.inline.forEach((styleContent, index) => {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-page-style', 'true');
        styleEl.textContent = styleContent;
        document.head.appendChild(styleEl);
        log(`Added inline style ${index + 1}/${styles.inline.length}`);
      });
    }

    // Add new stylesheet links (only if not already loaded)
    if (styles.links && styles.links.length > 0) {
      styles.links.forEach((linkData) => {
        // Check if this stylesheet is already loaded (global styles)
        const existingLink = document.querySelector(
          `link[rel="stylesheet"][href="${linkData.href}"]`
        );
        if (!existingLink) {
          const linkEl = document.createElement('link');
          linkEl.rel = 'stylesheet';
          linkEl.href = linkData.href;
          linkEl.media = linkData.media;
          linkEl.setAttribute('data-page-style', 'true');

          // CRITICAL: For FontAwesome and icon fonts, ensure they load properly
          // by triggering a reflow after load
          if (linkData.href.includes('font-awesome') || linkData.href.includes('fontawesome')) {
            linkEl.addEventListener('load', () => {
              log(`FontAwesome loaded, triggering icon reflow`);
              // Force browser to recalculate icon styles
              // Small delay to ensure font files are also loaded
              setTimeout(() => {
                const icons = document.querySelectorAll('.fa, .fab, .fas, .far, .fal, .fa-brands');
                icons.forEach((icon) => {
                  // Force recalculation by toggling font-family
                  icon.style.fontFamily = 'inherit';
                  icon.offsetHeight; // Trigger reflow
                  icon.style.fontFamily = '';

                  // Also force display recalc
                  icon.style.display = 'none';
                  icon.offsetHeight; // Trigger reflow
                  icon.style.display = '';
                });

                // If FontAwesome API is available, use it
                if (window.FontAwesome && window.FontAwesome.dom) {
                  window.FontAwesome.dom.i2svg();
                }

                log(`FontAwesome icons refreshed: ${icons.length} icons`);
              }, 100); // Slightly longer delay for better reliability
            });
          }

          document.head.appendChild(linkEl);
          log(`Added stylesheet: ${linkData.href}`);
        } else {
          // Stylesheet already exists - force reflow of icons anyway
          if (linkData.href.includes('font-awesome') || linkData.href.includes('fontawesome')) {
            log(`FontAwesome already loaded, forcing icon reflow`);
            setTimeout(() => {
              document.querySelectorAll('.fa, .fab, .fas, .far, .fal').forEach((icon) => {
                // Force recalculation by toggling font-family
                icon.style.fontFamily = 'inherit';
                icon.offsetHeight; // Trigger reflow
                icon.style.fontFamily = '';

                // Also force display recalc
                icon.style.display = 'none';
                icon.offsetHeight; // Trigger reflow
                icon.style.display = '';
              });
              log(
                `FontAwesome icons refreshed (existing CSS): ${document.querySelectorAll('.fa, .fab, .fas, .far, .fal').length} icons`
              );
            }, 150);
          }
        }
      });
    }
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
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach((link) => {
      link.classList.remove('active');
    });

    // Dodaj active do odpowiedniego linka
    const normalizedUrl = normalizeUrl(url);
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach((link) => {
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

    // 0. FIRST PASS: Early lazy loading for immediate data-src elements
    initializeUniversalLazyLoading();

    // CRITICAL: Force immediate re-run of all optimizations
    // This ensures ALL images, videos, and iframes are processed
    setTimeout(() => {
      log('  → Force re-running all performance optimizations');

      // Re-initialize performance-boost.js optimizations for new content
      if (typeof window.optimizeImages === 'function') {
        window.optimizeImages();
        log('    ✓ Images optimization triggered');
      }
      if (typeof window.optimizeVideoLoading === 'function') {
        window.optimizeVideoLoading();
        log('    ✓ Video optimization triggered');
      }
      if (typeof window.optimizeIframeLoading === 'function') {
        window.optimizeIframeLoading();
        log('    ✓ Iframe optimization triggered');
      }

      // Also dispatch event to notify performance-boost.js that content has changed
      window.dispatchEvent(new CustomEvent('contentUpdated'));

      // SECOND PASS: Run optimizations again after a small delay
      // to catch any dynamically added content
      setTimeout(() => {
        log('  → Second pass optimization (catching late content)');
        if (typeof window.optimizeImages === 'function') {
          window.optimizeImages();
        }
      }, 500);
    }, 100); // Small delay to ensure DOM is fully updated

    // 1. Animacje scroll-based
    reinitializeScrollAnimations();

    // 2. Event listeners specyficzne dla strony
    reinitializeEventListeners();

    // 3. Page-specific scripts (music, projects, etc.)
    reinitializePageSpecificScripts();

    // 4. Wykonaj custom scripts
    if (pageData.scripts && pageData.scripts.length > 0) {
      pageData.scripts.forEach((script) => {
        try {
          eval(script);
        } catch (error) {
          log('Script execution failed:', error);
        }
      });
    }

    // 5. SECOND PASS: Delayed lazy loading for dynamically added elements
    //    Page-specific scripts may add images/videos with data-src
    //    This catches them after scripts have run
    setTimeout(() => {
      log('  → Running delayed lazy loading (second pass)');
      initializeUniversalLazyLoading();
    }, 500);
  }

  function initializeUniversalLazyLoading() {
    log('  → Initializing universal lazy loading');

    // IMAGES: Convert ALL data-src → src
    const allImages = Array.from(document.querySelectorAll('img[data-src]'));
    log(`    Found ${allImages.length} images with data-src`);

    allImages.forEach((img, index) => {
      if (img.dataset.src) {
        const srcValue = img.dataset.src;
        img.src = srcValue;
        img.removeAttribute('data-src');

        // Mark as loaded when image loads
        img.addEventListener(
          'load',
          () => {
            img.classList.add('loaded');
          },
          { once: true }
        );

        // Also mark as loaded immediately if image is already cached
        if (img.complete) {
          img.classList.add('loaded');
        }

        log(`    ✓ Image ${index + 1}: ${img.src.substring(img.src.lastIndexOf('/') + 1)}`);
      }
    });

    // ALSO handle images with lazy-img or lazy-cover class (even without data-src)
    const lazyImages = Array.from(document.querySelectorAll('img.lazy-img, img.lazy-cover'));
    log(`    Found ${lazyImages.length} images with lazy classes`);

    lazyImages.forEach((img) => {
      // If has data-src, convert it
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }

      // Ensure loading attribute is set
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'eager');
      }

      // Mark as loaded when loads
      img.addEventListener(
        'load',
        () => {
          img.classList.add('loaded');
        },
        { once: true }
      );

      // Also mark as loaded immediately if already cached
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      }
    });

    // VIDEOS: Convert ALL data-autoplay and data-src in sources
    const allVideos = Array.from(
      document.querySelectorAll('video[data-autoplay], video source[data-src]')
    );
    const videoElements = Array.from(document.querySelectorAll('video'));
    log(`    Found ${videoElements.length} video elements`);

    videoElements.forEach((video, index) => {
      let modified = false;

      // Set autoplay if data-autoplay present
      if (video.hasAttribute('data-autoplay')) {
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('loop', '');
        video.removeAttribute('data-autoplay');
        modified = true;
      }

      // Convert source data-src to src
      const sources = video.querySelectorAll('source[data-src]');
      sources.forEach((source) => {
        if (source.dataset.src) {
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
          modified = true;
        }
      });

      // Reload video if sources were modified
      if (modified && sources.length > 0) {
        video.load();
        video.classList.add('loaded');
        log(`    ✓ Video ${index + 1}: loaded with ${sources.length} sources`);

        // Try to play if in viewport
        const rect = video.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0 && video.hasAttribute('autoplay')) {
          video.play().catch(() => {
            // Autoplay blocked - that's ok
          });
        }
      }
    });

    // ALSO handle videos with data-lazy-video attribute
    const lazyVideos = Array.from(document.querySelectorAll('video[data-lazy-video]'));
    log(`    Found ${lazyVideos.length} videos with data-lazy-video`);

    lazyVideos.forEach((video) => {
      const sources = video.querySelectorAll('source[data-src]');
      if (sources.length > 0) {
        sources.forEach((source) => {
          if (source.dataset.src && !source.src) {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
          }
        });

        if (video.hasAttribute('data-autoplay')) {
          video.setAttribute('autoplay', '');
          video.setAttribute('muted', '');
          video.setAttribute('playsinline', '');
          video.setAttribute('loop', '');
          video.removeAttribute('data-autoplay');
        }

        video.load();
        video.classList.add('loaded');
        video.removeAttribute('data-lazy-video');

        // Try to play if autoplay and in viewport
        if (video.hasAttribute('autoplay')) {
          const rect = video.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            video.play().catch(() => {
              // Autoplay blocked - that's ok
            });
          }
        }
      }
    });

    // IFRAMES: Convert ALL data-src → src (for Vimeo, YouTube, etc.)
    const allIframes = Array.from(document.querySelectorAll('iframe[data-src]'));
    log(`    Found ${allIframes.length} iframes with data-src`);

    allIframes.forEach((iframe, index) => {
      if (iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        iframe.classList.add('loaded');
        log(`    ✓ Iframe ${index + 1}: ${iframe.src.substring(0, 50)}...`);
      }
    });

    // ALSO handle iframes with data-lazy-iframe attribute
    const lazyIframes = Array.from(document.querySelectorAll('iframe[data-lazy-iframe]'));
    log(`    Found ${lazyIframes.length} iframes with data-lazy-iframe`);

    lazyIframes.forEach((iframe) => {
      if (iframe.dataset.src && !iframe.src) {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        iframe.removeAttribute('data-lazy-iframe');
        iframe.classList.add('loaded');
      }
    });

    log('  ✓ Universal lazy loading complete');
  }

  function reinitializePageSpecificScripts() {
    // Wykryj która strona jest załadowana i wywołaj odpowiednie re-init funkcje
    log('Reinitializing page-specific scripts for:', currentPath);

    // ========================================================================
    // CONTACT PAGE - Fix FontAwesome icons and FAQ
    // ========================================================================
    if (currentPath === '/contact.html' || currentPath === '/contact') {
      log('  → Contact page detected, reinitializing scripts');

      // 1. Fix FontAwesome icons - wait for font to fully load
      setTimeout(() => {
        log('  → Fixing FontAwesome icons positioning');

        // Check if FontAwesome converted icons to SVG
        const svgIcons = document.querySelectorAll('.social-icon svg');
        if (svgIcons.length > 0) {
          log('    FontAwesome converted ' + svgIcons.length + ' icons to SVG - fixing...');

          svgIcons.forEach((svg) => {
            // SVG icons need different positioning
            svg.style.cssText =
              'width: 1.2rem !important; height: 1.2rem !important; margin: 0 !important; padding: 0 !important;';
          });
        }

        // Fix regular <i> icons
        const iconElements = document.querySelectorAll('.social-icon i');
        iconElements.forEach((icon) => {
          // Remove any transform that shifts the icon
          icon.style.cssText =
            'font-size: 1.2rem !important; line-height: 1 !important; margin: 0 auto !important; padding: 0 !important; display: block !important;';
        });

        // Ensure containers are proper flexbox
        const containers = document.querySelectorAll('.social-icon');
        containers.forEach((container) => {
          container.style.cssText =
            'display: flex !important; align-items: center !important; justify-content: center !important; width: 40px !important; height: 40px !important;';
        });

        log('    ✓ Fixed ' + (svgIcons.length + iconElements.length) + ' icons');
      }, 1000); // Wait longer for FontAwesome to fully initialize

      // 2. Reinitialize FAQ accordion functionality
      setTimeout(() => {
        log('  → Reinitializing FAQ accordion');
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach((item, index) => {
          const button = item.querySelector('.faq-question');
          const answer = item.querySelector('.faq-answer');
          if (!button || !answer) return;

          // Set ARIA attributes
          const answerId = `faq-answer-${index}`;
          button.setAttribute('aria-controls', answerId);
          button.setAttribute('aria-expanded', 'false');
          answer.id = answerId;
          answer.setAttribute('role', 'region');
          answer.setAttribute('aria-hidden', 'true');

          // Clone button to remove old event listeners
          const newButton = button.cloneNode(true);
          button.parentNode.replaceChild(newButton, button);

          // Add fresh click listener
          newButton.addEventListener('click', () => {
            const isOpen = item.classList.toggle('open');
            newButton.setAttribute('aria-expanded', String(isOpen));
            answer.setAttribute('aria-hidden', String(!isOpen));
          });
        });

        log('    ✓ FAQ reinitialized with ' + faqItems.length + ' items');
      }, 600);

      // 3. Reinitialize contact form
      setTimeout(() => {
        const form = document.getElementById('contact-form');
        if (form) {
          // Clone to remove old listeners
          const newForm = form.cloneNode(true);
          form.parentNode.replaceChild(newForm, form);

          // Re-add submit handler
          newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = newForm.querySelector('button[type="submit"]');
            const successMsg = document.getElementById('success-message');

            btn.disabled = true;
            btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

            try {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
              if (successMsg) successMsg.style.display = 'block';
              newForm.reset();

              setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<span>Send Message</span><i class="fas fa-arrow-right"></i>';
                if (successMsg) successMsg.style.display = 'none';
              }, 5000);
            } catch (error) {
              btn.disabled = false;
              btn.innerHTML = '<span>Send Message</span><i class="fas fa-arrow-right"></i>';
            }
          });

          log('    ✓ Contact form reinitialized');
        }
      }, 700);
    }

    // ========================================================================
    // MUSIC PAGE - Re-render playlist
    // ========================================================================
    else if (currentPath === '/music.html' || currentPath === '/music') {
      log('  → Music page detected');
      log('    → Waiting for music.js to load and reinitializing');

      // CRITICAL: ES6 modules don't re-execute when added to DOM if already loaded
      // We must manually call the init function after the script loads
      setTimeout(() => {
        log('    → Checking for window.initMusicPage...');

        if (window.initMusicPage && typeof window.initMusicPage === 'function') {
          log('    → Calling window.initMusicPage()');
          window.initMusicPage();
        } else if (window.refreshMusicList && typeof window.refreshMusicList === 'function') {
          log('    → Calling window.refreshMusicList() as fallback');
          window.refreshMusicList();
        } else {
          log('    ✗ No music initialization function found!');
          log('    ✗ window.initMusicPage:', typeof window.initMusicPage);
          log('    ✗ window.refreshMusicList:', typeof window.refreshMusicList);
        }
      }, 500); // Longer delay to ensure module is fully loaded
    }

    // ========================================================================
    // PROJECTS PAGE - Re-init lazy loading and search
    // ========================================================================
    else if (currentPath === '/projects' || currentPath.startsWith('/projects/')) {
      log('  → Re-initializing projects page');
      // Give DOM time to settle before initializing
      setTimeout(() => {
        reinitializeProjectsPage();
      }, 300);
    }

    // ========================================================================
    // HOME PAGE - Re-init counters and animations
    // ========================================================================
    else if (currentPath === '/' || currentPath === '/index.html') {
      log('  → Home page loaded');
      log('    → Reinitializing home page features');

      // Give DOM time to settle before initializing
      setTimeout(() => {
        reinitializeHomePage();
      }, 300);
    }

    // ========================================================================
    // OTHER PAGES - Generic re-init
    // ========================================================================
    else {
      log('  → Generic page, no specific re-init needed');
    }
  }

  function reinitializeProjectsPage() {
    log('━━━ Reinitializing Projects Page ━━━');

    // Re-implement projects.js logic for smooth navigation
    const grid = document.querySelector('.projects-grid');

    // CRITICAL: Load ALL images and videos in the document, not just in grid
    // This ensures everything loads even if we don't find the grid
    log('  → Step 1: Loading ALL images in document (aggressive mode)');
    const allImages = Array.from(document.querySelectorAll('img'));
    allImages.forEach((img, index) => {
      // If has data-src, convert it
      if (img.dataset.src && img.dataset.src !== img.src) {
        const srcValue = img.dataset.src;
        img.src = srcValue;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        log(`    ✓ Image ${index + 1}: ${srcValue.substring(srcValue.lastIndexOf('/') + 1)}`);
      }
      // Force eager loading
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'eager');
      }
      // Ensure loaded class is added when image loads
      if (!img.classList.contains('loaded')) {
        img.addEventListener(
          'load',
          () => {
            img.classList.add('loaded');
          },
          { once: true }
        );
        // If already loaded, add class immediately
        if (img.complete && img.naturalWidth > 0) {
          img.classList.add('loaded');
        }
      }
    });

    log('  → Step 2: Loading ALL videos in document (aggressive mode)');
    const allVideos = Array.from(document.querySelectorAll('video'));
    allVideos.forEach((video, index) => {
      // Set all required attributes for autoplay
      if (video.hasAttribute('data-autoplay') || video.hasAttribute('autoplay')) {
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('loop', '');
        video.removeAttribute('data-autoplay');
        video.removeAttribute('data-lazy-video');
      }

      // Load video sources
      const sources = video.querySelectorAll('source');
      let sourcesLoaded = 0;
      sources.forEach((source) => {
        if (source.dataset.src && !source.src) {
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
          sourcesLoaded++;
        }
      });

      // Reload video if sources were loaded
      if (sourcesLoaded > 0) {
        video.load();
        video.classList.add('loaded');
        log(`    ✓ Video ${index + 1}: loaded with ${sourcesLoaded} sources`);

        // Try to play if in viewport
        const rect = video.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0 && video.hasAttribute('autoplay')) {
          video.play().catch(() => {
            // Autoplay blocked - that's ok
          });
        }
      }
    });

    if (!grid) {
      log('  ⚠ Projects grid not found, but all images/videos have been loaded');
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.project-card'));
    log(`  → Found ${cards.length} project cards in grid`);

    // Setup IntersectionObserver for videos (play when in view)
    if ('IntersectionObserver' in window && allVideos.length > 0) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              // Play video when in viewport
              if (video.paused && video.hasAttribute('autoplay')) {
                video.play().catch(() => {
                  // Autoplay blocked - that's ok
                });
              }
            } else {
              // Pause video when out of viewport (performance)
              if (!video.paused) {
                video.pause();
              }
            }
          });
        },
        { rootMargin: '200px' }
      );

      allVideos.forEach((video) => {
        if (video.hasAttribute('autoplay')) {
          videoObserver.observe(video);
        }
      });
    }

    log('━━━ Projects page initialization complete ━━━');
  }

  function reinitializeHomePage() {
    log('━━━ Reinitializing Home Page ━━━');

    // Re-initialize animated counters (stats section)
    log('  → Step 1: Reinitializing stat counters');
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    log(`    Found ${statNumbers.length} stat counters`);

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
      // Remove 'counted' class so they can animate again
      statNumbers.forEach((el) => {
        el.classList.remove('counted');
        // Reset to 0
        el.textContent = '0';
      });

      // Create IntersectionObserver for counters
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.target.classList.contains('counted')) return;

            entry.target.classList.add('counted');

            // Animate counter
            const element = entry.target;
            const target = Number.parseInt(element.getAttribute('data-count'), 10);
            if (!Number.isFinite(target)) return;

            const prefix = element.getAttribute('data-prefix') || '';
            const suffix = element.getAttribute('data-suffix') || '';
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;

            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              element.textContent = `${prefix}${Math.floor(current)}${suffix}`;
            }, duration / steps);

            log(`    ✓ Counter animated: ${target}${suffix}`);
          });
        },
        { threshold: 0.5 }
      );

      // Observe all stat numbers
      statNumbers.forEach((el) => counterObserver.observe(el));
      log(`    ✓ Observing ${statNumbers.length} counters`);
    }

    // Re-initialize other home page features if needed
    log('  → Step 2: Checking for other home page features');

    // Vimeo iframe fallback
    const vimeoIframe = document.querySelector('iframe[src*="vimeo.com"]');
    if (vimeoIframe) {
      log('    ✓ Vimeo iframe found');
    }

    // Timeline navigation
    const timeline = document.querySelector('.timeline');
    if (timeline) {
      log('    ✓ Timeline found');
    }

    log('━━━ Home page initialization complete ━━━');
  }

  function loadPageScript(src) {
    // Dynamically load a page-specific script
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        log(`  Script already loaded: ${src}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => {
        log(`  ✓ Script loaded: ${src}`);
        resolve();
      };
      script.onerror = () => {
        log(`  ✗ Script load failed: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  function reinitializeTranslations(pathOverride) {
    const currentLang = localStorage.getItem('language') || 'en';
    // Use pathOverride if provided, otherwise use window.location.pathname
    const targetPath = pathOverride || window.location.pathname;

    log('━━━ Reinitializing translations ━━━');
    log('  Current language:', currentLang);
    log('  Target path:', targetPath);
    log('  window.location.pathname:', window.location.pathname);
    log('  pathOverride:', pathOverride);

    // Reinicjalizuj BulletproofI18n (singleton instance)
    if (window.i18n && typeof window.i18n.load === 'function') {
      log('  → Using BulletproofI18n system');
      log('  → i18n object:', window.i18n);
      log('  → i18n.translations:', window.i18n.translations);

      // CRITICAL: Clear ALL cached translations to force reload for new page
      // Clear the entire translations object, not just current language
      if (window.i18n.translations) {
        const cachedLangs = Object.keys(window.i18n.translations);
        log('  → Clearing all cached translations. Cached languages:', cachedLangs);
        window.i18n.translations = {};
      }

      // Also clear loading promises cache
      if (window.i18n.loadingPromises) {
        log('  → Clearing loading promises cache');
        window.i18n.loadingPromises.clear();
      }

      // CRITICAL: Pass targetPath directly to i18n.load() using the new pathOverride parameter
      // This allows BulletproofI18n to load the correct translation file even though
      // window.location.pathname hasn't been updated by history.pushState yet
      log('  → Calling window.i18n.load(' + currentLang + ', ' + targetPath + ')');

      // Force reload translations for current language (will fetch new file based on path)
      window.i18n
        .load(currentLang, targetPath)
        .then(() => {
          log('  ✓ Translations loaded for:', currentLang);
          log(
            '  ✓ Translation keys available:',
            window.i18n.translations[currentLang]
              ? Object.keys(window.i18n.translations[currentLang]).length
              : 0
          );

          // Apply translations to DOM
          if (
            window.i18n._applyTranslations &&
            typeof window.i18n._applyTranslations === 'function'
          ) {
            log('  → Calling _applyTranslations()');
            window.i18n._applyTranslations();
            log('  ✓ Translations applied to DOM');
          } else {
            log('  ✗ _applyTranslations not found!');
          }
        })
        .catch((err) => {
          log('  ✗ Translation reload failed:', err);
          // Fallback: just apply whatever translations we have
          if (window.i18n._applyTranslations) {
            window.i18n._applyTranslations();
          }
        });
    }

    // Fallback: stary system tłumaczeń
    else if (window.setLanguage && typeof window.setLanguage === 'function') {
      log('  → Using legacy translation system');
      window.setLanguage(currentLang);
    } else {
      log('  ⚠ No translation system found');
      log('  ⚠ window.i18n:', window.i18n);
      log('  ⚠ window.setLanguage:', window.setLanguage);
    }

    log('━━━ Translation reinitialization triggered ━━━');
  }

  function reinitializeScrollAnimations() {
    // Intersection Observer dla .fade-in elementów
    const fadeElements = document.querySelectorAll('.fade-in, .animate-on-scroll');

    if (fadeElements.length === 0) return;

    // Disconnect poprzedni observer aby uniknąć memory leak
    if (scrollAnimationObserver) {
      scrollAnimationObserver.disconnect();
      scrollAnimationObserver = null;
    }

    // Utwórz nowy observer
    scrollAnimationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Obserwuj wszystkie elementy
    fadeElements.forEach((el) => {
      el.classList.remove('visible');
      scrollAnimationObserver.observe(el);
    });
  }

  function reinitializeEventListeners() {
    // Mobile menu - używamy event delegation więc nie trzeba reinicjalizować
    // Główny click handler (handleLinkClick) już obsługuje wszystkie kliknięcia

    // Zamknij mobile menu po nawigacji
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileToggle?.classList.remove('active');
      mobileMenu.classList.remove('active');
      mobileOverlay?.classList.remove('active');
      document.body.classList.remove('mobile-menu-open');
    }
  }

  // ============================================================================
  // BROWSER HISTORY
  // ============================================================================

  function handlePopState(e) {
    if (e.state && e.state.path) {
      log('Popstate:', e.state.path);
      navigateToPage(e.state.path);
    } else {
      // Brak state - użytkownik wrócił do strony sprzed SPA
      // Przeładuj stronę normalnie
      log('Popstate without state - reloading');
      window.location.reload();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  function init() {
    log('Smooth Navigation - Using full page reloads with fade transitions');
    log('This is a temporary fix until AJAX navigation is properly fixed');

    // CRITICAL: Clear cache on init to force fresh fetches with new code
    // This ensures we're not using old cached pages without infrastructure preservation
    pageCache.clear();
    log('Cache cleared on init');

    // Normalize currentPath
    currentPath = normalizeUrl(currentPath);
    log('Current path (normalized):', currentPath);

    // Event listeners
    document.addEventListener('click', handleLinkClick, true);
    document.addEventListener('mouseover', handleLinkHover);
    window.addEventListener('popstate', handlePopState);

    // Zapisz aktualną stronę do historii
    history.replaceState({ path: currentPath }, '', currentPath);

    // DON'T cache current page at init - it may have mixed content from navigation.js
    // Instead, we'll fetch it fresh when navigating back to it
    // This prevents caching polluted body.innerHTML with infrastructure elements

    log('✓ Not caching current page at init (will fetch fresh when needed)');

    // Preload krytycznych stron
    if (CONFIG.cacheCritical) {
      setTimeout(() => {
        CRITICAL_PAGES.forEach((page) => {
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
    document.addEventListener('DOMContentLoaded', () => {
      init();

      // CRITICAL: Initialize lazy loading on initial page load
      // This converts data-src → src for images/videos already in the DOM
      log('━━━ INITIAL PAGE LOAD ━━━');
      log('Running lazy loading for initial page content...');
      initializeUniversalLazyLoading();
    });
  } else {
    init();

    // CRITICAL: Initialize lazy loading on initial page load
    // This converts data-src → src for images/videos already in the DOM
    log('━━━ INITIAL PAGE LOAD ━━━');
    log('Running lazy loading for initial page content...');
    initializeUniversalLazyLoading();
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
