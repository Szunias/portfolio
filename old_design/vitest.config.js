import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Global setup
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Only check coverage for refactored files
      include: [
        'assets/js/refactored/**/*.js'
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'scripts/',
        '**/*.config.js',
        '**/*.config.ts',
        '**/vendor/**',
        'assets/js/refactored/README.md',
        '**/*.test.js',
        '**/*.spec.js'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    },

    // Include test files
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'assets/js/refactored/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Isolate tests
    isolate: true,

    // Watch mode
    watch: false,

    // Reporter
    reporter: ['verbose'],

    // Update snapshots
    update: false
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/assets/js/refactored',
      '@utils': '/assets/js/refactored/utils',
      '@components': '/assets/js/refactored/components',
      '@services': '/assets/js/refactored/services',
      '@core': '/assets/js/refactored/core'
    }
  }
});
