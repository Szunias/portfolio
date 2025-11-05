// Prosty system płynnej nawigacji - nie interferuje z istniejącym kodem
(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.__simpleSmoothNavInitialized) {
    return;
  }
  window.__simpleSmoothNavInitialized = true;

  // Konfiguracja
  const CONFIG = {
    enablePreload: true,
  };

  // Cache dla stron
  const pageCache = new Map();
  let isNavigating = false;

  // Store event handlers so we can remove them if needed
  let clickHandler = null;
  let hoverHandler = null;

  // Dodaj style CSS (minimalny - tylko dla zapobiegania flashowi)
  function addStyles() {
    if (document.getElementById("simple-smooth-nav-styles")) return;

    const styles = document.createElement("style");
    styles.id = "simple-smooth-nav-styles";
    styles.textContent = `
      /* Nie nadpisuj tła - każda strona ma swoje tło w inline styles */
      body {
        background: transparent;
      }
    `;

    document.head.appendChild(styles);
  }

  // Sprawdź czy element to przycisk języka
  function isLanguageButton(element) {
    if (!element || !element.classList) return false;

    // Sprawdź bezpośrednio element
    if (element.classList.contains("lang-btn")) return true;

    // Sprawdź rodziców (dla zagnieżdżonych elementów jak tekst wewnątrz przycisku)
    if (typeof element.closest === "function") {
      return !!element.closest(".lang-btn");
    }

    return false;
  }

  // Sprawdź czy link powinien być przechwycony
  function shouldInterceptLink(href, link) {
    if (!href) return false;
    if (href.startsWith("#")) return false;
    if (href.startsWith("mailto:")) return false;
    if (href.startsWith("tel:")) return false;
    if (href.startsWith("http") && !href.includes(window.location.hostname))
      return false;
    if (link.hasAttribute("target")) return false;
    if (link.hasAttribute("download")) return false;
    if (href === window.location.pathname) return false;

    return true;
  }

  // Główna funkcja nawigacji
  function navigateToPage(url) {
    if (isNavigating) return;

    isNavigating = true;

    try {
      sessionStorage.setItem("ssn-fast-nav", "1");
    } catch (storageFlagError) {
      // sessionStorage might be unavailable (private mode, etc.)
    }

    const root = document.documentElement;
    const { body } = document;

    if (root && body) {
      try {
        const styles = window.getComputedStyle(body);
        const navState = {
          background: styles.background,
          backgroundColor: styles.backgroundColor,
          backgroundImage: styles.backgroundImage,
          backgroundAttachment: styles.backgroundAttachment,
          backgroundPosition: styles.backgroundPosition,
          backgroundSize: styles.backgroundSize,
          backgroundRepeat: styles.backgroundRepeat,
        };
        try {
          sessionStorage.setItem("ssn-nav-style", JSON.stringify(navState));
        } catch (storageError) {
          // Ignore storage issues (private mode, quota exceeded, etc.)
        }

        root.style.background = styles.background;
        root.style.backgroundColor = styles.backgroundColor;
        root.style.backgroundImage = styles.backgroundImage;
        root.style.backgroundAttachment = styles.backgroundAttachment;
        root.style.backgroundPosition = styles.backgroundPosition;
        root.style.backgroundSize = styles.backgroundSize;
        root.style.backgroundRepeat = styles.backgroundRepeat;
      } catch (error) {
        // Keep navigation instant even if computed styles fail (e.g. during teardown)
      }
    }

    window.location.href = url;
  }

  // Preload strony
  function preloadPage(url) {
    if (pageCache.has(url)) return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);

    pageCache.set(url, true);
  }

  // Event listenery
  function setupEventListeners() {
    // Remove existing handlers if they exist
    if (clickHandler) {
      document.removeEventListener("click", clickHandler, true);
    }
    if (hoverHandler) {
      document.removeEventListener("mouseover", hoverHandler);
    }

    // Przechwytuj kliknięcia w linki
    clickHandler = (event) => {
      // Nie przechwytuj kliknięć w przyciski języka
      if (isLanguageButton(event.target)) {
        return;
      }

      const link = event.target.closest("a");
      if (!link) {
        return;
      }

      const href = link.getAttribute("href");
      if (!shouldInterceptLink(href, link)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      navigateToPage(href);
    };

    document.addEventListener("click", clickHandler, true);

    // Preload przy hover
    if (CONFIG.enablePreload) {
      hoverHandler = (event) => {
        const link = event.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (shouldInterceptLink(href, link)) {
          setTimeout(() => preloadPage(href), 50);
        }
      };

      document.addEventListener("mouseover", hoverHandler);
    }
  }

  // Inicjalizacja
  function init() {
    // Dodaj style (tylko dla preload)
    addStyles();

    // Setup event listeners only once
    if (document.body) {
      setupEventListeners();
    } else {
      document.addEventListener("DOMContentLoaded", setupEventListeners, {
        once: true,
      });
    }
  }

  // Uruchom NATYCHMIAST
  init();

  // Export dla debugowania
  window.simpleSmoothNav = {
    navigateToPage,
    preloadPage,
    CONFIG,
    reinit: setupEventListeners,
  };
})();
