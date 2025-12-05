/**
 * Toast Notification Component
 * Displays temporary notifications to the user
 *
 * @class Toast
 * @example
 * Toast.success('Operation completed!');
 * Toast.error('Something went wrong', { duration: 5000 });
 */

import { EventEmitter } from '../core/EventEmitter.js';

export class Toast extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.type - Toast type (success, error, warning, info)
   * @param {string} options.title - Toast title
   * @param {string} options.message - Toast message
   * @param {number} options.duration - Duration in ms (0 = permanent)
   * @param {string} options.position - Position (top-right, top-left, bottom-right, etc.)
   * @param {boolean} options.closable - Show close button
   * @param {boolean} options.showProgress - Show progress bar
   */
  constructor(options = {}) {
    super();

    this.options = {
      type: 'info',
      title: '',
      message: '',
      duration: 4000,
      position: 'top-right',
      closable: true,
      showProgress: true,
      ...options
    };

    this.state = {
      isVisible: false,
      timeoutId: null,
      progressAnimationId: null
    };

    this.elements = {
      container: null,
      toast: null,
      progressBar: null
    };

    this._render();
  }

  /**
   * Render toast HTML
   * @private
   */
  _render() {
    // Ensure toast container exists
    this._ensureContainer();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast--${this.options.type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
      <div class="toast__icon">
        ${this._getIcon()}
      </div>
      <div class="toast__content">
        ${this.options.title ? `<div class="toast__title">${this.options.title}</div>` : ''}
        <div class="toast__message">${this.options.message}</div>
      </div>
      ${this.options.closable ? `
        <button class="toast__close" aria-label="Close notification">
          <svg class="toast__close-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      ` : ''}
      ${this.options.showProgress && this.options.duration > 0 ? `
        <div class="toast__progress">
          <div class="toast__progress-bar"></div>
        </div>
      ` : ''}
    `;

    this.elements.toast = toast;
    this.elements.progressBar = toast.querySelector('.toast__progress-bar');

    // Attach event listeners
    const closeButton = toast.querySelector('.toast__close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

    // Add to container
    this.elements.container.appendChild(toast);
  }

  /**
   * Ensure toast container exists
   * @private
   */
  _ensureContainer() {
    const containerId = `toast-container-${this.options.position}`;
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = `toast-container toast-container--${this.options.position}`;
      document.body.appendChild(container);
    }

    this.elements.container = container;
  }

  /**
   * Get icon SVG for toast type
   * @private
   * @returns {string} SVG markup
   */
  _getIcon() {
    const icons = {
      success: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
          <path d="M5 13l4 4L19 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      error: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      warning: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
          <path d="M12 2L2 20h20L12 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 9v4M12 17h.01" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `,
      info: `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <path d="M12 16v-4M12 8h.01" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
    };

    return icons[this.options.type] || icons.info;
  }

  /**
   * Show the toast
   * @public
   */
  show() {
    if (this.state.isVisible) return;

    this.state.isVisible = true;

    // Trigger reflow for animation
    this.elements.toast.offsetHeight;

    // Add visible class
    requestAnimationFrame(() => {
      this.elements.toast.style.opacity = '1';
      this.elements.toast.style.transform = 'translateY(0)';
    });

    // Start progress bar animation
    if (this.elements.progressBar && this.options.duration > 0) {
      this.elements.progressBar.style.animationDuration = `${this.options.duration}ms`;
    }

    // Auto-close after duration
    if (this.options.duration > 0) {
      this.state.timeoutId = setTimeout(() => {
        this.close();
      }, this.options.duration);
    }

    this.emit('show');
  }

  /**
   * Close the toast
   * @public
   */
  close() {
    if (!this.state.isVisible) return;

    this.state.isVisible = false;

    // Clear timeout
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
      this.state.timeoutId = null;
    }

    // Add removing class for animation
    this.elements.toast.classList.add('toast--removing');

    // Remove after animation
    setTimeout(() => {
      this.destroy();
    }, 300);

    this.emit('close');
  }

  /**
   * Destroy the toast
   * @public
   */
  destroy() {
    // Remove from DOM
    this.elements.toast?.remove();

    // Remove empty containers
    if (this.elements.container && this.elements.container.children.length === 0) {
      this.elements.container.remove();
    }

    // Clear references
    this.elements = {};

    this.emit('destroyed');
    this.removeAllListeners();
  }
}

/**
 * Static Toast Manager
 * Manages multiple toast instances
 */
class ToastManager {
  constructor() {
    this.toasts = [];
    this.maxToasts = 5;
  }

  /**
   * Create and show a toast
   * @private
   * @param {Object} options - Toast options
   * @returns {Toast} Toast instance
   */
  _create(options) {
    // Remove oldest toast if max reached
    if (this.toasts.length >= this.maxToasts) {
      const oldest = this.toasts.shift();
      oldest.close();
    }

    const toast = new Toast(options);

    // Track toast
    this.toasts.push(toast);

    // Remove from tracking when destroyed
    toast.on('destroyed', () => {
      const index = this.toasts.indexOf(toast);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    });

    toast.show();

    return toast;
  }

  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  success(message, options = {}) {
    return this._create({
      type: 'success',
      message,
      ...options
    });
  }

  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  error(message, options = {}) {
    return this._create({
      type: 'error',
      message,
      duration: 6000, // Errors stay longer
      ...options
    });
  }

  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  warning(message, options = {}) {
    return this._create({
      type: 'warning',
      message,
      duration: 5000,
      ...options
    });
  }

  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {Object} options - Additional options
   * @returns {Toast} Toast instance
   */
  info(message, options = {}) {
    return this._create({
      type: 'info',
      message,
      ...options
    });
  }

  /**
   * Close all toasts
   */
  closeAll() {
    this.toasts.forEach(toast => toast.close());
    this.toasts = [];
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export the manager as default
export default toastManager;

// Also export static methods for convenience
export const toast = {
  success: (message, options) => toastManager.success(message, options),
  error: (message, options) => toastManager.error(message, options),
  warning: (message, options) => toastManager.warning(message, options),
  info: (message, options) => toastManager.info(message, options),
  closeAll: () => toastManager.closeAll()
};
