/**
 * Page-Specific Handlers Module
 * Contains reinitialization logic for each page type
 */

export class PageHandlers {
  constructor(logger, cleanupManager) {
    this.log = logger;
    this.cleanupManager = cleanupManager;
  }

  /**
   * Main page-specific reinitialization dispatcher
   */
  reinitializePage(currentPath) {
    this.log('Reinitializing page-specific scripts for:', currentPath);

    // Contact page
    if (currentPath === '/contact.html' || currentPath === '/contact') {
      this.reinitializeContactPage();
    }
    // About page
    else if (currentPath === '/about.html' || currentPath === '/about') {
      this.reinitializeAboutPage();
    }
    // Music page
    else if (currentPath === '/music.html' || currentPath === '/music') {
      this.reinitializeMusicPage();
    }
    // Home page
    else if (currentPath === '/' || currentPath === '/index.html') {
      this.reinitializeHomePage();
    }
    // Projects page
    else if (currentPath === '/projects' || currentPath.startsWith('/projects/')) {
      this.reinitializeProjectsPage();
    }
    // Other pages
    else {
      this.log('  → Generic page, no specific re-init needed');
    }
  }

  /**
   * Contact Page Handler
   */
  reinitializeContactPage() {
    this.log('  → Contact page detected, reinitializing scripts');

    // 1. Fix FontAwesome icons - wait for font to fully load
    setTimeout(() => {
      this.log('  → Fixing FontAwesome icons positioning');

      // Check if FontAwesome converted icons to SVG
      const svgIcons = document.querySelectorAll('.social-icon svg');
      if (svgIcons.length > 0) {
        this.log('    FontAwesome converted ' + svgIcons.length + ' icons to SVG - fixing...');

        svgIcons.forEach((svg) => {
          svg.style.cssText =
            'width: 1.2rem !important; height: 1.2rem !important; margin: 0 !important; padding: 0 !important;';
        });
      }

      // Fix regular <i> icons
      const iconElements = document.querySelectorAll('.social-icon i');
      iconElements.forEach((icon) => {
        icon.style.cssText =
          'font-size: 1.2rem !important; line-height: 1 !important; margin: 0 auto !important; padding: 0 !important; display: block !important;';
      });

      // Ensure containers are proper flexbox
      const containers = document.querySelectorAll('.social-icon');
      containers.forEach((container) => {
        container.style.cssText =
          'display: flex !important; align-items: center !important; justify-content: center !important; width: 40px !important; height: 40px !important;';
      });

      this.log('    ✓ Fixed ' + (svgIcons.length + iconElements.length) + ' icons');
    }, 1000);

    // 2. Reinitialize FAQ accordion functionality
    setTimeout(() => {
      this.log('  → Reinitializing FAQ accordion');
      const faqItems = document.querySelectorAll('.faq-item');

      faqItems.forEach((item, index) => {
        const button = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!button || !answer) return;

        // Set ARIA attributes
        const answerId = `faq-answer-${index}`;
        button.setAttribute('aria-controls', answerId);
        button.setAttribute('aria-expanded', 'false');
        answer.id = answerId;
        answer.setAttribute('role', 'region');
        answer.setAttribute('aria-hidden', 'true');

        // Clone button to remove old event listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Add fresh click listener
        newButton.addEventListener('click', () => {
          const isOpen = item.classList.toggle('open');
          newButton.setAttribute('aria-expanded', String(isOpen));
          answer.setAttribute('aria-hidden', String(!isOpen));
        });
      });

      this.log('    ✓ FAQ reinitialized with ' + faqItems.length + ' items');
    }, 600);

    // 3. Reinitialize contact form
    setTimeout(() => {
      const form = document.getElementById('contact-form');
      if (form) {
        // Clone to remove old listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Re-add submit handler
        newForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const btn = newForm.querySelector('button[type="submit"]');
          const successMsg = document.getElementById('success-message');

          btn.disabled = true;
          btn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';

          try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            btn.innerHTML = '<span>Message Sent!</span><i class="fas fa-check"></i>';
            if (successMsg) successMsg.style.display = 'block';
            newForm.reset();

            setTimeout(() => {
              btn.disabled = false;
              btn.innerHTML = '<span>Send Message</span><i class="fas fa-arrow-right"></i>';
              if (successMsg) successMsg.style.display = 'none';
            }, 5000);
          } catch (error) {
            btn.disabled = false;
            btn.innerHTML = '<span>Send Message</span><i class="fas fa-arrow-right"></i>';
          }
        });

        this.log('    ✓ Contact form reinitialized');
      }
    }, 700);
  }

  /**
   * About Page Handler
   */
  reinitializeAboutPage() {
    this.log('  → About page detected, checking skill modal system');

    // Ensure window.openSkillModal is available
    if (!window.openSkillModal) {
      this.log('    → window.openSkillModal not found, loading skill-modal-system.js dynamically');

      const script = document.createElement('script');
      script.src = '/assets/js/skill-modal-system.js';
      script.defer = true;
      script.onload = () => {
        this.log('    ✓ skill-modal-system.js loaded successfully');
      };
      script.onerror = () => {
        this.log('    ✗ Failed to load skill-modal-system.js');
      };
      document.head.appendChild(script);
    } else {
      this.log('    ✓ window.openSkillModal already available');

      // CRITICAL FIX: Reinitialize skill modal system after AJAX navigation
      // This ensures cursor styles and event handlers are properly set up
      if (typeof window.initSkillModal === 'function') {
        this.log('    → Calling initSkillModal() to reinitialize system');
        setTimeout(() => {
          window.initSkillModal();
        }, 100);
      }
    }
  }

  /**
   * Music Page Handler
   */
  reinitializeMusicPage() {
    this.log('  → Music page detected');
    this.log('    → Waiting for music.js to load and reinitializing');

    setTimeout(() => {
      this.log('    → Checking for window.initMusicPage...');

      if (window.initMusicPage && typeof window.initMusicPage === 'function') {
        this.log('    → Calling window.initMusicPage()');
        window.initMusicPage();
      } else if (window.refreshMusicList && typeof window.refreshMusicList === 'function') {
        this.log('    → Calling window.refreshMusicList() as fallback');
        window.refreshMusicList();
      } else {
        this.log('    ✗ No music initialization function found!');
      }
    }, 500);
  }

  /**
   * Projects Page Handler
   */
  reinitializeProjectsPage() {
    this.log('━━━ Reinitializing Projects Page ━━━');

    const grid = document.querySelector('.projects-grid');

    // Load ALL images in document
    this.log('  → Step 1: Loading ALL images in document (aggressive mode)');
    const allImages = Array.from(document.querySelectorAll('img'));
    allImages.forEach((img, index) => {
      if (img.dataset.src && img.dataset.src !== img.src) {
        const srcValue = img.dataset.src;
        img.src = srcValue;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        this.log(`    ✓ Image ${index + 1}: ${srcValue.substring(srcValue.lastIndexOf('/') + 1)}`);
      }
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'eager');
      }
      if (!img.classList.contains('loaded')) {
        img.addEventListener(
          'load',
          () => {
            img.classList.add('loaded');
          },
          { once: true }
        );
        if (img.complete && img.naturalWidth > 0) {
          img.classList.add('loaded');
        }
      }
    });

    // Load ALL videos in document
    this.log('  → Step 2: Loading ALL videos in document (aggressive mode)');
    const allVideos = Array.from(document.querySelectorAll('video'));
    allVideos.forEach((video, index) => {
      if (video.hasAttribute('data-autoplay') || video.hasAttribute('autoplay')) {
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('loop', '');
        video.removeAttribute('data-autoplay');
        video.removeAttribute('data-lazy-video');
      }

      const sources = video.querySelectorAll('source');
      let sourcesLoaded = 0;
      sources.forEach((source) => {
        if (source.dataset.src && !source.src) {
          source.src = source.dataset.src;
          source.removeAttribute('data-src');
          sourcesLoaded++;
        }
      });

      if (sourcesLoaded > 0) {
        video.load();
        video.classList.add('loaded');
        this.log(`    ✓ Video ${index + 1}: loaded with ${sourcesLoaded} sources`);

        const rect = video.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0 && video.hasAttribute('autoplay')) {
          video.play().catch(() => {});
        }
      }
    });

    if (!grid) {
      this.log('  ⚠ Projects grid not found, but all images/videos have been loaded');
      return;
    }

    // Setup IntersectionObserver for videos
    if ('IntersectionObserver' in window && allVideos.length > 0) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              if (video.paused && video.hasAttribute('autoplay')) {
                video.play().catch(() => {});
              }
            } else {
              if (!video.paused) {
                video.pause();
              }
            }
          });
        },
        { rootMargin: '200px' }
      );

      // Track observer for cleanup
      this.cleanupManager.trackObserver(videoObserver);

      allVideos.forEach((video) => {
        if (video.hasAttribute('autoplay')) {
          videoObserver.observe(video);
        }
      });
    }

    this.log('━━━ Projects page initialization complete ━━━');
    this.log('  ℹ️  Tech tags will be rendered by translation system after load');
  }

  /**
   * Home Page Handler
   */
  reinitializeHomePage() {
    this.log('━━━ Reinitializing Home Page ━━━');

    // Re-initialize animated counters
    this.log('  → Step 1: Reinitializing stat counters');
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    this.log(`    Found ${statNumbers.length} stat counters`);

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
      // Remove 'counted' class so they can animate again
      statNumbers.forEach((el) => {
        el.classList.remove('counted');
        el.textContent = '0';
      });

      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.target.classList.contains('counted')) return;

            entry.target.classList.add('counted');

            const element = entry.target;
            const target = Number.parseInt(element.getAttribute('data-count'), 10);
            if (!Number.isFinite(target)) return;

            const prefix = element.getAttribute('data-prefix') || '';
            const suffix = element.getAttribute('data-suffix') || '';
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;

            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              element.textContent = `${prefix}${Math.floor(current)}${suffix}`;
            }, duration / steps);

            this.log(`    ✓ Counter animated: ${target}${suffix}`);
          });
        },
        { threshold: 0.5 }
      );

      // Track observer for cleanup
      this.cleanupManager.trackObserver(counterObserver);

      statNumbers.forEach((el) => counterObserver.observe(el));
      this.log(`    ✓ Observing ${statNumbers.length} counters`);
    }

    // Vimeo iframe styling fix
    setTimeout(() => {
      this.log('  → Fixing Vimeo iframe styling');

      const vimeoWrapper = document.querySelector('.vimeo-wrapper');
      const vimeoIframe = document.querySelector('#vimeo-iframe');

      if (vimeoWrapper) {
        vimeoWrapper.style.position = 'absolute';
        vimeoWrapper.style.top = '0';
        vimeoWrapper.style.left = '-2px';
        vimeoWrapper.style.width = 'calc(100% + 4px)';
        vimeoWrapper.style.height = '100%';
        vimeoWrapper.style.borderRadius = '24px';
        vimeoWrapper.style.overflow = 'hidden';
      }

      if (vimeoIframe) {
        vimeoIframe.style.position = 'absolute';
        vimeoIframe.style.top = '0';
        vimeoIframe.style.left = '0';
        vimeoIframe.style.width = '100%';
        vimeoIframe.style.height = '100%';
        vimeoIframe.style.border = 'none';

        if (!vimeoIframe.src && vimeoIframe.dataset.src) {
          vimeoIframe.src = vimeoIframe.dataset.src;
          this.log('    → Loaded iframe src from data-src');
        }
      }

      this.log('    ✓ Vimeo iframe adjusted');
    }, 800);

    this.log('━━━ Home page initialization complete ━━━');
  }
}
