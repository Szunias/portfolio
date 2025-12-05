/**
 * Back to Top Button
 * Shows a floating button when user scrolls down
 */

class BackToTop {
  constructor() {
    this.button = null;
    this.scrollThreshold = 500; // Show button after scrolling 500px
    this.isVisible = false;
    this.init();
  }

  init() {
    this.createButton();
    this.bindEvents();
    this.checkScroll();
  }

  createButton() {
    this.button = document.createElement('button');
    this.button.className = 'back-to-top';
    this.button.setAttribute('aria-label', 'Back to top');
    this.button.innerHTML = '↑';
    document.body.appendChild(this.button);
  }

  bindEvents() {
    // Scroll event with throttle
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = window.requestAnimationFrame(() => {
        this.checkScroll();
      });
    }, { passive: true });

    // Click event
    this.button.addEventListener('click', () => {
      this.scrollToTop();
    });

    // Keyboard support
    this.button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.scrollToTop();
      }
    });
  }

  checkScroll() {
    const scrolled = window.pageYOffset || document.documentElement.scrollTop;

    if (scrolled > this.scrollThreshold && !this.isVisible) {
      this.show();
    } else if (scrolled <= this.scrollThreshold && this.isVisible) {
      this.hide();
    }
  }

  show() {
    this.isVisible = true;
    this.button.classList.add('visible');
  }

  hide() {
    this.isVisible = false;
    this.button.classList.remove('visible');
  }

  scrollToTop() {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new BackToTop();
  });
} else {
  new BackToTop();
}

export default BackToTop;
