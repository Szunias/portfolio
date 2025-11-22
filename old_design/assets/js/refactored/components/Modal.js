/**
 * Modal Component
 * Accessible modal dialog with backdrop
 *
 * @class Modal
 * @example
 * const modal = new Modal({
 *   title: 'Confirm Action',
 *   content: 'Are you sure?',
 *   onConfirm: () => console.log('Confirmed')
 * });
 * modal.open();
 */

import { EventEmitter } from '../core/EventEmitter.js';
import { CSS_CLASSES, KEYS } from '../core/config.js';

export class Modal extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.title - Modal title
   * @param {string|HTMLElement} options.content - Modal content
   * @param {string} options.size - Modal size (sm, md, lg, xl, full)
   * @param {boolean} options.closeOnOverlay - Close on overlay click
   * @param {boolean} options.closeOnEscape - Close on Escape key
   * @param {Function} options.onOpen - Open callback
   * @param {Function} options.onClose - Close callback
   * @param {Function} options.onConfirm - Confirm callback
   * @param {Function} options.onCancel - Cancel callback
   */
  constructor(options = {}) {
    super();

    this.options = {
      title: '',
      content: '',
      size: 'md',
      closeOnOverlay: true,
      closeOnEscape: true,
      showCloseButton: true,
      showFooter: false,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onOpen: null,
      onClose: null,
      onConfirm: null,
      onCancel: null,
      ...options
    };

    this.state = {
      isOpen: false,
      previousFocus: null
    };

    this.elements = {
      overlay: null,
      modal: null,
      closeButton: null,
      confirmButton: null,
      cancelButton: null
    };

    this._render();
  }

  /**
   * Render modal HTML
   * @private
   */
  _render() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');

    overlay.innerHTML = `
      <div class="modal modal--${this.options.size}">
        <div class="modal__header">
          <h2 class="modal__title" id="modal-title">${this.options.title}</h2>
          ${this.options.showCloseButton ? `
            <button class="modal__close" aria-label="Close modal">
              <svg class="modal__close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M18 6l-12 12" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          ` : ''}
        </div>
        <div class="modal__body">
          ${typeof this.options.content === 'string' ? this.options.content : ''}
        </div>
        ${this.options.showFooter ? `
          <div class="modal__footer">
            <button class="btn btn--ghost modal__cancel">${this.options.cancelText}</button>
            <button class="btn btn--primary modal__confirm">${this.options.confirmText}</button>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    this.elements.overlay = overlay;
    this.elements.modal = overlay.querySelector('.modal');
    this.elements.closeButton = overlay.querySelector('.modal__close');
    this.elements.confirmButton = overlay.querySelector('.modal__confirm');
    this.elements.cancelButton = overlay.querySelector('.modal__cancel');

    // If content is HTMLElement, append it
    if (this.options.content instanceof HTMLElement) {
      const body = overlay.querySelector('.modal__body');
      body.innerHTML = '';
      body.appendChild(this.options.content);
    }

    this._attachEventListeners();
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachEventListeners() {
    // Close button
    if (this.elements.closeButton) {
      this.elements.closeButton.addEventListener('click', () => this.close());
    }

    // Overlay click
    if (this.options.closeOnOverlay) {
      this.elements.overlay.addEventListener('click', (e) => {
        if (e.target === this.elements.overlay) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.options.closeOnEscape) {
      this._escapeHandler = (e) => {
        if (e.key === KEYS.ESCAPE && this.state.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this._escapeHandler);
    }

    // Footer buttons
    if (this.elements.confirmButton) {
      this.elements.confirmButton.addEventListener('click', () => {
        this._handleConfirm();
      });
    }

    if (this.elements.cancelButton) {
      this.elements.cancelButton.addEventListener('click', () => {
        this._handleCancel();
      });
    }
  }

  /**
   * Open the modal
   * @public
   */
  open() {
    if (this.state.isOpen) return;

    this.state.isOpen = true;
    this.state.previousFocus = document.activeElement;

    // Show modal
    this.elements.overlay.classList.add(CSS_CLASSES.MODAL_OPEN);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    setTimeout(() => {
      const firstFocusable = this.elements.modal.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }, 100);

    // Emit events
    this.emit('open');
    if (typeof this.options.onOpen === 'function') {
      this.options.onOpen();
    }
  }

  /**
   * Close the modal
   * @public
   */
  close() {
    if (!this.state.isOpen) return;

    this.state.isOpen = false;

    // Hide modal
    this.elements.overlay.classList.remove(CSS_CLASSES.MODAL_OPEN);

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus
    if (this.state.previousFocus) {
      this.state.previousFocus.focus();
      this.state.previousFocus = null;
    }

    // Emit events
    this.emit('close');
    if (typeof this.options.onClose === 'function') {
      this.options.onClose();
    }
  }

  /**
   * Handle confirm action
   * @private
   */
  _handleConfirm() {
    this.emit('confirm');

    if (typeof this.options.onConfirm === 'function') {
      this.options.onConfirm();
    }

    this.close();
  }

  /**
   * Handle cancel action
   * @private
   */
  _handleCancel() {
    this.emit('cancel');

    if (typeof this.options.onCancel === 'function') {
      this.options.onCancel();
    }

    this.close();
  }

  /**
   * Update modal content
   * @public
   * @param {string|HTMLElement} content - New content
   */
  setContent(content) {
    const body = this.elements.modal.querySelector('.modal__body');

    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.innerHTML = '';
      body.appendChild(content);
    }
  }

  /**
   * Update modal title
   * @public
   * @param {string} title - New title
   */
  setTitle(title) {
    const titleElement = this.elements.modal.querySelector('.modal__title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * Destroy the modal
   * @public
   */
  destroy() {
    this.close();

    // Remove event listeners
    if (this._escapeHandler) {
      document.removeEventListener('keydown', this._escapeHandler);
    }

    // Remove from DOM
    this.elements.overlay?.remove();

    // Clear references
    this.elements = {};

    this.emit('destroyed');
    this.removeAllListeners();
  }
}

/**
 * Static helper methods
 */

/**
 * Create and open a confirm dialog
 * @static
 * @param {string} message - Confirmation message
 * @param {Object} options - Additional options
 * @returns {Promise<boolean>} Resolves to true if confirmed
 */
Modal.confirm = (message, options = {}) => {
  return new Promise((resolve) => {
    const modal = new Modal({
      title: options.title || 'Confirm',
      content: message,
      showFooter: true,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
      onClose: () => resolve(false),
      ...options
    });

    modal.open();
  });
};

/**
 * Create and open an alert dialog
 * @static
 * @param {string} message - Alert message
 * @param {Object} options - Additional options
 * @returns {Promise<void>} Resolves when closed
 */
Modal.alert = (message, options = {}) => {
  return new Promise((resolve) => {
    const modal = new Modal({
      title: options.title || 'Alert',
      content: message,
      showFooter: true,
      confirmText: options.confirmText || 'OK',
      onConfirm: () => resolve(),
      onClose: () => resolve(),
      ...options
    });

    modal.open();
  });
};

export default Modal;
