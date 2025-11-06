/**
 * Translation System
 *
 * Professional multi-language support with zero-flicker loading.
 * Works in conjunction with inline language preload script in <head>.
 *
 * Features:
 * - Zero language flicker (lang attribute set before render)
 * - Smooth opacity fade-in after translations load
 * - Fallback safety (shows content after 500ms even if loading fails)
 * - Nested translation key support (e.g., "hero.title")
 * - HTML support for specific keys (e.g., titles with <br>)
 *
 * @author Igor Szuniewicz
 * @version 2.0
 */
(function () {
  "use strict";

  // Initialize empty translations object
  window.translations = {};

  // Use preloaded language (set by inline script in <head>) or fallback
  let currentLang =
    window.__preloadedLang || localStorage.getItem("language") || "en";

  // Helper function to get nested translation value
  function getNestedTranslation(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("language", lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation =
        getNestedTranslation(window.translations[lang], key) ||
        window.translations[lang]?.[key];

      if (translation) {
        if (key.includes(".title") && translation.includes("<br>")) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update all elements with data-i18n-aria-label attribute
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const translation =
        getNestedTranslation(window.translations[lang], key) ||
        window.translations[lang]?.[key];

      if (translation) {
        el.setAttribute("aria-label", translation);
      }
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation =
        getNestedTranslation(window.translations[lang], key) ||
        window.translations[lang]?.[key];

      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // Update active state of language buttons
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Update HTML lang attribute
    document.documentElement.setAttribute("lang", lang);

    // Update modal content if it exists and is open
    if (
      window.TrackInfoModal &&
      typeof window.TrackInfoModal.updateLanguage === "function"
    ) {
      window.TrackInfoModal.updateLanguage();
    }

    // Refresh music list if present
    if (typeof window.refreshMusicList === "function") {
      window.refreshMusicList();
    }

    // Update tech tags if present (for projects page)
    document.querySelectorAll("[data-tech]").forEach((container) => {
      const key = container.getAttribute("data-tech");
      const techArray = getNestedTranslation(
        window.translations[lang],
        key,
      );

      if (Array.isArray(techArray) && techArray.length > 0) {
        container.innerHTML = techArray
          .map(
            (tech) =>
              `<span class="project-tech-item">${tech}</span>`,
          )
          .join("");
        container.style.display = "flex";
      } else {
        container.style.display = "none";
      }
    });

    // Mark translations as ready and show page smoothly
    requestAnimationFrame(() => {
      // Add class that triggers CSS opacity transition (body opacity: 0 → 1)
      document.documentElement.classList.add("translations-ready");

      // Remove preload style after transition completes (tylko jeśli nie ma smooth navigation)
      if (!document.documentElement.classList.contains("smooth-nav-ready")) {
        setTimeout(() => {
          const preloadStyle = document.getElementById("preload-style");
          if (preloadStyle) preloadStyle.remove();
        }, 150);
      }
    });

    // Emit language changed event
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: lang } }),
    );
  }

  // Helper function to apply translations to all elements
  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation =
        getNestedTranslation(window.translations[currentLang], key) ||
        window.translations[currentLang]?.[key];

      if (translation) {
        if (key.includes(".title") && translation.includes("<br>")) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Apply aria-label translations
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const translation =
        getNestedTranslation(window.translations[currentLang], key) ||
        window.translations[currentLang]?.[key];

      if (translation) {
        el.setAttribute("aria-label", translation);
      }
    });

    // Apply placeholder translations
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation =
        getNestedTranslation(window.translations[currentLang], key) ||
        window.translations[currentLang]?.[key];

      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });
  }

  // Export dla smooth navigation
  window.setLanguage = setLanguage;
  window.applyTranslations = applyTranslations;

  // Detect which JSON file to load based on current page
  function getTranslationFile() {
    const path = window.location.pathname;
    const filename = path.split("/").pop();

    // Map HTML files to their JSON translation files
    const fileMap = {
      "index.html": "index.json",
      "about.html": "about.json",
      "contact.html": "contact.json",
      "music.html": "music.json",
      "": "index.json", // root path
      "/": "index.json",
    };

    // For projects/index.html
    if (path.includes("projects/")) {
      return "projects.json";
    }

    // Special case for projects/index.html
    if (path === "/projects/" || path === "/projects/index.html") {
      return "projects.json";
    }

    return fileMap[filename] || "shared.json";
  }

  // Load translations from JSON file
  async function loadTranslations() {
    try {
      const translationFile = getTranslationFile();

      // Try different paths based on current location
      let response;
      const basePaths = window.location.pathname.includes("projects/")
        ? ["../locales/", "locales/", "../../locales/"] // For projects page, try ../locales/ first
        : ["locales/", "../locales/", "../../locales/"]; // For other pages, try locales/ first

      for (const basePath of basePaths) {
        try {
          response = await fetch(basePath + translationFile);
          if (response.ok) break;
        } catch (e) {
          continue;
        }
      }

      if (!response?.ok) {
        throw new Error(`Failed to load translations from ${translationFile}`);
      }

      const translationData = await response.json();

      // Validate translation data structure
      if (!translationData || typeof translationData !== "object") {
        throw new Error("Invalid translation data format");
      }

      window.translations = translationData;
      setLanguage(currentLang);
    } catch (error) {
      // Translation loading failed - using fallback

      // Fallback: create minimal translation structure
      window.translations = {
        en: { error: "Translation loading failed" },
        pl: { error: "Błąd ładowania tłumaczeń" },
        nl: { error: "Vertaling laden mislukt" },
      };

      // Still try to set the language with fallback
      try {
        setLanguage(currentLang);
      } catch (fallbackError) {
        // Fallback language setting failed
      }
    }
  }

  // Start loading translations immediately (don't wait for DOMContentLoaded)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTranslations);
  } else {
    initTranslations();
  }

  function initTranslations() {
    loadTranslations();

    // Use event delegation for language buttons (works even if buttons are added dynamically)
    document.addEventListener("click", (event) => {
      // Check if clicked element or its parent is a language button
      const langBtn = event.target.closest(".lang-btn");
      if (langBtn && langBtn.dataset.lang) {
        setLanguage(langBtn.dataset.lang);
      }
    });
  }
})();
