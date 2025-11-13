import { defineConfig } from 'vite';
import { resolve } from 'path';

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
      // Multi-page app configuration - explicit input for all HTML files
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        music: resolve(__dirname, 'music.html'),
        '404': resolve(__dirname, '404.html'),
        // Projects
        'projects/index': resolve(__dirname, 'projects/index.html'),
        'projects/akantilado': resolve(__dirname, 'projects/akantilado.html'),
        'projects/amorak': resolve(__dirname, 'projects/amorak.html'),
        'projects/audiolab': resolve(__dirname, 'projects/audiolab.html'),
        'projects/audioq': resolve(__dirname, 'projects/audioq.html'),
        'projects/environments': resolve(__dirname, 'projects/environments.html'),
        'projects/middleware-optimization': resolve(__dirname, 'projects/middleware-optimization.html'),
        'projects/middleware2': resolve(__dirname, 'projects/middleware2.html'),
        'projects/musicforgames': resolve(__dirname, 'projects/musicforgames.html'),
        'projects/not-today-darling': resolve(__dirname, 'projects/not-today-darling.html'),
        'projects/pause-and-deserve': resolve(__dirname, 'projects/pause-and-deserve.html'),
        'projects/pawism': resolve(__dirname, 'projects/pawism.html'),
        'projects/ray-animation': resolve(__dirname, 'projects/ray-animation.html'),
        'projects/richter': resolve(__dirname, 'projects/richter.html'),
        'projects/shadow-frames': resolve(__dirname, 'projects/shadow-frames.html'),
        'projects/unreal-engine-rebuilder': resolve(__dirname, 'projects/unreal-engine-rebuilder.html'),
        'projects/wwise-unreal-fixer': resolve(__dirname, 'projects/wwise-unreal-fixer.html'),
        // CV
        'cv/igor-cv-dark': resolve(__dirname, 'cv/igor-cv-dark.html')
      },

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
