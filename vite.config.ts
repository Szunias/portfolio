import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Custom plugin to copy index.html to 404.html for GitHub Pages SPA support
const copy404 = () => {
  return {
    name: 'copy-404',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const index = resolve(dist, 'index.html')
      const fourOhFour = resolve(dist, '404.html')
      if (fs.existsSync(index)) {
        fs.copyFileSync(index, fourOhFour)
        console.log('Copied index.html to 404.html for GitHub Pages')
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'vendor-utils': ['@vimeo/player', '@emailjs/browser']
        }
      }
    }
  },
  plugins: [react(), copy404()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})