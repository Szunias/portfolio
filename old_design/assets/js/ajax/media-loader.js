/**
 * Media Loading Module
 * Handles loading of images, videos, and iframes from data-src attributes
 */

export class MediaLoader {
  constructor(logger) {
    this.log = logger;
  }

  /**
   * Load all media elements (images, videos, iframes) from data-src attributes
   * @param {boolean} detailed - If true, adds event listeners and detailed logging
   */
  loadAllMedia(detailed = false) {
    const prefix = detailed ? '    ' : '  ';

    // IMAGES
    this.loadImages(detailed, prefix);

    // VIDEOS
    this.loadVideos(detailed, prefix);

    // IFRAMES
    this.loadIframes(detailed, prefix);
  }

  /**
   * Load images from data-src
   */
  loadImages(detailed, prefix) {
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0 && detailed) {
      this.log(`${prefix}Found ${images.length} images with data-src`);
    }

    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.loading = 'eager';
        img.classList.add('loaded');

        // Add load event listener for detailed mode
        if (detailed && !img.complete) {
          img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        }
      }
    });
  }

  /**
   * Load videos from data-src
   */
  loadVideos(detailed, prefix) {
    const videos = document.querySelectorAll('video');
    if (videos.length > 0 && detailed) {
      this.log(`${prefix}Found ${videos.length} video elements`);
    }

    videos.forEach((video) => {
      let modified = false;

      // Set autoplay attributes
      if (video.hasAttribute('data-autoplay') || video.hasAttribute('autoplay')) {
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('loop', '');
        video.removeAttribute('data-autoplay');
        modified = true;
      }

      // Load sources
      const sources = video.querySelectorAll('source[data-src]');
      sources.forEach((source) => {
        if (source.dataset.src) {
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
          modified = true;
        }
      });

      // Reload and play if modified
      if (modified && sources.length > 0) {
        video.load();
        video.classList.add('loaded');

        // Try to play if in viewport
        if (video.hasAttribute('autoplay')) {
          const rect = video.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            video.play().catch(() => {
              // Autoplay blocked - that's ok
            });
          }
        }
      }
    });
  }

  /**
   * Load iframes from data-src
   */
  loadIframes(detailed, prefix) {
    const iframes = document.querySelectorAll('iframe[data-src]');
    if (iframes.length > 0 && detailed) {
      this.log(`${prefix}Found ${iframes.length} iframes with data-src`);
    }

    iframes.forEach((iframe) => {
      if (iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        iframe.classList.add('loaded');
      }
    });
  }

  /**
   * Initialize universal lazy loading with additional handling
   */
  initializeUniversalLazyLoading() {
    this.log('  → Initializing universal lazy loading');

    // Use the unified media loading function with detailed logging
    this.loadAllMedia(true);

    // ADDITIONAL: Handle images with lazy-img or lazy-cover class
    this.handleLazyImages();

    // ADDITIONAL: Handle videos with data-lazy-video attribute
    this.handleLazyVideos();

    // ADDITIONAL: Handle iframes with data-lazy-iframe attribute
    this.handleLazyIframes();

    this.log('  ✓ Universal lazy loading complete');
  }

  /**
   * Handle images with lazy classes
   */
  handleLazyImages() {
    const lazyImages = document.querySelectorAll('img.lazy-img, img.lazy-cover');
    if (lazyImages.length > 0) {
      this.log(`    Found ${lazyImages.length} images with lazy classes`);

      lazyImages.forEach((img) => {
        // If has data-src, convert it (already handled by loadAllMedia)
        if (img.dataset.src && !img.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }

        // Ensure loading attribute is set
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'eager');
        }

        // Mark as loaded when loads
        if (!img.complete) {
          img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        } else if (img.naturalWidth > 0) {
          img.classList.add('loaded');
        }
      });
    }
  }

  /**
   * Handle videos with data-lazy-video
   */
  handleLazyVideos() {
    const lazyVideos = document.querySelectorAll('video[data-lazy-video]');
    if (lazyVideos.length > 0) {
      this.log(`    Found ${lazyVideos.length} videos with data-lazy-video`);

      lazyVideos.forEach((video) => {
        const sources = video.querySelectorAll('source[data-src]');
        if (sources.length > 0) {
          sources.forEach((source) => {
            if (source.dataset.src && !source.src) {
              source.src = source.dataset.src;
              source.removeAttribute('data-src');
            }
          });

          video.load();
          video.classList.add('loaded');
          video.removeAttribute('data-lazy-video');

          // Try to play if autoplay and in viewport
          if (video.hasAttribute('autoplay')) {
            const rect = video.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              video.play().catch(() => {
                // Autoplay blocked - that's ok
              });
            }
          }
        }
      });
    }
  }

  /**
   * Handle iframes with data-lazy-iframe
   */
  handleLazyIframes() {
    const lazyIframes = document.querySelectorAll('iframe[data-lazy-iframe]');
    if (lazyIframes.length > 0) {
      this.log(`    Found ${lazyIframes.length} iframes with data-lazy-iframe`);

      lazyIframes.forEach((iframe) => {
        if (iframe.dataset.src && !iframe.src) {
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          iframe.removeAttribute('data-lazy-iframe');
          iframe.classList.add('loaded');
        }
      });
    }
  }
}
