/**
 * Project Pages Translation Loader
 * Handles translation loading and language switching for project pages
 *
 * This script provides a non-module fallback for project pages that need translations
 * Works with the existing data-i18n attributes in HTML
 */

(function () {
  "use strict";

  // Configuration
  const DEBUG = true;

  // Translation state
  let translations = {};
  let currentLang = localStorage.getItem("language") || "en";

  /**
   * Get nested translation value using dot notation
   */
  function getNestedTranslation(obj, path) {
    if (!obj) return null;
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Detect which translation file to load based on current page
   */
  function detectTranslationFile() {
    const path = window.location.pathname;
    const filename = path.split("/").pop().replace(".html", "");

    // Map of HTML files to their translation files
    const projectMap = {
      amorak: "amorak.json",
      akantilado: "akantilado.json",
      "ray-animation": "ray-animation.json",
      pawism: "pawism.json",
      "not-today-darling": "not-today-darling.json",
      environments: "environments.json",
      audiolab: "audiolab.json",
      "pause-and-deserve": "pause-and-deserve.json",
      "shadow-frames": "shadow-frames.json",
      "middleware-optimization": "middleware-optimization.json",
      richter: "richter.json",
      audioq: "audioq.json",
      "wwise-unreal-fixer": "wwise-unreal-fixer.json",
      "unreal-engine-rebuilder": "unreal-engine-rebuilder.json",
      middleware2: "middleware2.json",
      musicforgames: "musicforgames.json",
    };

    return projectMap[filename] || "shared.json";
  }

  /**
   * Apply translations to all elements with data-i18n attributes
   */
  function applyTranslations(lang) {
    const langData = translations[lang];
    if (!langData) {
      console.warn(`No translations found for language: ${lang}`);
      return;
    }

    // Update text content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const translation = getNestedTranslation(langData, key) || langData[key];

      if (translation) {
        // Handle HTML content for specific keys
        if (
          key.includes(".title") &&
          typeof translation === "string" &&
          translation.includes("<br>")
        ) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      } else if (DEBUG) {
        console.warn(`Translation missing for key: ${key}`);
      }
    });

    // Update aria-labels
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      const translation = getNestedTranslation(langData, key) || langData[key];

      if (translation) {
        el.setAttribute("aria-label", translation);
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const translation = getNestedTranslation(langData, key) || langData[key];

      if (translation) {
        el.setAttribute("placeholder", translation);
      }
    });

    // Update tech tags if present
    document.querySelectorAll("[data-tech]").forEach((container) => {
      const key = container.getAttribute("data-tech");
      const techArray = getNestedTranslation(langData, key) || langData[key];

      if (Array.isArray(techArray) && techArray.length > 0) {
        container.innerHTML = techArray
          .map((tech) => `<span class="project-tech-item">${tech}</span>`)
          .join("");
        container.style.display = "flex";
      } else {
        container.style.display = "none";
      }
    });
  }

  /**
   * Set language and update UI
   */
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("language", lang);

    // Apply translations
    applyTranslations(lang);

    // Update language button states
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Update HTML lang attribute
    document.documentElement.setAttribute("lang", lang);

    // Mark as ready
    document.documentElement.classList.add("translations-ready");

    // Emit event
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { language: lang },
      }),
    );
  }

  /**
   * Load translations from JSON file
   */
  async function loadTranslations() {
    try {
      const translationFile = detectTranslationFile();
      const basePath = "../locales/";
      const fullPath = basePath + translationFile;

      if (DEBUG) {
        console.log("Loading translations from:", fullPath);
      }

      const response = await fetch(fullPath);

      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Invalid translation data format");
      }

      translations = data;

      // Apply initial language
      setLanguage(currentLang);

      if (DEBUG) {
        console.log("Translations loaded successfully");
      }
    } catch (error) {
      console.error("Failed to load translations:", error);

      // Fallback translations
      translations = {
        en: { error: "Translation loading failed" },
        pl: { error: "Błąd ładowania tłumaczeń" },
        nl: { error: "Vertaling laden mislukt" },
      };

      // Still try to apply
      setLanguage(currentLang);
    }
  }

  /**
   * Initialize translation system
   */
  function init() {
    // Load translations
    loadTranslations();

    // Bind language button clicks
    document.addEventListener("click", (event) => {
      const langBtn = event.target.closest(".lang-btn");
      if (langBtn && langBtn.dataset.lang) {
        setLanguage(langBtn.dataset.lang);
      }
    });

    // Set initial language attribute
    document.documentElement.setAttribute("lang", currentLang);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Export for global access
  window.projectTranslations = {
    setLanguage,
    getCurrentLanguage: () => currentLang,
    applyTranslations: () => applyTranslations(currentLang),
  };
})();
