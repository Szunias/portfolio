/**
 * Helper Utility Functions
 * Debounce, throttle, validators, formatters, and other useful utilities
 *
 * @module utils/helpers
 * @example
 * import { debounce, throttle, formatDate } from './utils/helpers.js';
 */

// ============================================
// Function Utilities
// ============================================

/**
 * Debounce function - delays execution until after wait time has elapsed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on leading edge
 * @returns {Function} Debounced function
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function - ensures function is called at most once per time period
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, limit = 100) {
  let inThrottle;

  return function executedFunction(...args) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function - caches function results
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 * @example
 * const expensiveCalc = memoize((n) => {
 *   return n * n;
 * });
 */
export function memoize(func) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func.apply(this, args);
    cache.set(key, result);

    return result;
  };
}

/**
 * Once function - ensures function is called only once
 * @param {Function} func - Function to execute once
 * @returns {Function} Function that executes only once
 * @example
 * const initialize = once(() => {
 *   console.log('Initialized!');
 * });
 */
export function once(func) {
  let called = false;
  let result;

  return function executedOnce(...args) {
    if (!called) {
      result = func.apply(this, args);
      called = true;
    }
    return result;
  };
}

/**
 * Delay execution by specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 * @example
 * await delay(1000);
 * console.log('Executed after 1 second');
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Validation Functions
// ============================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 * @example
 * if (isValidEmail('user@example.com')) { }
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 * @example
 * if (isValidURL('https://example.com')) { }
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether phone is valid
 * @example
 * if (isValidPhone('+1-234-567-8900')) { }
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, strength: string, errors: Array}} Validation result
 * @example
 * const result = validatePassword('MyPass123!', {
 *   minLength: 8,
 *   requireUppercase: true,
 *   requireNumber: true,
 *   requireSpecial: true
 * });
 */
export function validatePassword(password, options = {}) {
  const defaults = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false
  };

  const opts = { ...defaults, ...options };
  const errors = [];
  let strength = 'weak';

  if (password.length < opts.minLength) {
    errors.push(`Password must be at least ${opts.minLength} characters`);
  }

  if (opts.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }

  if (opts.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }

  if (opts.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain a number');
  }

  if (opts.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  // Calculate strength
  if (errors.length === 0) {
    const hasAll = /[A-Z]/.test(password) &&
                   /[a-z]/.test(password) &&
                   /\d/.test(password) &&
                   /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length >= 12 && hasAll) {
      strength = 'strong';
    } else if (password.length >= 10) {
      strength = 'medium';
    }
  }

  return {
    valid: errors.length === 0,
    strength,
    errors
  };
}

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} Whether value is empty
 * @example
 * if (isEmpty('')) { } // true
 * if (isEmpty([])) { } // true
 * if (isEmpty(null)) { } // true
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ============================================
// String Utilities
// ============================================

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 * @example
 * capitalize('hello') // 'Hello'
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 * @example
 * titleCase('hello world') // 'Hello World'
 */
export function titleCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => capitalize(word)).join(' ');
}

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} camelCase string
 * @example
 * camelCase('hello-world') // 'helloWorld'
 * camelCase('hello_world') // 'helloWorld'
 */
export function camelCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * Convert string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} kebab-case string
 * @example
 * kebabCase('helloWorld') // 'hello-world'
 * kebabCase('Hello World') // 'hello-world'
 */
export function kebabCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} snake_case string
 * @example
 * snakeCase('helloWorld') // 'hello_world'
 * snakeCase('Hello World') // 'hello_world'
 */
export function snakeCase(str) {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @param {string} ending - Ending string (default: '...')
 * @returns {string} Truncated string
 * @example
 * truncate('Hello World', 8) // 'Hello...'
 */
export function truncate(str, length = 50, ending = '...') {
  if (!str || str.length <= length) return str;
  return str.substring(0, length - ending.length) + ending;
}

/**
 * Generate random string
 * @param {number} length - String length
 * @param {string} chars - Characters to use
 * @returns {string} Random string
 * @example
 * randomString(8) // 'a3bK9mPq'
 */
export function randomString(length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Slugify string for URLs
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 * @example
 * slugify('Hello World!') // 'hello-world'
 */
export function slugify(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ============================================
// Number Utilities
// ============================================

/**
 * Clamp number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 * @example
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} float - Return float instead of integer
 * @returns {number} Random number
 * @example
 * random(1, 10) // 7
 * random(1, 10, true) // 7.234
 */
export function random(min, max, float = false) {
  const value = Math.random() * (max - min) + min;
  return float ? value : Math.floor(value);
}

/**
 * Round number to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 * @example
 * round(3.14159, 2) // 3.14
 */
export function round(value, decimals = 0) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @param {string} separator - Separator character (default: ',')
 * @returns {string} Formatted number
 * @example
 * formatNumber(1234567) // '1,234,567'
 */
export function formatNumber(num, separator = ',') {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Format bytes to human readable size
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted size
 * @example
 * formatBytes(1024) // '1 KB'
 * formatBytes(1234567) // '1.18 MB'
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 * @example
 * percentage(25, 100) // 25
 * percentage(1, 3, 2) // 33.33
 */
export function percentage(value, total, decimals = 0) {
  if (total === 0) return 0;
  return round((value / total) * 100, decimals);
}

// ============================================
// Date/Time Utilities
// ============================================

/**
 * Format date to string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // '2025-11-13'
 * formatDate(new Date(), 'DD/MM/YYYY HH:mm') // '13/11/2025 14:30'
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const tokens = {
    YYYY: d.getFullYear(),
    YY: String(d.getFullYear()).slice(-2),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    M: d.getMonth() + 1,
    DD: String(d.getDate()).padStart(2, '0'),
    D: d.getDate(),
    HH: String(d.getHours()).padStart(2, '0'),
    H: d.getHours(),
    mm: String(d.getMinutes()).padStart(2, '0'),
    m: d.getMinutes(),
    ss: String(d.getSeconds()).padStart(2, '0'),
    s: d.getSeconds()
  };

  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, match => tokens[match]);
}

/**
 * Get relative time string (e.g., '2 hours ago')
 * @param {Date|string|number} date - Date to compare
 * @returns {string} Relative time string
 * @example
 * timeAgo(new Date(Date.now() - 3600000)) // '1 hour ago'
 */
export function timeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return interval === 1 ? `1 ${name} ago` : `${interval} ${name}s ago`;
    }
  }

  return 'just now';
}

/**
 * Parse time string to seconds
 * @param {string} time - Time string (e.g., '1:30', '2:45:30')
 * @returns {number} Seconds
 * @example
 * parseTime('1:30') // 90
 * parseTime('1:30:15') // 5415
 */
export function parseTime(time) {
  const parts = time.split(':').map(Number).reverse();
  let seconds = 0;

  if (parts[0]) seconds += parts[0];
  if (parts[1]) seconds += parts[1] * 60;
  if (parts[2]) seconds += parts[2] * 3600;

  return seconds;
}

/**
 * Format seconds to time string
 * @param {number} seconds - Seconds to format
 * @param {boolean} includeHours - Include hours even if 0
 * @returns {string} Time string
 * @example
 * formatTime(90) // '1:30'
 * formatTime(3665) // '1:01:05'
 */
export function formatTime(seconds, includeHours = false) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0 || includeHours) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return `${m}:${String(s).padStart(2, '0')}`;
}

// ============================================
// Array Utilities
// ============================================

/**
 * Shuffle array
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 * @example
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4]
 */
export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get unique values from array
 * @param {Array} array - Array to filter
 * @returns {Array} Array with unique values
 * @example
 * unique([1, 2, 2, 3, 3, 3]) // [1, 2, 3]
 */
export function unique(array) {
  return [...new Set(array)];
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get random item from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random item
 * @example
 * sample([1, 2, 3, 4, 5]) // 3
 */
export function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ============================================
// Object Utilities
// ============================================

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 * @example
 * const clone = deepClone({ a: 1, b: { c: 2 } });
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 * @example
 * deepMerge({ a: 1 }, { b: 2 }, { c: 3 }) // { a: 1, b: 2, c: 3 }
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;

  const source = sources.shift();

  if (typeof target === 'object' && typeof source === 'object') {
    for (const key in source) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * Pick properties from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to pick
 * @returns {Object} Object with picked properties
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

/**
 * Omit properties from object
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to omit
 * @returns {Object} Object without omitted properties
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 */
export function omit(obj, keys) {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

// Export all as default for convenience
export default {
  debounce,
  throttle,
  memoize,
  once,
  delay,
  isValidEmail,
  isValidURL,
  isValidPhone,
  validatePassword,
  isEmpty,
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  randomString,
  slugify,
  clamp,
  random,
  round,
  formatNumber,
  formatBytes,
  percentage,
  formatDate,
  timeAgo,
  parseTime,
  formatTime,
  shuffle,
  unique,
  chunk,
  sample,
  deepClone,
  deepMerge,
  pick,
  omit
};
