/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by escaping user-controllable content
 */

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for HTML
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create element with text content (safe alternative to innerHTML)
 * @param {string} tag - HTML tag name
 * @param {string} text - Text content
 * @param {string} [className] - Optional CSS class
 * @returns {HTMLElement}
 */
export function createTextElement(tag, text, className = '') {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

/**
 * Safely set HTML from trusted source only
 * Use this ONLY for hardcoded templates, never user input
 * @param {HTMLElement} element
 * @param {string} html - Trusted HTML string
 */
export function setTrustedHtml(element, html) {
  // This function makes it explicit that HTML is from trusted source
  // Still validates element exists
  if (element instanceof HTMLElement) {
    element.innerHTML = html;
  }
}

/**
 * Build DOM tree safely without innerHTML
 * @param {HTMLElement} parent - Parent element
 * @param {Array} children - Array of {tag, text, className, children} objects
 */
export function buildDom(parent, children) {
  children.forEach(child => {
    const el = document.createElement(child.tag);

    if (child.text) {
      el.textContent = child.text;
    }

    if (child.className) {
      el.className = child.className;
    }

    if (child.attributes) {
      Object.entries(child.attributes).forEach(([key, value]) => {
        el.setAttribute(key, value);
      });
    }

    if (child.children) {
      buildDom(el, child.children);
    }

    parent.appendChild(el);
  });
}

export default {
  escapeHtml,
  createTextElement,
  setTrustedHtml,
  buildDom
};
