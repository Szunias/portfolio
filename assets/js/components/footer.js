/**
 * Footer Component
 * Dynamically loads and manages footer across all pages
 * Unified footer HTML with i18n support
 */

(function () {
  'use strict';

  /**
   * Load footer into the page
   */
  function loadFooter() {
    const footer = `
    <footer class="footer" role="contentinfo" itemscope itemtype="https://schema.org/WPFooter">
      <div class="container">
        <div class="footer-content">
          <div class="logo" itemprop="name">Igor Szuniewicz</div>
          <nav aria-label="Footer navigation">
            <ul class="footer-links">
              <li>
                <a href="/projects/" data-i18n="nav.footer.projects" aria-label="View all projects"
                  >Projects</a>
              </li>
              <li>
                <a href="music.html" data-i18n="nav.footer.music" aria-label="Listen to music"
                  >Music</a>
              </li>
              <li>
                <a href="about.html" data-i18n="nav.footer.about" aria-label="Learn about Igor"
                  >About</a>
              </li>
              <li>
                <a href="contact.html" data-i18n="nav.footer.contact" aria-label="Contact Igor"
                  >Contact</a>
              </li>
            </ul>
          </nav>
          <div class="social-links" aria-label="Social media links">
            <a
              href="https://www.linkedin.com/in/igor-szuniewicz-a6877a2a3"
              class="social-link"
              aria-label="LinkedIn profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                />
              </svg>
            </a>
            <a
              href="https://github.com/Szunias"
              class="social-link"
              aria-label="GitHub profile"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
                />
              </svg>
            </a>
            <a
              href="https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6"
              class="social-link"
              aria-label="Spotify artist page"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path
                  d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25m-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1m-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.35.1-.65-.15-.75-.45-.1-.35.15-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
        <div class="copyright">&copy; 2025 Igor Szuniewicz. All rights reserved.</div>
      </div>
    </footer>
    `;

    // Check if footer already exists (prevent duplicates)
    if (document.querySelector('.footer')) {
      console.log('[Footer] Footer already exists, skipping injection');
      return;
    }

    // Inject footer at the end of body
    document.body.insertAdjacentHTML('beforeend', footer);
    console.log('[Footer] Footer injected successfully');

    // Apply translations if i18n is ready
    if (window.i18n && typeof window.i18n._applyTranslations === 'function') {
      window.i18n._applyTranslations();
    }
  }

  /**
   * Initialize footer (called on page load and after AJAX navigation)
   */
  function initFooter() {
    // Remove existing footer if present (for AJAX re-initialization)
    const existingFooter = document.querySelector('.footer');
    if (existingFooter) {
      existingFooter.remove();
    }

    loadFooter();
  }

  // Export functions to global scope
  window.initFooter = initFooter;
  window.loadFooter = loadFooter;

  // Auto-load footer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter, { once: true });
  } else {
    // DOM already loaded, use setTimeout to ensure body exists
    setTimeout(loadFooter, 0);
  }

})();
