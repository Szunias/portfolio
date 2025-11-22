// Smooth Navigation System - eliminuje białe migotanie i dodaje płynne przejścia
(function () {
    'use strict';

    // Konfiguracja
    const CONFIG = {
        fadeOutDuration: 200,
        fadeInDuration: 300,
        preloadDelay: 50,
        cacheSize: 5,
        enablePreload: true
    };

    // Cache dla załadowanych stron
    const pageCache = new Map();
    const preloadQueue = new Set();

    // Stan nawigacji
    let isNavigating = false;
    let currentUrl = window.location.pathname;

    // Elementy DOM
    let pageContainer;
    let loadingOverlay;

    // Inicjalizacja
    function init() {
        createPageStructure();
        setupEventListeners();
        cacheCurrentPage();
        preloadCriticalPages();
    }

    // Tworzy strukturę dla płynnych przejść
    function createPageStructure() {
        // Sprawdź czy już istnieje
        if (document.getElementById('smooth-nav-container')) return;

        // Owinięcie całej zawartości body
        const bodyContent = document.body.innerHTML;
        document.body.innerHTML = '';

        // Kontener główny
        pageContainer = document.createElement('div');
        pageContainer.id = 'smooth-nav-container';
        pageContainer.innerHTML = bodyContent;

        // Overlay ładowania
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'smooth-nav-overlay';
        loadingOverlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
      </div>
    `;

        document.body.appendChild(pageContainer);
        document.body.appendChild(loadingOverlay);

        // Dodaj style
        addNavigationStyles();
    }

    // Dodaje style CSS dla nawigacji
    function addNavigationStyles() {
        if (document.getElementById('smooth-nav-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'smooth-nav-styles';
        styles.textContent = `
      #smooth-nav-container {
        opacity: 1;
        transition: opacity ${CONFIG.fadeOutDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      #smooth-nav-container.navigating-out {
        opacity: 0;
      }
      
      #smooth-nav-container.navigating-in {
        opacity: 0;
        animation: fadeInSmooth ${CONFIG.fadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      @keyframes fadeInSmooth {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #smooth-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: opacity ${CONFIG.fadeOutDuration}ms ease;
        pointer-events: none;
      }
      
      #smooth-nav-overlay.active {
        opacity: 1;
        visibility: visible;
        pointer-events: all;
      }
      
      .loading-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }
      
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(96, 165, 250, 0.2);
        border-top: 3px solid #60a5fa;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Zapobieganie FOUC podczas ładowania */
      html:not(.smooth-nav-ready) {
        opacity: 0 !important;
      }
      
      html.smooth-nav-ready {
        opacity: 1 !important;
        transition: opacity 100ms ease-in !important;
      }
    `;

        document.head.appendChild(styles);
    }

    // Ustawia event listenery
    function setupEventListeners() {
        // Przechwytuj kliknięcia w linki
        document.addEventListener('click', handleLinkClick, true);

        // Obsługa przycisku wstecz/dalej
        window.addEventListener('popstate', handlePopState);

        // Preload przy hover
        if (CONFIG.enablePreload) {
            document.addEventListener('mouseover', handleLinkHover);
        }

        // Cleanup przy unload
        window.addEventListener('beforeunload', cleanup);
    }

    // Obsługuje kliknięcia w linki
    function handleLinkClick(event) {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!shouldInterceptLink(href, link)) return;

        event.preventDefault();
        event.stopPropagation();

        navigateToPage(href);
    }

    // Sprawdza czy link powinien być przechwycony
    function shouldInterceptLink(href, link) {
        if (!href) return false;
        if (href.startsWith('#')) return false;
        if (href.startsWith('mailto:')) return false;
        if (href.startsWith('tel:')) return false;
        if (href.startsWith('http') && !href.includes(window.location.hostname)) return false;
        if (link.hasAttribute('target')) return false;
        if (link.hasAttribute('download')) return false;
        if (href === currentUrl) return false;

        return true;
    }

    // Główna funkcja nawigacji
    async function navigateToPage(url) {
        if (isNavigating) return;

        isNavigating = true;

        try {
            // Pokaż overlay ładowania
            showLoadingOverlay();

            // Fade out obecnej strony
            await fadeOutCurrentPage();

            // Załaduj nową stronę
            const pageContent = await loadPage(url);

            // Zastąp zawartość
            await replacePage(pageContent, url);

            // Fade in nowej strony
            await fadeInNewPage();

            // Ukryj overlay
            hideLoadingOverlay();

            // Aktualizuj URL
            updateUrl(url);

        } catch (error) {
            // Navigation error occurred
            // Fallback do standardowej nawigacji
            window.location.href = url;
        } finally {
            isNavigating = false;
        }
    }

    // Pokazuje overlay ładowania
    function showLoadingOverlay() {
        loadingOverlay.classList.add('active');
    }

    // Ukrywa overlay ładowania
    function hideLoadingOverlay() {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
        }, CONFIG.fadeInDuration);
    }

    // Fade out obecnej strony
    function fadeOutCurrentPage() {
        return new Promise(resolve => {
            pageContainer.classList.add('navigating-out');
            setTimeout(resolve, CONFIG.fadeOutDuration);
        });
    }

    // Fade in nowej strony
    function fadeInNewPage() {
        return new Promise(resolve => {
            pageContainer.classList.remove('navigating-out');
            pageContainer.classList.add('navigating-in');

            setTimeout(() => {
                pageContainer.classList.remove('navigating-in');
                resolve();
            }, CONFIG.fadeInDuration);
        });
    }

    // Ładuje stronę (z cache lub fetch)
    async function loadPage(url) {
        // Sprawdź cache
        if (pageCache.has(url)) {
            return pageCache.get(url);
        }

        // Fetch strony
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load page: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const pageData = {
            title: doc.title,
            body: doc.body.innerHTML,
            head: extractHeadContent(doc.head)
        };

        // Dodaj do cache
        addToCache(url, pageData);

        return pageData;
    }

    // Wyciąga zawartość head (meta, title, etc.)
    function extractHeadContent(head) {
        const headData = {
            title: head.querySelector('title')?.textContent || '',
            meta: [],
            links: []
        };

        // Meta tags
        head.querySelectorAll('meta').forEach(meta => {
            const attrs = {};
            for (const attr of meta.attributes) {
                attrs[attr.name] = attr.value;
            }
            headData.meta.push(attrs);
        });

        // Link tags (bez stylów inline)
        head.querySelectorAll('link[rel="canonical"], link[rel="alternate"]').forEach(link => {
            const attrs = {};
            for (const attr of link.attributes) {
                attrs[attr.name] = attr.value;
            }
            headData.links.push(attrs);
        });

        return headData;
    }

    // Zastępuje zawartość strony
    async function replacePage(pageData, url) {
        // Aktualizuj title
        document.title = pageData.title;

        // Aktualizuj meta tags
        updateMetaTags(pageData.head);

        // Zastąp zawartość body
        pageContainer.innerHTML = pageData.body;

        // Reinicjalizuj skrypty
        await reinitializeScripts();

        // Scroll do góry
        window.scrollTo(0, 0);
    }

    // Aktualizuje meta tagi
    function updateMetaTags(headData) {
        // Usuń stare meta tagi (tylko te które mogą się zmieniać)
        document.querySelectorAll('meta[property^="og:"], meta[name="description"], meta[name="keywords"]').forEach(meta => {
            meta.remove();
        });

        // Dodaj nowe meta tagi
        headData.meta.forEach(attrs => {
            const meta = document.createElement('meta');
            Object.entries(attrs).forEach(([name, value]) => {
                meta.setAttribute(name, value);
            });
            document.head.appendChild(meta);
        });

        // Aktualizuj canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        const newCanonical = headData.links.find(link => link.rel === 'canonical');
        if (newCanonical) {
            if (canonical) {
                canonical.href = newCanonical.href;
            } else {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                canonical.href = newCanonical.href;
                document.head.appendChild(canonical);
            }
        }
    }

    // Reinicjalizuje skrypty po zmianie strony
    async function reinitializeScripts() {
        // Reinicjalizuj system tłumaczeń
        if (window.translations && typeof window.setLanguage === 'function') {
            const currentLang = localStorage.getItem('language') || 'en';
            window.setLanguage(currentLang);
        }

        // Reinicjalizuj inne skrypty
        if (typeof initHeaderScrollEffect === 'function') {
            initHeaderScrollEffect();
        }

        // Reinicjalizuj animacje
        reinitializeAnimations();

        // Reinicjalizuj event listenery
        setupPageSpecificListeners();
    }

    // Reinicjalizuje animacje
    function reinitializeAnimations() {
        // Fade-in animacje
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px 100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.remove('visible');
            observer.observe(el);
        });

        // Countery
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    if (typeof animateCounter === 'function') {
                        animateCounter(entry.target);
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number[data-count]').forEach(el => {
            el.classList.remove('counted');
            counterObserver.observe(el);
        });
    }

    // Ustawia event listenery specyficzne dla strony
    function setupPageSpecificListeners() {
        // Mobile menu
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileOverlay = document.querySelector('.mobile-menu-overlay');

        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                mobileOverlay?.classList.toggle('active');
            });

            mobileOverlay?.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
            });
        }

        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (typeof setLanguage === 'function') {
                    setLanguage(btn.dataset.lang);
                }
            });
        });
    }

    // Aktualizuje URL
    function updateUrl(url) {
        currentUrl = url;
        history.pushState({ url }, '', url);
    }

    // Obsługuje popstate (przycisk wstecz/dalej)
    function handlePopState(event) {
        if (event.state && event.state.url) {
            navigateToPage(event.state.url);
        }
    }

    // Preload przy hover
    function handleLinkHover(event) {
        const link = event.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!shouldInterceptLink(href, link)) return;
        if (preloadQueue.has(href) || pageCache.has(href)) return;

        preloadQueue.add(href);

        setTimeout(() => {
            preloadPage(href);
        }, CONFIG.preloadDelay);
    }

    // Preload strony
    async function preloadPage(url) {
        try {
            await loadPage(url);
        } catch (error) {
            // Preload failed for URL
        }
    }

    // Cache management
    function addToCache(url, pageData) {
        if (pageCache.size >= CONFIG.cacheSize) {
            const firstKey = pageCache.keys().next().value;
            pageCache.delete(firstKey);
        }
        pageCache.set(url, pageData);
    }

    function cacheCurrentPage() {
        const pageData = {
            title: document.title,
            body: document.body.innerHTML,
            head: extractHeadContent(document.head)
        };
        addToCache(currentUrl, pageData);
    }

    // Preload krytycznych stron
    function preloadCriticalPages() {
        const criticalPages = ['/', '/about.html', '/projects/'];

        criticalPages.forEach(page => {
            if (page !== currentUrl) {
                setTimeout(() => preloadPage(page), 1000);
            }
        });
    }

    // Cleanup
    function cleanup() {
        pageCache.clear();
        preloadQueue.clear();
    }

    // TYMCZASOWO WYŁĄCZONE - żeby nie interferowało z istniejącym kodem
    // Odkomentuj poniższe linie żeby włączyć smooth navigation
    /*
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    */

    // Oznacz jako gotowe (ale nie inicjalizuj)
    document.documentElement.classList.add('smooth-nav-ready');

    // Export dla debugowania
    window.smoothNavigation = {
        navigateToPage,
        pageCache,
        preloadPage,
        CONFIG
    };
})();
