/**
 * Cache Management Module
 * Handles page caching, preloading, and cache eviction
 */

export class CacheManager {
  constructor(config, logger) {
    this.config = config;
    this.log = logger;
    this.pageCache = new Map();
    this.preloadQueue = new Set();
    this.activePreloadTimeouts = new Map();

    // Cache versioning - auto-invalidate when content changes
    this.CACHE_VERSION = '2024-01-19-sound-design'; // Update when HTML structure changes
    this.checkCacheVersion();
  }

  /**
   * Check if cache version matches - clear if outdated
   */
  checkCacheVersion() {
    const storedVersion = localStorage.getItem('ajaxCacheVersion');
    if (storedVersion !== this.CACHE_VERSION) {
      this.log('Cache version mismatch - clearing old cache');
      this.log('  Old version:', storedVersion);
      this.log('  New version:', this.CACHE_VERSION);
      this.clear();
      localStorage.setItem('ajaxCacheVersion', this.CACHE_VERSION);
    } else {
      this.log('Cache version OK:', this.CACHE_VERSION);
    }
  }

  /**
   * Add page to cache with automatic eviction
   */
  addToCache(url, pageData) {
    // Usuń najstarszy wpis jeśli cache pełny
    if (this.pageCache.size >= this.config.cacheSize) {
      const firstKey = this.pageCache.keys().next().value;
      this.pageCache.delete(firstKey);
      this.log('Cache evicted:', firstKey);
    }

    this.pageCache.set(url, pageData);
    this.log('✓ Cached:', url, `(${this.pageCache.size}/${this.config.cacheSize})`, '- Title:', pageData.title);

    // Log all cache keys for debugging
    if (this.config.debug) {
      const allKeys = Array.from(this.pageCache.keys());
      this.log('  Cache keys:', allKeys.join(', '));
    }
  }

  /**
   * Get page from cache
   */
  getFromCache(url) {
    if (this.pageCache.has(url)) {
      this.log('✓ Loading from cache:', url);
      const cached = this.pageCache.get(url);
      this.log('  Cached page title:', cached.title);
      return cached;
    }
    return null;
  }

  /**
   * Check if page is in cache
   */
  has(url) {
    return this.pageCache.has(url);
  }

  /**
   * Preload page into cache
   */
  async preloadPage(url, fetchCallback) {
    if (this.pageCache.has(url)) return;

    try {
      this.log('Preloading:', url);
      const pageData = await fetchCallback(url);
      this.addToCache(url, pageData);
    } catch (error) {
      this.log('Preload failed:', url, error);
    } finally {
      this.preloadQueue.delete(url);
    }
  }

  /**
   * Schedule preload with delay
   */
  schedulePreload(url, fetchCallback) {
    // Nie preloaduj jeśli już jest w cache, w kolejce, lub timeout już działa
    if (
      this.pageCache.has(url) ||
      this.preloadQueue.has(url) ||
      this.activePreloadTimeouts.has(url)
    ) {
      return;
    }

    // Dodaj do queue i ustaw timeout
    this.preloadQueue.add(url);
    const timeoutId = setTimeout(() => {
      this.activePreloadTimeouts.delete(url);
      this.preloadPage(url, fetchCallback);
    }, this.config.preloadDelay);

    // Śledź aktywny timeout
    this.activePreloadTimeouts.set(url, timeoutId);
  }

  /**
   * Clear all cache and pending operations
   */
  clear() {
    // Clear cache
    this.pageCache.clear();
    this.preloadQueue.clear();

    // Cancel all pending preload timeouts
    this.activePreloadTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.activePreloadTimeouts.clear();

    this.log('Cache cleared');
  }

  /**
   * Get cache size
   */
  get size() {
    return this.pageCache.size;
  }

  /**
   * Get all cached URLs
   */
  getCachedUrls() {
    return Array.from(this.pageCache.keys());
  }
}
