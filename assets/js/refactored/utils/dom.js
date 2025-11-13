/**
 * DOM Utility Functions
 * Helpers for DOM manipulation, element selection, and event handling
 *
 * @module utils/dom
 * @example
 * import { $, $$, on, createElement } from './utils/dom.js';
 */

/**
 * Select a single element (querySelector wrapper)
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} Selected element or null
 * @example
 * const header = $('.header');
 * const button = $('.btn', header);
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Select multiple elements (querySelectorAll wrapper)
 * Returns array instead of NodeList for easier manipulation
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Array<Element>} Array of selected elements
 * @example
 * const buttons = $$('.btn');
 * buttons.forEach(btn => btn.classList.add('active'));
 */
export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/**
 * Create an element with properties and children
 * @param {string} tag - HTML tag name
 * @param {Object} props - Element properties and attributes
 * @param {Array<Element|string>} children - Child elements or text
 * @returns {Element} Created element
 * @example
 * const div = createElement('div', {
 *   className: 'card',
 *   id: 'card-1',
 *   'data-type': 'featured'
 * }, [
 *   createElement('h2', {}, ['Title']),
 *   createElement('p', {}, ['Description'])
 * ]);
 */
export function createElement(tag, props = {}, children = []) {
  const element = document.createElement(tag);

  // Set properties and attributes
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (key in element) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Add event listener with optional delegation
 * @param {Element|string} target - Element or selector
 * @param {string} event - Event name
 * @param {string|Function} selectorOrHandler - Delegated selector or handler
 * @param {Function} handler - Event handler (if using delegation)
 * @returns {Function} Cleanup function to remove listener
 * @example
 * // Direct binding
 * on(button, 'click', () => console.log('clicked'));
 *
 * // Event delegation
 * on(document, 'click', '.btn', (e) => {
 *   console.log('Button clicked:', e.target);
 * });
 */
export function on(target, event, selectorOrHandler, handler) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return () => {};

  // Delegation mode
  if (typeof selectorOrHandler === 'string' && typeof handler === 'function') {
    const delegatedHandler = (e) => {
      const matchedElement = e.target.closest(selectorOrHandler);
      if (matchedElement && element.contains(matchedElement)) {
        handler.call(matchedElement, e);
      }
    };

    element.addEventListener(event, delegatedHandler);
    return () => element.removeEventListener(event, delegatedHandler);
  }

  // Direct mode
  const directHandler = selectorOrHandler;
  element.addEventListener(event, directHandler);
  return () => element.removeEventListener(event, directHandler);
}

/**
 * Remove event listener
 * @param {Element|string} target - Element or selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @example
 * off(button, 'click', handleClick);
 */
export function off(target, event, handler) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;
  element.removeEventListener(event, handler);
}

/**
 * Add class to element(s)
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @param {string|Array<string>} classes - Class name(s) to add
 * @example
 * addClass('.card', 'active');
 * addClass(element, ['highlight', 'featured']);
 */
export function addClass(target, classes) {
  const elements = _getElements(target);
  const classArray = Array.isArray(classes) ? classes : [classes];

  elements.forEach(el => {
    el.classList.add(...classArray);
  });
}

/**
 * Remove class from element(s)
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @param {string|Array<string>} classes - Class name(s) to remove
 * @example
 * removeClass('.card', 'active');
 * removeClass(elements, ['highlight', 'featured']);
 */
export function removeClass(target, classes) {
  const elements = _getElements(target);
  const classArray = Array.isArray(classes) ? classes : [classes];

  elements.forEach(el => {
    el.classList.remove(...classArray);
  });
}

/**
 * Toggle class on element(s)
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @param {string} className - Class name to toggle
 * @param {boolean} force - Force add (true) or remove (false)
 * @returns {boolean} Whether class is present after toggle
 * @example
 * toggleClass('.menu', 'open');
 * toggleClass(button, 'active', true); // Force add
 */
export function toggleClass(target, className, force) {
  const elements = _getElements(target);
  let result = false;

  elements.forEach(el => {
    result = el.classList.toggle(className, force);
  });

  return result;
}

/**
 * Check if element has class
 * @param {Element|string} target - Element or selector
 * @param {string} className - Class name to check
 * @returns {boolean} Whether element has the class
 * @example
 * if (hasClass('.menu', 'open')) { }
 */
export function hasClass(target, className) {
  const element = typeof target === 'string' ? $(target) : target;
  return element ? element.classList.contains(className) : false;
}

/**
 * Show element(s) by removing display: none
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @param {string} display - Display value (default: 'block')
 * @example
 * show('.modal');
 * show(elements, 'flex');
 */
export function show(target, display = 'block') {
  const elements = _getElements(target);

  elements.forEach(el => {
    el.style.display = display;
  });
}

/**
 * Hide element(s) by setting display: none
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @example
 * hide('.modal');
 */
export function hide(target) {
  const elements = _getElements(target);

  elements.forEach(el => {
    el.style.display = 'none';
  });
}

/**
 * Toggle element visibility
 * @param {Element|string} target - Element or selector
 * @param {string} display - Display value when showing (default: 'block')
 * @returns {boolean} Whether element is visible after toggle
 * @example
 * toggle('.modal');
 */
export function toggle(target, display = 'block') {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return false;

  const isHidden = element.style.display === 'none' ||
                   getComputedStyle(element).display === 'none';

  if (isHidden) {
    element.style.display = display;
    return true;
  } else {
    element.style.display = 'none';
    return false;
  }
}

/**
 * Get or set attribute
 * @param {Element|string} target - Element or selector
 * @param {string|Object} name - Attribute name or object of attributes
 * @param {*} value - Attribute value (if name is string)
 * @returns {string|null} Attribute value (if getting)
 * @example
 * attr(img, 'src', 'image.jpg'); // Set
 * const src = attr(img, 'src'); // Get
 * attr(element, { 'data-id': '123', 'aria-label': 'Close' }); // Set multiple
 */
export function attr(target, name, value) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return null;

  // Set multiple attributes
  if (typeof name === 'object') {
    Object.entries(name).forEach(([key, val]) => {
      element.setAttribute(key, val);
    });
    return null;
  }

  // Get attribute
  if (value === undefined) {
    return element.getAttribute(name);
  }

  // Set single attribute
  element.setAttribute(name, value);
  return null;
}

/**
 * Remove attribute
 * @param {Element|string} target - Element or selector
 * @param {string} name - Attribute name
 * @example
 * removeAttr(button, 'disabled');
 */
export function removeAttr(target, name) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;
  element.removeAttribute(name);
}

/**
 * Get or set data attribute
 * @param {Element|string} target - Element or selector
 * @param {string|Object} key - Data key or object of data attributes
 * @param {*} value - Data value (if key is string)
 * @returns {string|null} Data value (if getting)
 * @example
 * data(element, 'user-id', '123'); // Set
 * const id = data(element, 'user-id'); // Get
 */
export function data(target, key, value) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return null;

  // Set multiple data attributes
  if (typeof key === 'object') {
    Object.entries(key).forEach(([k, v]) => {
      element.dataset[k] = v;
    });
    return null;
  }

  // Get data
  if (value === undefined) {
    return element.dataset[key];
  }

  // Set single data attribute
  element.dataset[key] = value;
  return null;
}

/**
 * Get closest ancestor matching selector
 * @param {Element|string} target - Element or selector
 * @param {string} selector - Selector to match
 * @returns {Element|null} Matched ancestor or null
 * @example
 * const card = closest(button, '.card');
 */
export function closest(target, selector) {
  const element = typeof target === 'string' ? $(target) : target;
  return element ? element.closest(selector) : null;
}

/**
 * Get all parent elements up to root
 * @param {Element|string} target - Element or selector
 * @param {string} selector - Optional selector to filter parents
 * @returns {Array<Element>} Array of parent elements
 * @example
 * const parents = getParents(element);
 * const cardParents = getParents(element, '.card');
 */
export function getParents(target, selector) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return [];

  const parents = [];
  let currentElement = element.parentElement;

  while (currentElement) {
    if (!selector || currentElement.matches(selector)) {
      parents.push(currentElement);
    }
    currentElement = currentElement.parentElement;
  }

  return parents;
}

/**
 * Get siblings of element
 * @param {Element|string} target - Element or selector
 * @param {string} selector - Optional selector to filter siblings
 * @returns {Array<Element>} Array of sibling elements
 * @example
 * const siblings = getSiblings(element);
 * const buttonSiblings = getSiblings(element, '.btn');
 */
export function getSiblings(target, selector) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element || !element.parentElement) return [];

  const siblings = Array.from(element.parentElement.children)
    .filter(child => child !== element);

  return selector ? siblings.filter(sibling => sibling.matches(selector)) : siblings;
}

/**
 * Insert HTML at position
 * @param {Element|string} target - Element or selector
 * @param {string} position - Position (beforebegin, afterbegin, beforeend, afterend)
 * @param {string} html - HTML string to insert
 * @example
 * insertHTML(element, 'beforeend', '<p>New paragraph</p>');
 */
export function insertHTML(target, position, html) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;
  element.insertAdjacentHTML(position, html);
}

/**
 * Empty element (remove all children)
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @example
 * empty('.container');
 */
export function empty(target) {
  const elements = _getElements(target);

  elements.forEach(el => {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  });
}

/**
 * Remove element from DOM
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @example
 * remove('.temporary-element');
 */
export function remove(target) {
  const elements = _getElements(target);

  elements.forEach(el => {
    el.remove();
  });
}

/**
 * Check if element is visible
 * @param {Element|string} target - Element or selector
 * @returns {boolean} Whether element is visible
 * @example
 * if (isVisible('.modal')) { }
 */
export function isVisible(target) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return false;

  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  );
}

/**
 * Get element offset relative to document
 * @param {Element|string} target - Element or selector
 * @returns {{top: number, left: number}} Offset coordinates
 * @example
 * const { top, left } = offset(element);
 */
export function offset(target) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return { top: 0, left: 0 };

  const rect = element.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft
  };
}

/**
 * Get element position relative to parent
 * @param {Element|string} target - Element or selector
 * @returns {{top: number, left: number}} Position coordinates
 * @example
 * const { top, left } = position(element);
 */
export function position(target) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return { top: 0, left: 0 };

  return {
    top: element.offsetTop,
    left: element.offsetLeft
  };
}

/**
 * Fade in element with animation
 * @param {Element|string} target - Element or selector
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 * @example
 * await fadeIn('.modal', 300);
 */
export function fadeIn(target, duration = 300) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';

      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    });
  });
}

/**
 * Fade out element with animation
 * @param {Element|string} target - Element or selector
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 * @example
 * await fadeOut('.modal', 300);
 */
export function fadeOut(target, duration = 300) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.opacity = '0';

      setTimeout(() => {
        element.style.display = 'none';
        element.style.transition = '';
        resolve();
      }, duration);
    });
  });
}

/**
 * Slide down element with animation
 * @param {Element|string} target - Element or selector
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 * @example
 * await slideDown('.dropdown', 300);
 */
export function slideDown(target, duration = 300) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    element.style.removeProperty('display');
    let display = getComputedStyle(element).display;
    if (display === 'none') display = 'block';
    element.style.display = display;

    const height = element.scrollHeight;
    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.transition = `height ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.height = `${height}px`;

      setTimeout(() => {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition');
        resolve();
      }, duration);
    });
  });
}

/**
 * Slide up element with animation
 * @param {Element|string} target - Element or selector
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} Resolves when animation completes
 * @example
 * await slideUp('.dropdown', 300);
 */
export function slideUp(target, duration = 300) {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return Promise.resolve();

  return new Promise((resolve) => {
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.height = '0';

      setTimeout(() => {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition');
        resolve();
      }, duration);
    });
  });
}

/**
 * Wait for DOM to be ready
 * @param {Function} callback - Function to call when ready
 * @example
 * ready(() => {
 *   console.log('DOM is ready!');
 * });
 */
export function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// ============================================
// Private Helper Functions
// ============================================

/**
 * Get elements array from various target types
 * @private
 * @param {Element|string|Array<Element>} target - Element(s) or selector
 * @returns {Array<Element>} Array of elements
 */
function _getElements(target) {
  if (Array.isArray(target)) {
    return target;
  }

  if (typeof target === 'string') {
    return $$(target);
  }

  if (target instanceof Element) {
    return [target];
  }

  return [];
}

// Export all functions as default object for convenience
export default {
  $,
  $$,
  createElement,
  on,
  off,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  show,
  hide,
  toggle,
  attr,
  removeAttr,
  data,
  closest,
  getParents,
  getSiblings,
  insertHTML,
  empty,
  remove,
  isVisible,
  offset,
  position,
  fadeIn,
  fadeOut,
  slideDown,
  slideUp,
  ready
};
