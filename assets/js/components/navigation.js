// Navigation Component - centralized header for all pages
// Usage: Include this script in your HTML and call loadNavigation()

function loadNavigation() {
  const nav = `
    <!-- Header -->
    <header class="header" id="header">
      <div class="container">
        <nav class="nav">
          <a href="/" class="logo">Igor Szuniewicz</a>
          <ul class="nav-links">
            <li><a href="/" data-i18n="nav_home">Home</a></li>
            <li><a href="/about.html" data-i18n="nav_about">About</a></li>
            <li><a href="/projects/" data-i18n="nav_projects">Projects</a></li>
            <li><a href="/music.html" data-i18n="nav_music">Music</a></li>
            <li><a href="/contact.html" data-i18n="nav_contact">Contact</a></li>
            <li class="lang-switcher">
              <button class="lang-btn active" data-lang="en">EN</button>
              <button class="lang-btn" data-lang="pl">PL</button>
              <button class="lang-btn" data-lang="nl">NL</button>
            </li>
          </ul>
          <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay"></div>

    <!-- Mobile Menu -->
    <div class="mobile-menu">
      <ul class="mobile-nav-links">
        <li><a href="/" data-i18n="nav_home">Home</a></li>
        <li><a href="/about.html" data-i18n="nav_about">About</a></li>
        <li><a href="/projects/" data-i18n="nav_projects">Projects</a></li>
        <li><a href="/music.html" data-i18n="nav_music">Music</a></li>
        <li><a href="/contact.html" data-i18n="nav_contact">Contact</a></li>
      </ul>
      <div class="mobile-lang-switcher">
        <button class="lang-btn active" data-lang="en">EN</button>
        <button class="lang-btn" data-lang="pl">PL</button>
        <button class="lang-btn" data-lang="nl">NL</button>
      </div>
    </div>
  `;

  // Insert navigation at the beginning of body
  if (!document.body) {
    // Navigation cannot load - document.body is null
    return;
  }

  document.body.insertAdjacentHTML("afterbegin", nav);
  setupSkipLink();

  // Set active link based on current page
  setActiveLink();

  // Initialize mobile menu - with small delay to ensure DOM is ready
  setTimeout(initMobileMenu, 10);

  // Initialize scroll effect
  initScrollEffect();
}

// Set active class on current page link
function setActiveLink() {
  const path = normalizePath(window.location.pathname);
  const links = document.querySelectorAll(".nav-links a, .mobile-nav-links a");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return;

    const targetPath = normalizePath(href);
    const isProjectsLink = targetPath === "/projects";

    if (isProjectsLink) {
      if (path === "/projects" || path.startsWith("/projects/")) {
        link.classList.add("active");
      }
      return;
    }

    if (targetPath === path) {
      link.classList.add("active");
    }
  });
}

function normalizePath(value) {
  if (!value) return "/";
  let pathname = value;

  try {
    pathname = new URL(value, window.location.origin).pathname;
  } catch (error) {
    // value was likely already a pathname – keep as-is
  }

  pathname = pathname.replace(/index\.html$/i, "");
  if (pathname.endsWith("/") && pathname !== "/") {
    pathname = pathname.slice(0, -1);
  }

  return pathname || "/";
}

function setupSkipLink() {
  const targetId = ensureMainTargetId();
  if (!targetId) return;

  if (document.querySelector(".skip-nav")) {
    return; // Skip link already exists
  }

  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.className = "skip-link";
  skipLink.textContent = "Skip to main content";
  document.body.insertAdjacentElement("afterbegin", skipLink);
}

function ensureMainTargetId() {
  const main = document.querySelector("main");
  if (main) {
    if (!main.id) {
      main.id = "main-content";
    }
    return main.id;
  }

  const fallback =
    document.querySelector('[role="main"]') ||
    document.getElementById("smooth-nav-container") ||
    document.querySelector("section");

  if (!fallback) {
    return null;
  }

  if (!fallback.id) {
    fallback.id = "main-content";
  }

  if (!fallback.hasAttribute("tabindex")) {
    fallback.setAttribute("tabindex", "-1");
  }

  return fallback.id;
}

// Initialize mobile menu toggle
function initMobileMenu() {
  // Prevent double initialization
  if (window.__mobileMenuInitialized) return;
  window.__mobileMenuInitialized = true;

  const setup = () => {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    const overlay = document.querySelector(".mobile-menu-overlay");

    const closeMenu = () => {
      toggle?.classList.remove("active");
      menu?.classList.remove("active");
      overlay?.classList.remove("active");
    };

    const openMenu = () => {
      toggle?.classList.add("active");
      menu?.classList.add("active");
      overlay?.classList.add("active");
    };

    document.addEventListener("click", (event) => {
      const target = event.target;

      if (toggle && toggle.contains(target)) {
        if (menu?.classList.contains("active")) {
          closeMenu();
        } else {
          openMenu();
        }
        return;
      }

      if (
        target === overlay ||
        target?.closest(".mobile-menu a, .mobile-lang-switcher .lang-btn")
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu?.classList.contains("active")) {
        closeMenu();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}

// Add scrolled class to header
function initScrollEffect() {
  const header = document.getElementById("header");
  if (!header) return;

  // Throttled scroll handler to improve performance
  let scrollTimeout;
  const handleScroll = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, 10);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Store reference for cleanup
  window._scrollHandler = handleScroll;
}

// Cleanup function to prevent memory leaks
function cleanupNavigation() {
  // Remove scroll event listener
  if (window._scrollHandler) {
    window.removeEventListener("scroll", window._scrollHandler);
    window._scrollHandler = null;
  }

  // Remove mobile menu event listeners
  const toggle = document.querySelector(".mobile-menu-toggle");
  const overlay = document.querySelector(".mobile-menu-overlay");

  if (toggle) {
    toggle.replaceWith(toggle.cloneNode(true)); // Remove all event listeners
  }
  if (overlay) {
    overlay.replaceWith(overlay.cloneNode(true)); // Remove all event listeners
  }
}

// Add cleanup on page unload
window.addEventListener("beforeunload", cleanupNavigation);

// Expose cleanup function globally
window.cleanupNavigation = cleanupNavigation;

// Auto-load - always wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(loadNavigation, 0); // Small delay to ensure body exists
  });
} else {
  // DOM already loaded
  setTimeout(loadNavigation, 0);
}
