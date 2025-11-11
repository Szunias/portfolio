/**
 * Safe localStorage Utility
 * Handles QuotaExceededError, disabled localStorage, and provides fallback
 */

import { IS_DEV } from '../config/constants.js';

class StorageManager {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.memoryFallback = new Map();
    this.prefix = 'igorsz_'; // Namespace to avoid conflicts
  }

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      if (IS_DEV) {
        console.warn('localStorage not available:', e.message);
      }
      return false;
    }
  }

  /**
   * Get item from storage
   * @param {string} key
   * @param {*} defaultValue - Value to return if key doesn't exist
   * @returns {*}
   */
  get(key, defaultValue = null) {
    const prefixedKey = this.prefix + key;

    try {
      if (this.isAvailable) {
        const value = localStorage.getItem(prefixedKey);
        if (value === null) return defaultValue;

        // Try to parse JSON, return as-is if it fails
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } else {
        // Use memory fallback
        return this.memoryFallback.has(key)
          ? this.memoryFallback.get(key)
          : defaultValue;
      }
    } catch (error) {
      if (IS_DEV) {
        console.error(`Storage get error for key "${key}":`, error);
      }
      return defaultValue;
    }
  }

  /**
   * Set item in storage
   * @param {string} key
   * @param {*} value
   * @returns {boolean} Success status
   */
  set(key, value) {
    const prefixedKey = this.prefix + key;

    try {
      // Stringify if not already a string
      const stringValue = typeof value === 'string'
        ? value
        : JSON.stringify(value);

      if (this.isAvailable) {
        localStorage.setItem(prefixedKey, stringValue);
      } else {
        // Use memory fallback
        this.memoryFallback.set(key, value);
      }
      return true;
    } catch (error) {
      // Handle QuotaExceededError
      if (error.name === 'QuotaExceededError') {
        if (IS_DEV) {
          console.warn('localStorage quota exceeded, attempting cleanup...');
        }

        // Try to clear old data
        this.clearOldData();

        // Retry once
        try {
          if (this.isAvailable) {
            localStorage.setItem(prefixedKey, typeof value === 'string' ? value : JSON.stringify(value));
          } else {
            this.memoryFallback.set(key, value);
          }
          return true;
        } catch (retryError) {
          if (IS_DEV) {
            console.error('Storage set failed after retry:', retryError);
          }
          // Fallback to memory
          this.memoryFallback.set(key, value);
          return false;
        }
      }

      if (IS_DEV) {
        console.error(`Storage set error for key "${key}":`, error);
      }

      // Fallback to memory
      this.memoryFallback.set(key, value);
      return false;
    }
  }

  /**
   * Remove item from storage
   * @param {string} key
   * @returns {boolean} Success status
   */
  remove(key) {
    const prefixedKey = this.prefix + key;

    try {
      if (this.isAvailable) {
        localStorage.removeItem(prefixedKey);
      }
      this.memoryFallback.delete(key);
      return true;
    } catch (error) {
      if (IS_DEV) {
        console.error(`Storage remove error for key "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Clear all items with our prefix
   * @returns {boolean} Success status
   */
  clear() {
    try {
      if (this.isAvailable) {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      this.memoryFallback.clear();
      return true;
    } catch (error) {
      if (IS_DEV) {
        console.error('Storage clear error:', error);
      }
      return false;
    }
  }

  /**
   * Clear old data (older than 30 days)
   * Used when quota is exceeded
   */
  clearOldData() {
    if (!this.isAvailable) return;

    try {
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(this.prefix)) continue;

        // Check if key has timestamp (format: prefix_timestamp_actualkey)
        const parts = key.split('_');
        if (parts.length >= 3) {
          const timestamp = parseInt(parts[1], 10);
          if (!isNaN(timestamp) && now - timestamp > thirtyDaysMs) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors during cleanup
        }
      });

      if (IS_DEV && keysToRemove.length > 0) {
        console.log(`Cleared ${keysToRemove.length} old storage items`);
      }
    } catch (error) {
      if (IS_DEV) {
        console.error('Error clearing old data:', error);
      }
    }
  }

  /**
   * Check if key exists
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const prefixedKey = this.prefix + key;

    try {
      if (this.isAvailable) {
        return localStorage.getItem(prefixedKey) !== null;
      }
      return this.memoryFallback.has(key);
    } catch (error) {
      if (IS_DEV) {
        console.error(`Storage has error for key "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Get all keys (without prefix)
   * @returns {string[]}
   */
  keys() {
    try {
      if (this.isAvailable) {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keys.push(key.substring(this.prefix.length));
          }
        }
        return keys;
      }
      return Array.from(this.memoryFallback.keys());
    } catch (error) {
      if (IS_DEV) {
        console.error('Storage keys error:', error);
      }
      return [];
    }
  }

  /**
   * Get storage size (approximate, in bytes)
   * @returns {number}
   */
  getSize() {
    if (!this.isAvailable) return 0;

    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          size += key.length + (value ? value.length : 0);
        }
      }
      return size;
    } catch (error) {
      if (IS_DEV) {
        console.error('Storage getSize error:', error);
      }
      return 0;
    }
  }
}

// Create singleton instance
const storage = new StorageManager();

// Export both the instance and the class
export { storage, StorageManager };
export default storage;
