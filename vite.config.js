import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'assets',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,

    rollupOptions: {
      // Multi-page app configuration - Vite will auto-detect HTML files
      // No need to manually specify all pages if using default structure

      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-core': [
            // Add any vendor dependencies here when/if you install them
          ]
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },

    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    },

    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,

    // Optimize assets
    assetsInlineLimit: 4096, // 4kb - inline small assets as base64
  },

  server: {
    port: 3000,
    open: true,
    cors: true
  },

  preview: {
    port: 4173,
    open: true
  },

  // Optimizations
  optimizeDeps: {
    include: []
  },

  // Environment variables
  define: {
    'import.meta.env.IS_DEV': JSON.stringify(process.env.NODE_ENV !== 'production')
  }
});
