/**
 * Core Navigation Module
 * Main AJAX navigation logic
 */

export class NavigationCore {
  constructor(config, logger, cacheManager, cleanupManager, scriptReinitializer, mediaLoader, pageHandlers) {
    this.config = config;
    this.log = logger;
    this.cache = cacheManager;
    this.cleanup = cleanupManager;
    this.scriptReinit = scriptReinitializer;
    this.mediaLoader = mediaLoader;
    this.pageHandlers = pageHandlers;

    // State
    this.isNavigating = false;
    this.currentPath = window.location.pathname;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Normalize URL - convert to canonical form
   */
  normalizeUrl(url, baseUrl = window.location.href) {
    try {
      const urlObj = new URL(url, baseUrl);
      let pathname = urlObj.pathname;

      // Remove trailing slash (except root '/')
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }

      // Convert /index.html → /
      if (pathname === '/index.html') {
        pathname = '/';
      }

      // Convert /xxx/index.html → /xxx
      if (pathname.endsWith('/index.html')) {
        pathname = pathname.slice(0, -11);
      }

      return pathname;
    } catch {
      return url;
    }
  }

  /**
   * Check if URL is same origin
   */
  isSameOrigin(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Determine if link should be intercepted for AJAX navigation
   */
  shouldInterceptLink(link, href) {
    if (!href || href === '#') return false;

    // Ignore anchor links (#section)
    if (href.startsWith('#')) {
      return false;
    }

    // Ignore anchor links on same page (/page.html#section)
    try {
      const url = new URL(href, window.location.href);
      const normalizedPath = this.normalizeUrl(url.pathname);
      this.log('  Checking anchor:', normalizedPath, '===', this.currentPath, '&& hash:', url.hash);
      if (normalizedPath === this.currentPath && url.hash) {
        this.log('  → Anchor link on same page, allowing browser scroll');
        return false;
      }
    } catch {}

    // Ignore external links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!this.isSameOrigin(href)) return false;
    }

    // Ignore special protocols
    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }

    // Ignore links with target="_blank" or download
    if (link.hasAttribute('target') || link.hasAttribute('download')) {
      return false;
    }

    // Ignore if link has data-no-smooth
    if (link.hasAttribute('data-no-smooth')) {
      return false;
    }

    // Resolve relative URLs
    let absoluteUrl;
    let baseUrl = null;
    try {
      let basePath = this.currentPath;
      if (!basePath.includes('.') && !basePath.endsWith('/')) {
        basePath = basePath + '/';
      }
      baseUrl = new URL(basePath, window.location.origin).href;
      absoluteUrl = new URL(href, baseUrl).href;
    } catch {
      absoluteUrl = href;
      baseUrl = window.location.href;
    }
    const targetPath = this.normalizeUrl(absoluteUrl);

    this.log('  → URL resolution:', {
      'original href': href,
      currentPath: this.currentPath,
      baseUrl: baseUrl,
      'resolved absoluteUrl': absoluteUrl,
      'normalized targetPath': targetPath
    });

    // CRITICAL: Disable AJAX for problematic pages

    // Individual project pages
    if (targetPath.includes('/projects/') && targetPath.endsWith('.html')) {
      if (!targetPath.endsWith('/index.html')) {
        this.log('  ✓✓✓ PROJECT PAGE DETECTED - DISABLING AJAX for:', targetPath);
        return false;
      }
    }

    // Contact page - FontAwesome issues
    if (targetPath === '/contact.html' || targetPath === '/contact') {
      this.log('  ✓✓✓ CONTACT PAGE - DISABLING AJAX (FontAwesome positioning issues)');
      return false;
    }

    // Sound Design page - CSS path issues with AJAX navigation
    if (targetPath === '/sound-design.html' || targetPath === '/sound-design') {
      this.log('  ✓✓✓ SOUND DESIGN PAGE - DISABLING AJAX (CSS path resolution issues)');
      return false;
    }

    // Home page - Vimeo iframe issues
    if (targetPath === '/' || targetPath === '/index.html') {
      this.log('  ✓✓✓ HOME PAGE - DISABLING AJAX (Vimeo iframe and controls issues)');
      return false;
    }

    // Ignore if same URL
    if (targetPath === this.currentPath) return false;

    return true;
  }

  /**
   * Handle link click event
   */
  handleLinkClick = (e) => {
    this.log('[handleLinkClick] Event received, target:', e.target.tagName, e.target.className);

    // CRITICAL: Handle skill hexagon clicks DIRECTLY
    const hexagon = e.target.closest('.hexagon[data-skill]');
    if (hexagon) {
      this.log('[handleLinkClick] Skill hexagon detected, opening modal');
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const skillId = hexagon.dataset.skill;
      if (!skillId) {
        this.log('[handleLinkClick] ERROR: No skillId found');
        return;
      }

      if (window.openSkillModal) {
        this.log('[handleLinkClick] Calling openSkillModal(' + skillId + ')');
        window.openSkillModal(skillId);
      } else {
        this.log('[handleLinkClick] openSkillModal not ready, waiting...');
        setTimeout(() => {
          if (window.openSkillModal) {
            window.openSkillModal(skillId);
          }
        }, 100);
      }
      return;
    }

    const link = e.target.closest('a');
    if (!link) {
      this.log('[handleLinkClick] No link found via closest()');
      return;
    }

    const href = link.getAttribute('href');
    this.log('Link clicked:', href);

    if (!this.shouldInterceptLink(link, href)) {
      this.log('Link not intercepted - using normal browser navigation for:', href);

      // Force reload when clicking same-page links
      const targetPath = this.normalizeUrl(href, window.location.href);
      if (targetPath === this.currentPath) {
        e.preventDefault();
        this.log('  → Same page click detected (' + targetPath + ') - forcing reload');
        window.location.reload();
        return;
      }

      // Fix relative project links
      const isOnProjectsPage =
        this.currentPath === '/projects' ||
        this.currentPath === '/projects/' ||
        window.location.pathname === '/projects' ||
        window.location.pathname === '/projects/';

      if (isOnProjectsPage && href && !href.startsWith('/') && !href.startsWith('http')) {
        e.preventDefault();
        const correctUrl = '/projects/' + href;
        this.log('  → Fixing relative project URL:', href, '→', correctUrl);
        window.location.href = correctUrl;
        return;
      }

      return;
    }

    // Prevent default for AJAX navigation
    e.preventDefault();
    e.stopPropagation();

    // Resolve href to absolute URL
    let absoluteUrl;
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        absoluteUrl = href;
      } else {
        let basePath = this.currentPath;
        if (!basePath.includes('.') && !basePath.endsWith('/')) {
          basePath = basePath + '/';
        }
        const baseUrl = new URL(basePath, window.location.origin).href;
        this.log('  Resolving relative URL with base:', baseUrl);
        absoluteUrl = new URL(href, baseUrl).href;
      }
      this.log('  Click - Resolved href:', href, '→', absoluteUrl);
    } catch (err) {
      absoluteUrl = href;
      this.log('  Failed to resolve href, using as-is:', href, err);
    }

    const targetPath = this.normalizeUrl(absoluteUrl);

    // Double check for project pages
    if (
      targetPath.includes('/projects/') &&
      targetPath.endsWith('.html') &&
      !targetPath.endsWith('/index.html')
    ) {
      this.log('  WARNING: Project page slipped through! Force-disabling AJAX for:', targetPath);
      window.location.href = href;
      return;
    }

    this.log('Navigating with AJAX to normalized path:', targetPath);
    this.navigateToPage(targetPath);
  };

  /**
   * Handle link hover for preloading
   */
  handleLinkHover = (e) => {
    if (!this.config.preloadOnHover) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');

    // Skip preloading for project pages
    if (href && href.includes('.html') && !href.includes('index.html')) {
      return;
    }

    if (!this.shouldInterceptLink(link, href)) return;

    // Resolve relative URLs
    let absoluteUrl;
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        absoluteUrl = href;
      } else {
        let basePath = this.currentPath;
        if (!basePath.includes('.') && !basePath.endsWith('/')) {
          basePath = basePath + '/';
        }
        const baseUrl = new URL(basePath, window.location.origin).href;
        absoluteUrl = new URL(href, baseUrl).href;
      }
      this.log('  Hover - Resolved href:', href, '→', absoluteUrl);
    } catch {
      absoluteUrl = href;
    }
    const targetPath = this.normalizeUrl(absoluteUrl);

    // Schedule preload
    this.cache.schedulePreload(targetPath, (url) => this.loadPage(url));
  };

  /**
   * Fetch page from server
   */
  async fetchPage(url) {
    this.log('━━━ fetchPage START ━━━');
    this.log('  Requested URL:', url);

    // Convert normalized path to proper file path
    let fetchUrl = url;

    if (url === '/') {
      fetchUrl = '/index.html';
      this.log('  → Root path, using:', fetchUrl);
    } else if (!url.includes('.')) {
      fetchUrl = url + '/index.html';
      this.log('  → Directory path (no extension), using:', fetchUrl);
    } else if (url.endsWith('/')) {
      fetchUrl = url + 'index.html';
      this.log('  → Trailing slash, using:', fetchUrl);
    } else {
      this.log('  → File path, using as-is:', fetchUrl);
    }

    const response = await fetch(fetchUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    this.log('  Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    this.log('  HTML length:', html.length);

    const pageData = this.parsePage(html);
    this.log('  Parsed title:', pageData.title);
    this.log('━━━ fetchPage END ━━━');

    return pageData;
  }

  /**
   * Parse HTML to extract page data
   */
  parsePage(html) {
    // eslint-disable-next-line no-undef
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const mainElement = doc.querySelector('main');

    // Extract inline styles from head
    const inlineStyles = Array.from(doc.querySelectorAll('head style')).map(
      (style) => style.textContent
    );

    // Extract stylesheet links from head
    const stylesheetLinks = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]')).map(
      (link) => ({
        href: link.getAttribute('href'),
        media: link.getAttribute('media') || 'all'
      })
    );

    // Extract inline scripts from head (window.__I18N__)
    const inlineHeadScripts = Array.from(doc.querySelectorAll('head script:not([src])'))
      .filter((script) => script.textContent.includes('window.__I18N__'))
      .map((script) => script.textContent);

    return {
      title: doc.title || '',
      main: mainElement ? mainElement.innerHTML : null,
      body: doc.body.innerHTML,

      styles: {
        inline: inlineStyles,
        links: stylesheetLinks
      },

      meta: {
        description: doc.querySelector('meta[name="description"]')?.content || '',
        keywords: doc.querySelector('meta[name="keywords"]')?.content || '',
        ogTitle: doc.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: doc.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: doc.querySelector('meta[property="og:image"]')?.content || ''
      },

      scripts: Array.from(doc.querySelectorAll('script[data-reinit]')).map((s) => s.textContent),
      headScripts: inlineHeadScripts
    };
  }

  /**
   * Load page (from cache or fetch)
   */
  async loadPage(url) {
    this.log('loadPage called for:', url);

    // Check cache
    const cached = this.cache.getFromCache(url);
    if (cached) {
      return cached;
    }

    // Fetch and cache
    this.log('⚠ Cache miss, fetching:', url);
    const pageData = await this.fetchPage(url);
    this.log('✓ Fetched page:', url, 'title:', pageData.title);
    this.cache.addToCache(url, pageData);

    return pageData;
  }

  /**
   * Main navigation function
   */
  async navigateToPage(url) {
    if (this.isNavigating) {
      this.log('⚠ Navigation in progress, ignoring:', url);
      return;
    }

    this.isNavigating = true;

    // Cleanup BEFORE navigation
    this.cleanup.cleanupAll();

    // Close mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenu?.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      mobileOverlay?.classList.remove('active');
      mobileToggle?.classList.remove('active');
      mobileToggle?.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }

    this.showLoadingIndicator();
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.log('▶ NAVIGATION START');
    this.log('  From:', this.currentPath);
    this.log('  To:', url);
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const previousPath = this.currentPath;
      this.currentPath = url;
      this.log('✓ currentPath updated:', this.currentPath);

      // Use View Transition API if available (not on mobile)
      if (document.startViewTransition && !this.isMobile) {
        await this.navigateWithViewTransition(url);
      } else {
        await this.navigateWithFallback(url);
      }

      // Update browser history
      if (url !== previousPath) {
        history.pushState({ path: url }, '', url);
      }

      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.log('✓ NAVIGATION COMPLETE');
      this.log('  Current path:', this.currentPath);
      this.log('  Current title:', document.title);
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } catch (error) {
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.log('✗ NAVIGATION FAILED:', error);
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      window.location.href = url;
    } finally {
      this.hideLoadingIndicator();
      this.isNavigating = false;
    }
  }

  /**
   * Navigate using View Transition API
   */
  async navigateWithViewTransition(url) {
    this.log('Using View Transition API');

    const pageData = await this.loadPage(url);

    const transition = document.startViewTransition(async () => {
      this.updatePageContent(pageData, url);
    });

    await transition.finished;
  }

  /**
   * Navigate using CSS transition fallback
   */
  async navigateWithFallback(url) {
    this.log('Using CSS transition fallback');

    let mainEl = document.querySelector('main');
    if (!mainEl) {
      throw new Error('No main element found');
    }

    // Fade out
    mainEl.style.transition = `opacity ${this.config.fadeOutDuration}ms ease-out`;
    mainEl.style.opacity = '0';

    await new Promise((resolve) => setTimeout(resolve, this.config.fadeOutDuration));

    // Load and update content
    const pageData = await this.loadPage(url);
    this.updatePageContent(pageData, url);

    // Get NEW main element
    mainEl = document.querySelector('main');
    if (!mainEl) {
      this.log('Warning: No main element after update');
      return;
    }

    // Fade in
    mainEl.style.transition = `opacity ${this.config.fadeInDuration}ms ease-in`;
    requestAnimationFrame(() => {
      mainEl.style.opacity = '1';
    });

    await new Promise((resolve) => setTimeout(resolve, this.config.fadeInDuration));

    // Remove inline styles
    mainEl.style.transition = '';
    mainEl.style.opacity = '';
  }

  /**
   * Update page content in DOM
   */
  async updatePageContent(pageData, url) {
    this.log('━━━ updatePageContent START ━━━');
    this.log('  URL:', url);
    this.log('  Page title:', pageData.title);

    // Update title
    document.title = pageData.title;
    this.log('✓ Title updated to:', pageData.title);

    // Load styles BEFORE updating content and WAIT for them to load
    await this.updateStyles(pageData.styles);
    this.log('✓ Styles updated and loaded');

    // Update meta tags
    this.updateMetaTags(pageData.meta);

    // Replace body content (preserve infrastructure)
    this.log('  Replacing body content...');

    const infrastructureSelectors = [
      'header',
      '.bg-gradient',
      '.bg-grid',
      '.bg-orbs',
      '.skip-link',
      '.mobile-menu-overlay',
      '.mobile-menu',
      '.skill-detail-overlay',
      '#log-extractor-btn'
    ];

    const elementsToKeep = new Set();
    infrastructureSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => elementsToKeep.add(el));
    });

    const coreScriptPaths = [
      'enhanced-smooth-navigation.js',
      'components/navigation.js',
      'components/custom-cursor.js',
      'components/toast.js',
      'components/back-to-top.js',
      'translations.js',
      'preload-lang.js',
      'skill-modal-system.js',
      'log-extractor.js'
    ];

    // Keep core scripts
    document.querySelectorAll('script[src]').forEach((script) => {
      const src = script.getAttribute('src') || '';
      const isCore = coreScriptPaths.some((corePath) => src.includes(corePath));

      if (isCore) {
        elementsToKeep.add(script);
        this.log(`    → Keeping core script: ${src}`);
      } else if (src) {
        this.log(`    → Will remove page-specific script: ${src}`);
      }
    });

    // Keep inline styles
    document.querySelectorAll('style').forEach((style) => {
      elementsToKeep.add(style);
    });

    // Parse new body content FIRST (before removing anything)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pageData.body;

    const existingHeader = document.querySelector('header');
    const newElements = Array.from(tempDiv.children);

    // Prepare all new elements and scripts in a document fragment for atomic insertion
    const fragment = document.createDocumentFragment();
    const scriptsToAdd = [];

    this.log(`  Preparing ${newElements.length} new elements from fetched page`);

    newElements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const isInfrastructure = infrastructureSelectors.some((selector) => {
        if (selector.startsWith('.')) {
          return el.classList.contains(selector.substring(1));
        }
        return tagName === selector;
      });

      // Special handling for scripts
      if (tagName === 'script') {
        const src = el.getAttribute('src') || '';
        const isCore = coreScriptPaths.some((corePath) => src.includes(corePath));

        if (!isCore && src) {
          this.log(`    → Preparing page-specific script: ${src}`);

          const newScript = document.createElement('script');
          newScript.type = el.type || 'module';
          newScript.src = el.src;

          Array.from(el.attributes).forEach((attr) => {
            if (attr.name !== 'src' && attr.name !== 'type') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });

          scriptsToAdd.push(newScript);
        }
        return;
      }

      // Skip infrastructure, add content to fragment
      if (!isInfrastructure) {
        fragment.appendChild(el);
        this.log(`    → Prepared <${tagName}> element`);
      } else {
        this.log(`    → Skipped <${tagName}> (infrastructure)`);
      }
    });

    // NOW remove old content and immediately insert new content (atomic swap)
    const bodyChildren = Array.from(document.body.children);
    this.log(
      `  Swapping content: removing ${bodyChildren.length} body children (keeping ${elementsToKeep.size} infrastructure elements)`
    );

    bodyChildren.forEach((child) => {
      if (!elementsToKeep.has(child)) {
        child.remove();
      }
    });

    // Immediately insert all new content after header
    if (existingHeader && existingHeader.nextSibling) {
      document.body.insertBefore(fragment, existingHeader.nextSibling);
    } else if (existingHeader) {
      existingHeader.parentNode.appendChild(fragment);
    } else {
      document.body.appendChild(fragment);
    }

    // Add scripts last
    scriptsToAdd.forEach((script) => {
      document.body.appendChild(script);
    });

    this.log('✓ Body content replaced');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Reinitialize scripts
    const reinitDelay = this.isMobile ? 0 : 10;

    setTimeout(() => {
      this.log('━━━ REINITIALIZING SCRIPTS (OPTIMIZED) ━━━');

      // Load media
      this.log('  → Loading all media (single optimized pass)');
      this.mediaLoader.loadAllMedia(false);

      // Reinitialize scripts
      this.log('  → Reinitializing scripts');
      this.scriptReinit.reinitializeScripts(pageData, this.currentPath);

      // Reinitialize page-specific
      this.pageHandlers.reinitializePage(this.currentPath);

      // Reinitialize translations
      this.log('  → Reinitializing translations for path:', this.currentPath);

      this.scriptReinit.reinitializeTranslations(this.currentPath).then(() => {
        window.dispatchEvent(new Event('pageContentLoaded'));
        this.log('  → Dispatched pageContentLoaded event');
        this.log('━━━ REINITIALIZATION COMPLETE ━━━');
      }).catch((err) => {
        this.log('  ✗ Translation reinit failed:', err);
        window.dispatchEvent(new Event('pageContentLoaded'));
        this.log('━━━ REINITIALIZATION COMPLETE (with errors) ━━━');
      });
    }, reinitDelay);

    // Update active nav link
    this.updateActiveNavLink(url);

    this.log('━━━ updatePageContent COMPLETE ━━━');
  }

  /**
   * Update styles in head
   */
  async updateStyles(styles) {
    if (!styles) return;

    // Remove old page-specific styles
    document.querySelectorAll('style[data-page-style], link[data-page-style]').forEach((el) => {
      el.remove();
    });

    // Add new inline styles
    if (styles.inline && styles.inline.length > 0) {
      styles.inline.forEach((styleContent, index) => {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-page-style', 'true');
        styleEl.textContent = styleContent;
        document.head.appendChild(styleEl);
        this.log(`Added inline style ${index + 1}/${styles.inline.length}`);
      });
    }

    // Add new stylesheet links and WAIT for them to load
    if (styles.links && styles.links.length > 0) {
      const loadPromises = [];

      styles.links.forEach((linkData) => {
        const existingLink = document.querySelector(
          `link[rel="stylesheet"][href="${linkData.href}"]`
        );
        if (!existingLink) {
          const linkEl = document.createElement('link');
          linkEl.rel = 'stylesheet';
          linkEl.href = linkData.href;
          linkEl.media = linkData.media;
          linkEl.setAttribute('data-page-style', 'true');

          // Create a promise that resolves when the stylesheet loads
          const loadPromise = new Promise((resolve, reject) => {
            linkEl.addEventListener('load', () => {
              this.log(`✓ Stylesheet loaded: ${linkData.href}`);

              // FontAwesome reflow handling
              if (linkData.href.includes('font-awesome') || linkData.href.includes('fontawesome')) {
                this.log(`FontAwesome loaded, triggering icon reflow`);
                setTimeout(() => {
                  const icons = document.querySelectorAll('.fa, .fab, .fas, .far, .fal, .fa-brands');
                  icons.forEach((icon) => {
                    icon.style.fontFamily = 'inherit';
                    icon.offsetHeight;
                    icon.style.fontFamily = '';
                    icon.style.display = 'none';
                    icon.offsetHeight;
                    icon.style.display = '';
                  });

                  if (window.FontAwesome && window.FontAwesome.dom) {
                    window.FontAwesome.dom.i2svg();
                  }

                  this.log(`FontAwesome icons refreshed: ${icons.length} icons`);
                }, 100);
              }

              resolve();
            });

            linkEl.addEventListener('error', () => {
              this.log(`⚠ Stylesheet failed to load: ${linkData.href}`);
              resolve(); // Resolve anyway to not block navigation
            });

            // Timeout fallback - don't wait forever
            setTimeout(() => {
              this.log(`⚠ Stylesheet load timeout: ${linkData.href}`);
              resolve();
            }, 3000);
          });

          loadPromises.push(loadPromise);

          document.head.appendChild(linkEl);
          this.log(`Added stylesheet (waiting for load): ${linkData.href}`);
        }
      });

      // Wait for all stylesheets to load
      if (loadPromises.length > 0) {
        this.log(`Waiting for ${loadPromises.length} stylesheet(s) to load...`);
        await Promise.all(loadPromises);
        this.log(`✓ All stylesheets loaded`);
      }
    }
  }

  /**
   * Update meta tags
   */
  updateMetaTags(meta) {
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && meta.description) {
      descMeta.setAttribute('content', meta.description);
    }

    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta && meta.keywords) {
      keywordsMeta.setAttribute('content', meta.keywords);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.ogTitle) {
      ogTitle.setAttribute('content', meta.ogTitle);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && meta.ogDescription) {
      ogDesc.setAttribute('content', meta.ogDescription);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && meta.ogImage) {
      ogImage.setAttribute('content', meta.ogImage);
    }
  }

  /**
   * Update active navigation link
   */
  updateActiveNavLink(url) {
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach((link) => {
      link.classList.remove('active');
    });

    const normalizedUrl = this.normalizeUrl(url);
    document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach((link) => {
      const linkUrl = this.normalizeUrl(link.getAttribute('href'));
      if (linkUrl === normalizedUrl) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator() {
    if (document.getElementById('smooth-nav-loader')) return;

    const loader = document.createElement('div');
    loader.id = 'smooth-nav-loader';
    loader.innerHTML = `<div class="loader-spinner"></div>`;
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
      .loader-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);

    document.body.appendChild(loader);

    requestAnimationFrame(() => {
      loader.style.opacity = '1';
    });
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    const loader = document.getElementById('smooth-nav-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 200);
    }
  }

  /**
   * Handle browser back/forward
   */
  handlePopState = (e) => {
    if (e.state && e.state.path) {
      this.log('Popstate:', e.state.path);
      this.navigateToPage(e.state.path);
    } else {
      this.log('Popstate without state - reloading');
      window.location.reload();
    }
  };

  /**
   * Initialize navigation system
   */
  init() {
    this.log('Smooth Navigation System Initialized');

    // Clear cache
    this.cache.clear();
    this.log('Cache cleared on init');

    // Normalize currentPath
    this.currentPath = this.normalizeUrl(this.currentPath);
    this.log('Current path (normalized):', this.currentPath);

    // Event listeners
    document.addEventListener('click', this.handleLinkClick, true);
    document.addEventListener('mouseover', this.handleLinkHover);
    window.addEventListener('popstate', this.handlePopState);

    // Save current page to history
    history.replaceState({ path: this.currentPath }, '', this.currentPath);

    // Preload critical pages
    if (this.config.cacheCritical) {
      const criticalPages = ['/', '/about.html', '/projects', '/contact.html', '/music.html'];
      setTimeout(() => {
        criticalPages.forEach((page) => {
          const normalized = this.normalizeUrl(page);
          if (normalized !== this.currentPath) {
            this.cache.schedulePreload(normalized, (url) => this.loadPage(url));
          }
        });
      }, 1000);
    }

    this.log('✓ Smooth navigation initialized');
  }
}
