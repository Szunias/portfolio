// Preload language to prevent flicker - runs immediately in <head>
(function () {
  "use strict";

  let fastNavigation = false;
  let navBackground = null;

  try {
    fastNavigation = sessionStorage.getItem("ssn-fast-nav") === "1";
    if (fastNavigation) {
      sessionStorage.removeItem("ssn-fast-nav");
    }
  } catch (flagError) {
    fastNavigation = false;
  }

  try {
    const storedBackground = sessionStorage.getItem("ssn-nav-style");
    if (storedBackground) {
      navBackground = JSON.parse(storedBackground);
      sessionStorage.removeItem("ssn-nav-style");
    }
  } catch (backgroundError) {
    navBackground = null;
  }

  if (navBackground && typeof navBackground === "object") {
    const root = document.documentElement;
    Object.entries(navBackground).forEach(([key, value]) => {
      if (typeof value === "string" && value.length) {
        root.style[key] = value;
      }
    });

    const clearBackground = () => {
      Object.keys(navBackground).forEach((key) => {
        root.style[key] = "";
      });
    };

    const scheduleClear = () => {
      requestAnimationFrame(() => requestAnimationFrame(clearBackground));
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", scheduleClear, {
        once: true,
      });
    } else {
      scheduleClear();
    }

    window.addEventListener("pageshow", scheduleClear, { once: true });
  }

  if (fastNavigation) {
    document.documentElement.classList.add(
      "smooth-nav-ready",
      "translations-ready",
    );
  }

  // Supported language codes
  const SUPPORTED_LANGS = new Set(["en", "pl", "nl"]);
  const DEFAULT_LANG = "en";

  // Read language from localStorage first
  let savedLang = localStorage.getItem("language") || DEFAULT_LANG;
  let languageFromQuery = false;

  // Check for ?lang= override in the URL
  try {
    const currentUrl = new URL(window.location.href);
    const queryLang = currentUrl.searchParams.get("lang");

    if (queryLang && SUPPORTED_LANGS.has(queryLang)) {
      savedLang = queryLang;
      languageFromQuery = true;
      localStorage.setItem("language", queryLang);

      // Remove the lang parameter to avoid duplicate URLs in search engines
      currentUrl.searchParams.delete("lang");
      const cleanUrl =
        currentUrl.pathname + currentUrl.search + currentUrl.hash;
      if (window.history && typeof window.history.replaceState === "function") {
        window.history.replaceState({}, document.title, cleanUrl || "/");
      }
    }
  } catch (error) {
    // Ignore URL parsing errors (very old browsers / malformed URLs)
  }

  // Set HTML lang attribute immediately
  document.documentElement.setAttribute("lang", savedLang);

  // Store the language for translations.js to use
  window.__preloadedLang = savedLang;
  window.__languageFromQuery = languageFromQuery;

  // Inject critical inline CSS to hide content until translations load
  // Using opacity instead of visibility for smoother transition
  const style = document.createElement("style");
  style.id = "preload-style";
  style.textContent = `
    html:not(.translations-ready):not(.smooth-nav-ready) {
      opacity: 0 !important;
    }
    html.translations-ready {
      opacity: 1 !important;
      transition: opacity 0.1s ease-in !important;
    }
    /* Prevent FOUC for language buttons */
    .lang-btn:not(.active) {
      opacity: 0.6;
    }
    /* Współpraca z smooth navigation */
    html.smooth-nav-ready:not(.translations-ready) {
      opacity: 0 !important;
    }
  `;

  // Insert style as first child of head for highest priority
  if (document.head.firstChild) {
    document.head.insertBefore(style, document.head.firstChild);
  } else {
    document.head.appendChild(style);
  }

  // Update language button active state immediately when DOM is ready
  function updateLangButtons() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      if (btn.dataset.lang === savedLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Run as soon as possible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateLangButtons);
  } else {
    updateLangButtons();
  }

  // Aggressive fallback: show page after max 200ms even if translations haven't loaded
  setTimeout(() => {
    if (!document.documentElement.classList.contains("translations-ready")) {
      document.documentElement.classList.add("translations-ready");
      // Translations timeout - showing page anyway
    }
  }, 200);
})();
