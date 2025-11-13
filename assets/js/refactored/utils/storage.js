/**
 * Storage Utility
 * Safe localStorage wrapper with fallback and error handling
 *
 * @module storage
 * @example
 * import { Storage } from './utils/storage.js';
 *
 * Storage.set('key', { data: 'value' });
 * const data = Storage.get('key');
 */

class StorageManager {
  constructor() {
    this._memory = new Map();
    this._available = this._checkAvailability();
  }

  /**
   * Check if localStorage is available
   * @private
   * @returns {boolean} True if localStorage is available
   */
  _checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage not available, using memory fallback');
      return false;
    }
  }

  /**
   * Set an item in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON serialized)
   * @returns {boolean} True if successful
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);

      if (this._available) {
        localStorage.setItem(key, serialized);
      }

      // Always set in memory as backup
      this._memory.set(key, value);

      return true;
    } catch (error) {
      console.error(`Storage.set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get an item from storage
   * @param {string} key - Storage key
   * @param {*} [defaultValue=null] - Default value if key not found
   * @returns {*} Retrieved value or default
   */
  get(key, defaultValue = null) {
    try {
      // Try localStorage first
      if (this._available) {
        const item = localStorage.getItem(key);

        if (item !== null) {
          return JSON.parse(item);
        }
      }

      // Fall back to memory
      if (this._memory.has(key)) {
        return this._memory.get(key);
      }

      return defaultValue;
    } catch (error) {
      console.error(`Storage.get error for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key - Storage key
   * @returns {boolean} True if successful
   */
  remove(key) {
    try {
      if (this._available) {
        localStorage.removeItem(key);
      }

      this._memory.delete(key);

      return true;
    } catch (error) {
      console.error(`Storage.remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all items from storage
   * @returns {boolean} True if successful
   */
  clear() {
    try {
      if (this._available) {
        localStorage.clear();
      }

      this._memory.clear();

      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  has(key) {
    if (this._available) {
      return localStorage.getItem(key) !== null;
    }

    return this._memory.has(key);
  }

  /**
   * Get all keys in storage
   * @returns {string[]} Array of keys
   */
  keys() {
    if (this._available) {
      return Object.keys(localStorage);
    }

    return Array.from(this._memory.keys());
  }

  /**
   * Get the number of items in storage
   * @returns {number} Number of items
   */
  get length() {
    if (this._available) {
      return localStorage.length;
    }

    return this._memory.size;
  }
}

// Create singleton instance
export const Storage = new StorageManager();

export default Storage;
