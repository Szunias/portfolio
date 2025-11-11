/**
 * Performance Boost Script
 * Professional optimizations for faster page loading and smoother experience
 */

(function () {
  "use strict";

  // Prevent multiple initializations
  if (window.__performanceBoostInitialized) return;
  window.__performanceBoostInitialized = true;

  /**
   * Optimize video loading - lazy load sources and autoplay when visible
   */
  function optimizeVideoLoading() {
    const videos = document.querySelectorAll("video[data-autoplay]");

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;

            if (entry.isIntersecting) {
              // Load video sources if not already loaded
              if (!video.classList.contains("loaded")) {
                const sources = video.querySelectorAll("source[data-src]");

                // Check if sources exist before processing
                if (sources.length === 0) {
                  console.warn("No video sources found for video:", video);
                  videoObserver.unobserve(video);
                  return;
                }

                sources.forEach((source) => {
                  const src = source.getAttribute("data-src");
                  if (src) {
                    source.src = src;
                    source.removeAttribute("data-src");
                  } else {
                    console.warn(
                      "Empty data-src attribute found for video source:",
                      source,
                    );
                  }
                });

                video.classList.add("loaded");

                // Add error handling for video loading
                video.addEventListener(
                  "error",
                  (e) => {
                    console.error("Video loading error:", e);
                    videoObserver.unobserve(video);
                  },
                  { once: true },
                );

                video.addEventListener(
                  "loadeddata",
                  () => {
                    video.play().catch(() => {
                      // Autoplay prevented by browser - silently fail
                    });
                  },
                  { once: true },
                );

                video.load();
              } else if (video.paused) {
                // Already loaded, just play
                video.play().catch(() => {
                  // Silently handle play failure
                });
              }

              // Stop observing this video after loading
              videoObserver.unobserve(video);
            }
          });
        },
        {
          rootMargin: "300px", // Start loading 300px before visible
          threshold: 0.01,
        },
      );

      videos.forEach((video) => videoObserver.observe(video));
    } else {
      // Fallback for browsers without IntersectionObserver
      videos.forEach((video) => {
        const sources = video.querySelectorAll("source[data-src]");
        if (sources.length > 0) {
          sources.forEach((source) => {
            const src = source.getAttribute("data-src");
            if (src) {
              source.src = src;
            }
          });
          video.load();
          video.play().catch(() => {
            // Silently handle play failure
          });
        }
      });
    }
  }

  /**
   * Debounce function for performance-critical events
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Optimize scroll event listeners - removed dangerous prototype override
   * Modern browsers already handle passive scrolling efficiently
   */
  function optimizeScrollListeners() {
    // This function is kept for compatibility but no longer modifies prototypes
    // All scroll listeners in the codebase already use { passive: true }
  }

  /**
   * Prefetch links on hover for instant navigation
   */
  function setupLinkPrefetch() {
    const prefetched = new Set();

    document.addEventListener(
      "mouseover",
      (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || prefetched.has(href)) return;
        if (
          href.startsWith("#") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        )
          return;
        if (link.hasAttribute("target")) return;

        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname.endsWith(".zip") || url.pathname.endsWith(".pdf"))
          return;

        const prefetchLink = document.createElement("link");
        prefetchLink.rel = "prefetch";
        prefetchLink.href = url.pathname + url.search;
        document.head.appendChild(prefetchLink);

        prefetched.add(prefetchLink.href);
      },
      { passive: true },
    );
  }

  /**
   * Reduce animation during scroll for better performance
   */
  function reduceMotionDuringScroll() {
    let scrollTimeout;
    let isScrolling = false;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add("is-scrolling");
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove("is-scrolling");
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
  }

  /**
   * Optimize images - lazy load with IntersectionObserver
   */
  function optimizeImages() {
    const lazyImages = document.querySelectorAll("img.lazy-img[data-src]");

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.getAttribute("data-src");

              if (src && !img.classList.contains("loaded")) {
                img.src = src;
                img.removeAttribute("data-src");

                img.addEventListener(
                  "load",
                  () => {
                    img.classList.add("loaded");
                  },
                  { once: true },
                );

                // Mark as loading to prevent duplicate loads
                img.classList.add("loading");
              }

              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: "300px",
          threshold: 0.01,
        },
      );

      lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach((img) => {
        const src = img.getAttribute("data-src");
        if (src) {
          img.src = src;
          img.classList.add("loaded");
        }
      });
    }

    // Ensure all other images have proper attributes
    const regularImages = document.querySelectorAll(
      "img:not(.lazy-img):not([loading])",
    );
    regularImages.forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
    });
  }

  /**
   * Inject Breadcrumb structured data for SEO
   */
  function injectBreadcrumbStructuredData() {
    if (document.querySelector('script[data-schema="breadcrumbs"]')) {
      return; // already injected
    }

    const pathname = window.location.pathname.replace(/index\.html$/i, "");
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return; // homepage - no breadcrumb needed
    }

    const origin = window.location.origin;
    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: origin + "/",
      },
    ];

    const LABELS = {
      "/projects/": "Projects",
      "/about.html": "About",
      "/music.html": "Music",
      "/contact.html": "Contact",
      "/cv/igor-cv-dark.html": "CV",
    };

    let accumulated = "";
    segments.forEach((segment) => {
      accumulated += "/" + segment;
      const isFile = segment.includes(".");
      const urlPath = isFile ? accumulated : accumulated + "/";

      let label = LABELS[urlPath] || LABELS[segment];
      if (!label && !isFile) {
        // Avoid creating breadcrumbs for directories without dedicated pages
        return;
      }
      if (!label && isFile) {
        const ogTitle = document.querySelector(
          'meta[property="og:title"]',
        )?.content;
        const fallbackTitle = ogTitle || document.title || segment;
        label = fallbackTitle.split("|")[0].split("—")[0].trim();
      } else if (!label) {
        label = segment
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      if (!label) {
        return;
      }

      const url = origin + urlPath;
      if (items.some((item) => item.item === url)) {
        return;
      }

      items.push({
        "@type": "ListItem",
        position: items.length + 1,
        name: label,
        item: url,
      });
    });

    if (items.length <= 1) {
      return;
    }

    const data = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.schema = "breadcrumbs";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Initialize all optimizations
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runOptimizations);
    } else {
      // DOM already loaded, run after a small delay to not block initial render
      requestAnimationFrame(runOptimizations);
    }
  }

  function runOptimizations() {
    // Run critical optimizations immediately
    optimizeScrollListeners();

    // Video loading is critical for UX - run earlier
    optimizeVideoLoading();

    // Images gatekeep the project list visibility, so start lazy loading now
    optimizeImages();

    // Defer non-critical optimizations
    requestIdleCallback(
      () => {
        // Re-run in case new lazy images were injected after the initial pass
        optimizeImages();
        setupLinkPrefetch();
        reduceMotionDuringScroll();
        injectBreadcrumbStructuredData();
      },
      { timeout: 2000 },
    );
  }

  // Polyfill for requestIdleCallback
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb, options) {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50.0 - (Date.now() - start));
          },
        });
      }, options?.timeout || 1);
    };

  // Start initialization
  init();
})();
