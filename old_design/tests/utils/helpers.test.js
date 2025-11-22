/**
 * Tests for helper utilities
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  debounce,
  throttle,
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
  slugify,
  clamp,
  random,
  round,
  formatNumber,
  formatBytes,
  percentage,
  formatDate,
  formatTime,
  parseTime,
  shuffle,
  unique,
  chunk,
  deepClone,
  deepMerge,
  pick,
  omit
} from '../../assets/js/refactored/utils/helpers.js';

describe('Function Utilities', () => {
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call immediately when immediate=true', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100, true);

      debounced();

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 150));

      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should validate correct URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://localhost:3000')).toBe(true);
      expect(isValidURL('https://sub.domain.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('ftp://invalid')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('+1-234-567-8900')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+48 123 456 789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('12345678901234567890')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('MyPass123!', {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak', {
        minLength: 8
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should calculate password strength', () => {
      const weak = validatePassword('password123');
      const medium = validatePassword('Password123');
      const strong = validatePassword('Pass123!@#$Strong');

      expect(weak.strength).toBe('weak');
      expect(medium.strength).toBe('medium');
      expect(strong.strength).toBe('strong');
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
    });
  });
});

describe('String Utilities', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });
  });

  describe('titleCase', () => {
    it('should convert to title case', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      expect(camelCase('hello-world')).toBe('helloWorld');
      expect(camelCase('hello_world')).toBe('helloWorld');
      expect(camelCase('hello world')).toBe('helloWorld');
    });
  });

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(kebabCase('helloWorld')).toBe('hello-world');
      expect(kebabCase('Hello World')).toBe('hello-world');
      expect(kebabCase('hello_world')).toBe('hello-world');
    });
  });

  describe('snakeCase', () => {
    it('should convert to snake_case', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world');
      expect(snakeCase('Hello World')).toBe('hello_world');
      expect(snakeCase('hello-world')).toBe('hello_world');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello World!!!')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });
  });
});

describe('Number Utilities', () => {
  describe('clamp', () => {
    it('should clamp values', () => {
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(5, 0, 10)).toBe(5);
    });
  });

  describe('random', () => {
    it('should generate random integers', () => {
      const value = random(1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThan(10);
      expect(Number.isInteger(value)).toBe(true);
    });

    it('should generate random floats', () => {
      const value = random(1, 10, true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThan(10);
    });
  });

  describe('round', () => {
    it('should round to decimal places', () => {
      expect(round(3.14159, 2)).toBe(3.14);
      expect(round(3.14159, 0)).toBe(3);
      expect(round(3.14159, 4)).toBe(3.1416);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(123)).toBe('123');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes to human readable', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('percentage', () => {
    it('should calculate percentages', () => {
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(1, 3, 2)).toBe(33.33);
      expect(percentage(0, 100)).toBe(0);
    });

    it('should handle division by zero', () => {
      expect(percentage(25, 0)).toBe(0);
    });
  });
});

describe('Date/Time Utilities', () => {
  describe('formatDate', () => {
    it('should format dates', () => {
      const date = new Date('2025-11-13T14:30:00');
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2025-11-13');
      expect(formatDate(date, 'DD/MM/YYYY')).toContain('13/11/2025');
    });
  });

  describe('formatTime', () => {
    it('should format seconds to time', () => {
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(3665)).toBe('1:01:05');
      expect(formatTime(30)).toBe('0:30');
    });

    it('should include hours when requested', () => {
      expect(formatTime(90, true)).toBe('0:01:30');
    });
  });

  describe('parseTime', () => {
    it('should parse time strings', () => {
      expect(parseTime('1:30')).toBe(90);
      expect(parseTime('1:01:05')).toBe(3665);
      expect(parseTime('0:30')).toBe(30);
    });
  });
});

describe('Array Utilities', () => {
  describe('shuffle', () => {
    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);

      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled).toEqual(expect.arrayContaining(arr));
      expect(arr).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    });
  });

  describe('chunk', () => {
    it('should chunk array', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    });
  });
});

describe('Object Utilities', () => {
  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const clone = deepClone(obj);

      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    it('should clone arrays', () => {
      const arr = [1, [2, 3]];
      const clone = deepClone(arr);

      expect(clone).toEqual(arr);
      expect(clone).not.toBe(arr);
      expect(clone[1]).not.toBe(arr[1]);
    });

    it('should clone dates', () => {
      const date = new Date('2025-11-13');
      const clone = deepClone(date);

      expect(clone).toEqual(date);
      expect(clone).not.toBe(date);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const merged = deepMerge(obj1, obj2);

      expect(merged).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4
      });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });
});
