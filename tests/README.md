# 🧪 Testing Guide

Comprehensive testing setup using Vitest for Igor Szuniewicz Portfolio refactored code.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Coverage](#coverage)
5. [Best Practices](#best-practices)
6. [Test Structure](#test-structure)

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with UI

```bash
npm run test:ui
```

### Generate Coverage Report

```bash
npm run test:coverage
```

---

## 🏃 Running Tests

### Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm test -- --watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest UI in browser |
| `npm run test:coverage` | Generate coverage report |
| `npm test -- helpers.test.js` | Run specific test file |
| `npm test -- --reporter=verbose` | Verbose output |

### Run Specific Tests

```bash
# Run specific file
npm test tests/utils/helpers.test.js

# Run tests matching pattern
npm test -- --grep="EventEmitter"

# Run only tests marked with .only
npm test -- --run
```

### Watch Mode

In watch mode, Vitest will:
- Re-run tests when files change
- Show only failed tests after first run
- Press `a` to run all tests
- Press `f` to run only failed tests
- Press `u` to update snapshots

---

## ✍️ Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { myFunction } from '../../assets/js/refactored/utils/myModule.js';

describe('MyModule', () => {
  describe('myFunction', () => {
    it('should do something', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(myFunction(null)).toBe(null);
      expect(myFunction('')).toBe('');
    });
  });
});
```

### Using Mocks

```javascript
import { vi } from 'vitest';

describe('Function with side effects', () => {
  it('should call callback', () => {
    const callback = vi.fn();

    someFunction(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('expected', 'arguments');
  });

  it('should spy on console.log', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    functionThatLogs();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
```

### Async Tests

```javascript
describe('Async functions', () => {
  it('should resolve promise', async () => {
    const result = await asyncFunction();
    expect(result).toBe('success');
  });

  it('should reject promise', async () => {
    await expect(failingFunction()).rejects.toThrow('Error message');
  });

  it('should handle timeout', async () => {
    const result = await new Promise((resolve) => {
      setTimeout(() => resolve('done'), 100);
    });
    expect(result).toBe('done');
  });
});
```

### Setup and Teardown

```javascript
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

describe('Component tests', () => {
  let component;

  // Run before all tests in this describe block
  beforeAll(() => {
    // Setup that runs once before all tests
    console.log('Starting test suite');
  });

  // Run before each test
  beforeEach(() => {
    component = new Component();
  });

  // Run after each test
  afterEach(() => {
    component.destroy();
    component = null;
  });

  // Run after all tests in this describe block
  afterAll(() => {
    // Cleanup that runs once after all tests
    console.log('Test suite complete');
  });

  it('should work', () => {
    expect(component).toBeDefined();
  });
});
```

### Testing DOM

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('DOM manipulation', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="container">
        <button class="btn">Click me</button>
      </div>
    `;
  });

  it('should find element', () => {
    const button = document.querySelector('.btn');
    expect(button).toBeTruthy();
    expect(button.textContent).toBe('Click me');
  });

  it('should handle click', () => {
    const button = document.querySelector('.btn');
    const handleClick = vi.fn();

    button.addEventListener('click', handleClick);
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📊 Coverage

### Coverage Configuration

Coverage is configured in `vitest.config.js`:

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70
  }
}
```

### Generate Coverage Report

```bash
npm run test:coverage
```

This will:
1. Run all tests
2. Generate coverage data
3. Create HTML report in `coverage/` directory
4. Display summary in terminal

### View Coverage Report

Open `coverage/index.html` in your browser:

```bash
# On macOS
open coverage/index.html

# On Linux
xdg-open coverage/index.html

# On Windows
start coverage/index.html
```

### Coverage Thresholds

Tests will fail if coverage drops below:
- **Lines:** 70%
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 70%

---

## 📐 Best Practices

### 1. Test File Organization

```
tests/
├── core/
│   ├── EventEmitter.test.js
│   └── config.test.js
├── utils/
│   ├── helpers.test.js
│   ├── dom.test.js
│   └── storage.test.js
├── components/
│   ├── Navigation.test.js
│   ├── Modal.test.js
│   └── Toast.test.js
└── services/
    ├── TranslationService.test.js
    └── AnalyticsService.test.js
```

### 2. Test Naming

✅ **Good:**
```javascript
describe('formatDate', () => {
  it('should format date as YYYY-MM-DD', () => {});
  it('should handle invalid dates', () => {});
  it('should support custom formats', () => {});
});
```

❌ **Bad:**
```javascript
describe('formatDate', () => {
  it('works', () => {});
  it('test 1', () => {});
  it('handles stuff', () => {});
});
```

### 3. Arrange-Act-Assert Pattern

```javascript
it('should add two numbers', () => {
  // Arrange - setup test data
  const a = 5;
  const b = 3;

  // Act - perform action
  const result = add(a, b);

  // Assert - verify result
  expect(result).toBe(8);
});
```

### 4. Test One Thing

✅ **Good:**
```javascript
it('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

it('should reject invalid emails', () => {
  expect(isValidEmail('invalid')).toBe(false);
});
```

❌ **Bad:**
```javascript
it('should validate emails and format dates and calculate percentages', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
  expect(formatDate(new Date())).toBeDefined();
  expect(percentage(25, 100)).toBe(25);
});
```

### 5. Use Descriptive Matchers

```javascript
// ✅ Good - clear intent
expect(user.age).toBeGreaterThan(18);
expect(items).toHaveLength(5);
expect(result).toContain('error');

// ❌ Bad - unclear
expect(user.age > 18).toBe(true);
expect(items.length === 5).toBe(true);
expect(result.includes('error')).toBe(true);
```

### 6. Mock External Dependencies

```javascript
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' })
  })
);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;
```

### 7. Test Edge Cases

```javascript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  // Edge cases
  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  it('should handle decimals', () => {
    expect(divide(10, 3)).toBeCloseTo(3.33, 2);
  });
});
```

---

## 🏗️ Test Structure

### Existing Tests

#### ✅ tests/utils/helpers.test.js
Comprehensive tests for helper utilities:
- Function utilities (debounce, throttle)
- Validation functions (email, URL, phone, password)
- String utilities (capitalize, camelCase, kebabCase, slugify)
- Number utilities (clamp, round, formatNumber, formatBytes)
- Date/Time utilities (formatDate, formatTime, parseTime)
- Array utilities (shuffle, unique, chunk)
- Object utilities (deepClone, deepMerge, pick, omit)

**Total:** 40+ test cases

#### ✅ tests/core/EventEmitter.test.js
Comprehensive tests for EventEmitter:
- on() - event registration
- once() - one-time event listeners
- off() - event removal
- emit() - event emission with data
- removeAllListeners() - cleanup
- listenerCount() - listener tracking
- eventNames() - registered events
- Integration tests - complex event chains

**Total:** 30+ test cases

### TODO: Tests to Write

- [ ] **tests/utils/dom.test.js** - DOM utility functions
- [ ] **tests/utils/storage.test.js** - Storage wrapper
- [ ] **tests/components/Modal.test.js** - Modal component
- [ ] **tests/components/Toast.test.js** - Toast notifications
- [ ] **tests/components/Navigation.test.js** - Navigation component
- [ ] **tests/components/AudioPlayer.test.js** - Audio player
- [ ] **tests/services/TranslationService.test.js** - i18n service
- [ ] **tests/services/AnalyticsService.test.js** - Analytics service

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Jest Matchers (compatible with Vitest)](https://jestjs.io/docs/expect)

---

## 🐛 Troubleshooting

### Tests Not Running

```bash
# Clear Vitest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Import Errors

Make sure imports use `.js` extension:
```javascript
// ✅ Correct
import { myFunction } from './utils/helpers.js';

// ❌ Incorrect
import { myFunction } from './utils/helpers';
```

### DOM Not Available

Add to top of test file:
```javascript
/**
 * @jest-environment jsdom
 */
```

Or configure globally in `vitest.config.js`:
```javascript
test: {
  environment: 'jsdom'
}
```

---

**Last Updated:** 2025-11-13
**Test Framework:** Vitest v1.3.1
**Coverage Target:** 70%
