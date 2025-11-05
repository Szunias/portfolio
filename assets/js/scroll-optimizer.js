// Scroll Performance Optimizations for 60fps
// This module optimizes scroll event handling and throttles heavy operations

(function() {
  'use strict';

  // Performance monitoring
  let frameCount = 0;
  let lastTime = performance.now();
  let currentFPS = 60;

  function measureFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      currentFPS = Math.round(frameCount * 1000 / (now - lastTime));
      frameCount = 0;
      lastTime = now;
      
      // Auto-enable performance mode if FPS drops below 45
      if (currentFPS < 45 && !document.body.classList.contains('fps-boost')) {
        document.body.classList.add('fps-boost');
        // Auto-enabled fps-boost mode due to low FPS
      }
    }
    requestAnimationFrame(measureFPS);
  }
  requestAnimationFrame(measureFPS);

  // Optimized scroll handler with RAF throttling
  let ticking = false;
  let scrollY = 0;
  let previousScrollY = 0;
  let scrollDirection = 0;

  function updateScrollValues() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop;
    scrollDirection = scrollY > previousScrollY ? 1 : scrollY < previousScrollY ? -1 : 0;
    previousScrollY = scrollY;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScrollElements);
      ticking = true;
    }
  }

  // Batched DOM updates for better performance
  function updateScrollElements() {
    updateScrollValues();

    // Only update elements that actually need to change
    updateNavigation();
    updateBackgroundElements();
    updateVisibilityElements();

    ticking = false;
  }

  // Optimized navigation updates
  function updateNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    // Add subtle scroll effect to navigation
    const opacity = Math.max(0.85, 1 - scrollY / 500);
    nav.style.opacity = opacity;

    // Update logo audio visibility
    const logoAudio = document.querySelector('.logo-audio');
    if (logoAudio) {
      const onHome = !!document.getElementById('projects-showcase');
      const shouldShow = onHome && scrollY < 140;
      logoAudio.classList.toggle('visible', shouldShow);
    }
  }

  // Throttled background element updates
  let backgroundUpdateCounter = 0;
  function updateBackgroundElements() {
    // Only update background elements every 3rd frame to improve performance
    backgroundUpdateCounter++;
    if (backgroundUpdateCounter % 3 !== 0) return;

    // Update waves if they exist (already optimized in CSS)
    const waves = document.querySelector('.bg-waves');
    if (waves && !document.body.classList.contains('fps-boost')) {
      // Waves are now purely CSS animated for better performance
      waves.style.transform = `translateY(${scrollY * -0.3}px)`;
    }

    // Update orbs with parallax (throttled)
    const orbs = document.querySelectorAll('.bg-orbs .orb');
    if (orbs.length > 0 && !document.body.classList.contains('fps-boost')) {
      orbs.forEach((orb, index) => {
        const speed = 0.1 + (index * 0.05);
        const yOffset = scrollY * speed;
        orb.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      });
    }
  }

  // Intersection Observer for better visibility detection
  let visibilityObserver;
  function setupVisibilityObserver() {
    if (!('IntersectionObserver' in window)) return;

    visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe reveal elements
    document.querySelectorAll('[data-reveal]').forEach(el => {
      visibilityObserver.observe(el);
    });
  }

  function updateVisibilityElements() {
    // If IntersectionObserver is not available, fallback to manual checking
    if (!visibilityObserver) {
      const vh = window.innerHeight;
      document.querySelectorAll('[data-reveal]:not(.in-view)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.9 && rect.bottom > 0) {
          el.classList.add('in-view');
        }
      });
    }
  }

  // Debounced resize handler
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Update canvas sizes if they exist
      const eqCanvas = document.querySelector('.bg-eq');
      if (eqCanvas) {
        eqCanvas.width = Math.floor(window.innerWidth * 0.6);
        eqCanvas.height = Math.floor(window.innerHeight * 0.5);
      }

      const logoCanvas = document.querySelector('.logo-audio canvas');
      if (logoCanvas) {
        logoCanvas.width = Math.min(window.innerWidth * 0.96, 1280);
        logoCanvas.height = 200;
      }
    }, 150);
  }

  // Passive event listeners for better scroll performance
  function initializeEventListeners() {
    // Use passive listeners where possible
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    // Optimize pointer events
    let pointerMoveTimeout;
    window.addEventListener('pointermove', (e) => {
      clearTimeout(pointerMoveTimeout);
      pointerMoveTimeout = setTimeout(() => {
        // Update CSS custom properties for mouse tracking
        document.documentElement.style.setProperty('--mx', (e.clientX || 0) + 'px');
        document.documentElement.style.setProperty('--my', (e.clientY || 0) + 'px');
      }, 16); // ~60fps throttling
    }, { passive: true });
  }

  // Optimize image loading for better scroll performance
  function optimizeImages() {
    // Add loading="lazy" to images that don't have it
    document.querySelectorAll('img:not([loading])').forEach(img => {
      img.setAttribute('loading', 'lazy');
    });

    // Optimize image decoding
    document.querySelectorAll('img').forEach(img => {
      if (img.complete) {
        img.style.contentVisibility = 'auto';
      }
    });
  }

  // Detect reduced motion preference
  function respectMotionPreferences() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleMotionPreference(mediaQuery) {
      if (mediaQuery.matches) {
        document.body.classList.add('reduced-motion');
        // Disable heavy animations
        document.querySelectorAll('.bg-waves, .bg-orbs, .bg-eq').forEach(el => {
          el.style.display = 'none';
        });
      }
    }
    
    handleMotionPreference(prefersReducedMotion);
    prefersReducedMotion.addEventListener('change', handleMotionPreference);
  }

  // Smooth scroll polyfill for better cross-browser support
  function enhanceSmoothScrolling() {
    // Enhanced smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    });
  }

  // Initialize all optimizations
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initializing scroll performance optimizations

    initializeEventListeners();
    setupVisibilityObserver();
    optimizeImages();
    respectMotionPreferences();
    enhanceSmoothScrolling();

    // Initial update
    updateScrollElements();

    // Expose performance info for debugging
    window.getScrollPerformance = () => ({
      currentFPS: currentFPS,
      scrollY: scrollY,
      scrollDirection: scrollDirection,
      fpsBoostActive: document.body.classList.contains('fps-boost'),
      reducedMotionActive: document.body.classList.contains('reduced-motion')
    });

    // Scroll optimizations initialized
  }

  // Auto-initialize
  init();

  // Export for manual initialization if needed
  window.ScrollOptimizer = {
    init,
    measureFPS: () => currentFPS,
    enableFpsBoost: () => document.body.classList.add('fps-boost'),
    disableFpsBoost: () => document.body.classList.remove('fps-boost')
  };

})();