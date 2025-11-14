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
    debug: true             // Logi w konsoli
  };

  // Krytyczne strony do preloadu (już znormalizowane)
  const CRITICAL_PAGES = [
    '/',
    '/about.html',
    '/projects',
    '/contact.html',
    '/music.html'
  ];

  // ============================================================================
  // STATE
  // ============================================================================

  let isNavigating = false;
  let currentPath = window.location.pathname;  // Will be normalized in init()
  const pageCache = new Map();
  const preloadQueue = new Set();
  const activePreloadTimeouts = new Map();  // Track active timeouts to prevent duplicates
  let scrollAnimationObserver = null;  // Prevent memory leak

  // ============================================================================
  // UTILITIES
  // ============================================================================

  function log(...args) {
    if (CONFIG.debug) {
      console.log('[SmoothNav]', ...args);
    }
  }

  function normalizeUrl(url) {
    // Normalizuj URL (usuń trailing slash, konwertuj index.html do /)
    try {
      const urlObj = new URL(url, window.location.origin);
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
      const url = new URL(href, window.location.origin);
      // Jeśli pathname taki sam jak current, ale jest hash - to anchor link
      // Używamy url.pathname (nie url.href!) bo to tylko pathname
      const normalizedPath = normalizeUrl(url.pathname);
      log('  Checking anchor:', normalizedPath, '===', currentPath, '&& hash:', url.hash);
      if (normalizedPath === currentPath && url.hash) {
        log('  → Anchor link on same page, allowing browser scroll');
        return false;  // Pozwól przeglądarce obsłużyć scroll do anchora
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

    // Ignoruj jeśli to ten sam URL (pathname bez hash)
    const targetPath = normalizeUrl(href);
    if (targetPath === currentPath) return false;

    return true;
  }

  function handleLinkClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    log('Link clicked:', href);

    if (!shouldInterceptLink(link, href)) {
      log('Link not intercepted:', href);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const targetPath = normalizeUrl(href);
    log('Navigating to normalized path:', targetPath, 'from href:', href);
    navigateToPage(targetPath);
  }

  function handleLinkHover(e) {
    if (!CONFIG.preloadOnHover) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!shouldInterceptLink(link, href)) return;

    const targetPath = normalizeUrl(href);

    // Nie preloaduj jeśli już jest w cache, w kolejce, lub timeout już działa
    if (pageCache.has(targetPath) ||
        preloadQueue.has(targetPath) ||
        activePreloadTimeouts.has(targetPath)) {
      return;
    }

    // Dodaj do queue i ustaw timeout
    preloadQueue.add(targetPath);
    const timeoutId = setTimeout(() => {
      activePreloadTimeouts.delete(targetPath);  // Usuń timeout po wykonaniu
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
    const inlineStyles = Array.from(doc.querySelectorAll('head style')).map(style => style.textContent);

    // Extract stylesheet links from head
    const stylesheetLinks = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]')).map(link => ({
      href: link.getAttribute('href'),
      media: link.getAttribute('media') || 'all'
    }));

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
      scripts: Array.from(doc.querySelectorAll('script[data-reinit]')).map(s => s.textContent)
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
    activePreloadTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
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

    await new Promise(resolve => setTimeout(resolve, CONFIG.fadeOutDuration));

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

    await new Promise(resolve => setTimeout(resolve, CONFIG.fadeInDuration));

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
      'header',                  // Navigation
      '.bg-gradient',           // Background
      '.bg-grid',
      '.bg-orbs',
      '.skip-link',
      '.mobile-menu-overlay',   // Mobile menu
      '.mobile-menu'
    ];

    // Zbierz elementy do zachowania
    const elementsToKeep = new Set();
    infrastructureSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => elementsToKeep.add(el));
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
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src') || '';
      const isCore = coreScriptPaths.some(corePath => src.includes(corePath));

      if (isCore) {
        elementsToKeep.add(script);
        log(`    → Keeping core script: ${src}`);
      } else if (src) {
        log(`    → Will remove page-specific script: ${src}`);
        // Don't add to elementsToKeep - will be removed
      }
    });

    // Keep inline styles (they're managed separately by updateStyles)
    document.querySelectorAll('style').forEach(style => {
      elementsToKeep.add(style);
    });

    // Usuń wszystko OPRÓCZ infrastructure
    const bodyChildren = Array.from(document.body.children);
    log(`  Removing ${bodyChildren.length} body children (keeping ${elementsToKeep.size} infrastructure elements)`);

    bodyChildren.forEach(child => {
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

    newElements.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      const isInfrastructure = infrastructureSelectors.some(selector => {
        if (selector.startsWith('.')) {
          return el.classList.contains(selector.substring(1));
        }
        return tagName === selector;
      });

      // Special handling for scripts
      if (tagName === 'script') {
        const src = el.getAttribute('src') || '';
        const isCore = coreScriptPaths.some(corePath => src.includes(corePath));

        if (!isCore && src) {
          // This is a page-specific script - add it!
          log(`    → Adding page-specific script: ${src}`);

          // Create new script element (copying doesn't work, must create fresh)
          const newScript = document.createElement('script');
          newScript.type = el.type || 'module';
          newScript.src = el.src;

          // Copy other attributes
          Array.from(el.attributes).forEach(attr => {
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
        // Wstaw PO headerze
        if (existingHeader && existingHeader.nextSibling) {
          document.body.insertBefore(el, existingHeader.nextSibling);
        } else {
          document.body.appendChild(el);
        }
        log(`    → Added <${tagName}> element`);
      } else {
        log(`    → Skipped <${tagName}> (infrastructure)`);
      }
    });

    log('✓ Body content replaced');

    // Scroll do góry
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Reinicjalizuj skrypty
    reinitializeScripts(pageData);

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
    document.querySelectorAll('style[data-page-style], link[data-page-style]').forEach(el => {
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
      styles.links.forEach(linkData => {
        // Check if this stylesheet is already loaded (global styles)
        const existingLink = document.querySelector(`link[rel="stylesheet"][href="${linkData.href}"]`);
        if (!existingLink) {
          const linkEl = document.createElement('link');
          linkEl.rel = 'stylesheet';
          linkEl.href = linkData.href;
          linkEl.media = linkData.media;
          linkEl.setAttribute('data-page-style', 'true');
          document.head.appendChild(linkEl);
          log(`Added stylesheet: ${linkData.href}`);
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

    // 4. Page-specific scripts (music, projects, etc.)
    reinitializePageSpecificScripts();

    // 5. Wykonaj custom scripts
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

  function reinitializePageSpecificScripts() {
    // Wykryj która strona jest załadowana i wywołaj odpowiednie re-init funkcje
    log('Reinitializing page-specific scripts for:', currentPath);

    // ========================================================================
    // MUSIC PAGE - Re-render playlist
    // ========================================================================
    if (currentPath === '/music.html' || currentPath === '/music') {
      log('  → Music page detected');
      log('    → music.js will auto-initialize (loaded via <script> tag in body)');

      // Music.js is now automatically loaded because we add page-specific
      // scripts from the fetched HTML. It will run its init() function
      // and populate the playlist.

      // If for some reason the script already ran before this function,
      // we can also call the refresh hook:
      setTimeout(() => {
        if (window.refreshMusicList && typeof window.refreshMusicList === 'function') {
          log('    → Calling window.refreshMusicList() as backup');
          window.refreshMusicList();
        }
      }, 100); // Small delay to let music.js init first
    }

    // ========================================================================
    // PROJECTS PAGE - Re-init lazy loading and search
    // ========================================================================
    else if (currentPath === '/projects' || currentPath.startsWith('/projects/')) {
      log('  → Re-initializing projects page');
      reinitializeProjectsPage();
    }

    // ========================================================================
    // HOME PAGE - Re-init if needed
    // ========================================================================
    else if (currentPath === '/' || currentPath === '/index.html') {
      log('  → Home page loaded');
      // Home page scripts usually auto-initialize, but check if re-init needed
    }

    // ========================================================================
    // OTHER PAGES - Generic re-init
    // ========================================================================
    else {
      log('  → Generic page, no specific re-init needed');
    }
  }

  function reinitializeProjectsPage() {
    // Re-implement projects.js logic for smooth navigation
    const grid = document.querySelector('.projects-grid');
    if (!grid) {
      log('    ✗ Projects grid not found');
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.project-card'));
    log(`    → Found ${cards.length} project cards`);

    // ========================================================================
    // CRITICAL: Initialize videos with data-autoplay and data-src
    // ========================================================================
    const lazyVideos = Array.from(grid.querySelectorAll('video[data-autoplay]'));
    log(`    → Initializing ${lazyVideos.length} lazy videos`);

    lazyVideos.forEach((video, index) => {
      log(`      → Video ${index + 1}:`);

      // Convert data-autoplay → autoplay
      if (video.hasAttribute('data-autoplay')) {
        video.setAttribute('autoplay', '');
        video.removeAttribute('data-autoplay');
        log(`        ✓ Set autoplay attribute`);
      }

      // Load video sources (data-src → src in <source> tags)
      const sources = video.querySelectorAll('source[data-src]');
      log(`        Found ${sources.length} sources with data-src`);

      sources.forEach((source, srcIndex) => {
        if (source.dataset.src) {
          const oldSrc = source.dataset.src;
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
          log(`        ✓ Source ${srcIndex + 1}: ${oldSrc}`);
        }
      });

      // Reload video to apply new sources
      if (sources.length > 0) {
        video.load();
        log(`        ✓ Called video.load()`);

        // Start playing if autoplay and in viewport
        const rect = video.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          video.play().catch(err => {
            log(`        ⚠ Autoplay blocked: ${err.message}`);
          });
          log(`        ✓ Started playing (in viewport)`);
        } else {
          log(`        → Not in viewport, will play when scrolled to`);
        }
      }
    });

    // Also load regular lazy images (if any)
    const lazyImgs = Array.from(grid.querySelectorAll('img[data-src]'));
    log(`    → Loading ${lazyImgs.length} lazy images`);

    lazyImgs.forEach((img, index) => {
      if (img.dataset.src) {
        const src = img.dataset.src;
        img.src = src;
        img.removeAttribute('data-src');
        log(`      ✓ Image ${index + 1}: ${src}`);
      }
    });

    // Setup IntersectionObserver for videos (play when in view)
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
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
      }, { rootMargin: '200px' });

      lazyVideos.forEach(video => videoObserver.observe(video));
    }

    log('    ✓ Projects page initialized');
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

  function reinitializeTranslations() {
    // Reinicjalizuj BulletproofI18n (singleton instance)
    if (window.i18n && typeof window.i18n.init === 'function') {
      log('Reinitializing BulletproofI18n');
      window.i18n.init().catch(err => {
        log('BulletproofI18n reinit failed:', err);
      });
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

    // Disconnect poprzedni observer aby uniknąć memory leak
    if (scrollAnimationObserver) {
      scrollAnimationObserver.disconnect();
      scrollAnimationObserver = null;
    }

    // Utwórz nowy observer
    scrollAnimationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Obserwuj wszystkie elementy
    fadeElements.forEach(el => {
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
    log('Initializing Enhanced Smooth Navigation');

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
