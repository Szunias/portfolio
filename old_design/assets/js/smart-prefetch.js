/**
 * Smart Prefetch System
 * Preloads pages when user hovers over links or shows intent to navigate
 * Includes translation files and critical resources
 */

(function() {
  'use strict';
  
  // Configuration
  const config = {
    hoverDelay: 65,           // ms to wait before prefetching on hover
    touchDelay: 0,            // instant prefetch on touch
    prefetchLimit: 3,         // max concurrent prefetches
    cacheTimeout: 300000,     // 5 minutes cache
    enabled: true
  };
  
  // State
  const prefetchedUrls = new Set();
  const prefetchQueue = [];
  let activePrefetches = 0;
  let hoverTimer = null;
  
  // Check if prefetch is supported
  const supportsPrefetch = document.createElement('link').relList?.supports?.('prefetch');

  function normalizePath(value) {
    if (!value) return '/';
    let pathname = value;

    try {
      pathname = new URL(value, window.location.origin).pathname;
    } catch (error) {
      // Already a pathname
    }

    pathname = pathname.replace(/index\.html$/i, '');
    if (pathname.endsWith('/') && pathname !== '/') {
      pathname = pathname.slice(0, -1);
    }

    return pathname || '/';
  }
  
  /**
   * Get translation file for a given page URL
   */
  function getTranslationFileForUrl(url) {
    const path = new URL(url, window.location.origin).pathname;
    const filename = path.split('/').pop();
    
    const fileMap = {
      'index.html': 'index.json',
      'about.html': 'about.json',
      'contact.html': 'contact.json',
      'music.html': 'music.json',
      '': 'index.json',
      '/': 'index.json'
    };
    
    if (path.includes('projects/')) {
      return 'projects.json';
    }
    
    return fileMap[filename] || null;
  }
  
  /**
   * Prefetch a URL using <link rel="prefetch">
   */
  function prefetchUrl(url, priority = 'low') {
    if (!config.enabled || !supportsPrefetch) return;
    if (prefetchedUrls.has(url)) return;
    if (activePrefetches >= config.prefetchLimit) {
      prefetchQueue.push(url);
      return;
    }
    
    prefetchedUrls.add(url);
    activePrefetches++;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    
    link.onload = link.onerror = () => {
      activePrefetches--;
      processQueue();
    };
    
    document.head.appendChild(link);
    
    // Also prefetch translation file
    const translationFile = getTranslationFileForUrl(url);
    if (translationFile) {
      prefetchTranslation(translationFile);
    }
  }
  
  /**
   * Prefetch translation JSON file
   */
  function prefetchTranslation(filename) {
    const basePaths = ['locales/', '../locales/', '../../locales/'];
    
    for (const basePath of basePaths) {
      const url = basePath + filename;
      if (!prefetchedUrls.has(url)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        prefetchedUrls.add(url);
        break; // Only prefetch from first valid path
      }
    }
  }
  
  /**
   * Process prefetch queue
   */
  function processQueue() {
    if (prefetchQueue.length > 0 && activePrefetches < config.prefetchLimit) {
      const url = prefetchQueue.shift();
      prefetchUrl(url);
    }
  }
  
  /**
   * Check if URL is internal and should be prefetched
   */
  function shouldPrefetch(url) {
    if (!url) return false;
    
    // Skip external links, anchors, special protocols
    if (url.startsWith('#') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('http://') && !url.startsWith(window.location.origin) ||
        url.startsWith('https://') && !url.startsWith(window.location.origin)) {
      return false;
    }
    
    // Skip downloads and external targets
    return true;
  }
  
  /**
   * Handle link hover
   */
  function handleLinkHover(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!shouldPrefetch(href)) return;
    
    // Clear any existing timer
    if (hoverTimer) clearTimeout(hoverTimer);
    
    // Set new timer
    hoverTimer = setTimeout(() => {
      const fullUrl = new URL(href, window.location.href).href;
      prefetchUrl(fullUrl, 'high');
    }, config.hoverDelay);
  }
  
  /**
   * Handle link hover end
   */
  function handleLinkHoverEnd() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  }
  
  /**
   * Handle touch start (mobile)
   */
  function handleTouchStart(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!shouldPrefetch(href)) return;
    
    const fullUrl = new URL(href, window.location.href).href;
    prefetchUrl(fullUrl, 'high');
  }
  
  /**
   * Prefetch visible links in viewport (low priority)
   */
  function prefetchVisibleLinks() {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const href = link.getAttribute('href');
          
          if (shouldPrefetch(href)) {
            const fullUrl = new URL(href, window.location.href).href;
            // Low priority prefetch for visible links
            setTimeout(() => prefetchUrl(fullUrl, 'low'), 1000);
          }
          
          observer.unobserve(link);
        }
      });
    }, {
      rootMargin: '200px' // Start prefetching 200px before link enters viewport
    });
    
    // Observe all internal links
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (shouldPrefetch(href)) {
        observer.observe(link);
      }
    });
  }
  
  /**
   * Prefetch high-priority pages immediately
   */
  function prefetchCriticalPages() {
    // Prefetch main navigation pages immediately
    const criticalPages = [
      '/',
      '/about.html',
      '/projects/',
      '/music.html',
      '/contact.html'
    ];
    
    const currentPath = normalizePath(window.location.pathname);
    
    // Prefetch other pages (not current)
    criticalPages.forEach(page => {
      const targetPath = normalizePath(page);
      if (targetPath === currentPath) {
        return;
      }
      
      setTimeout(() => {
        prefetchUrl(page, 'low');
      }, 2000); // Wait 2s after page load
    });
  }
  
  /**
   * Initialize prefetch system
   */
  function init() {
    if (!config.enabled) return;
    
    // Add event listeners
    document.addEventListener('mouseover', handleLinkHover, { passive: true });
    document.addEventListener('mouseout', handleLinkHoverEnd, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      prefetchVisibleLinks();
      prefetchCriticalPages();
    } else {
      window.addEventListener('load', () => {
        prefetchVisibleLinks();
        prefetchCriticalPages();
      });
    }
    
    // Smart prefetch system initialized
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose API for debugging
  window.__prefetchDebug = {
    prefetchedUrls,
    config,
    stats: () => ({
      prefetched: prefetchedUrls.size,
      active: activePrefetches,
      queued: prefetchQueue.length
    })
  };
})();
