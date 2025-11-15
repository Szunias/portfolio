/**
 * Cleanup System Module
 * Prevents memory leaks by tracking and cleaning up observers and listeners
 */

export class CleanupManager {
  constructor(logger) {
    this.log = logger;
    this.activeObservers = new Set();
    this.scrollAnimationObserver = null;
  }

  /**
   * Track an IntersectionObserver for cleanup
   */
  trackObserver(observer) {
    this.activeObservers.add(observer);
    return observer;
  }

  /**
   * Untrack an observer (when manually cleaned up)
   */
  untrackObserver(observer) {
    this.activeObservers.delete(observer);
  }

  /**
   * Set scroll animation observer (special case - singleton)
   */
  setScrollAnimationObserver(observer) {
    // Disconnect poprzedni observer
    if (this.scrollAnimationObserver) {
      this.scrollAnimationObserver.disconnect();
      this.activeObservers.delete(this.scrollAnimationObserver);
    }
    this.scrollAnimationObserver = observer;
    this.activeObservers.add(observer);
  }

  /**
   * Main cleanup function - called before each navigation
   */
  cleanupAll() {
    this.log('🧹 Cleaning up observers and listeners to prevent memory leaks');

    // 1. Disconnect all tracked IntersectionObservers
    let disconnectedCount = 0;
    this.activeObservers.forEach((observer) => {
      try {
        observer.disconnect();
        disconnectedCount++;
      } catch (error) {
        this.log('  ⚠️ Error disconnecting observer:', error);
      }
    });
    this.activeObservers.clear();
    this.log(`  ✓ Disconnected ${disconnectedCount} observers`);

    // 2. Cleanup about page specific resources (rAF, particles)
    if (typeof window.__cleanupAboutPage === 'function') {
      this.log('  🧹 Running about page cleanup (rAF, particles)');
      window.__cleanupAboutPage();
    }

    // 3. Cleanup contact page specific resources (observers)
    if (typeof window.__cleanupContactPage === 'function') {
      this.log('  🧹 Running contact page cleanup (observers)');
      window.__cleanupContactPage();
    }

    // 4. Cleanup music page specific resources (observers, audio, player)
    if (typeof window.__cleanupMusicPage === 'function') {
      this.log('  🧹 Running music page cleanup (observers, audio, player)');
      window.__cleanupMusicPage();
    }

    // Reset scroll animation observer reference
    this.scrollAnimationObserver = null;
  }

  /**
   * Get count of tracked observers
   */
  get observerCount() {
    return this.activeObservers.size;
  }
}
