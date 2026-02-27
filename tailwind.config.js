/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        surface: {
          DEFAULT: '#0b0b10',
          raised: '#12121a',
          overlay: '#1a1a25',
        },
        // Text
        'text-primary': '#e8e4de',
        'text-secondary': '#a8a4a0',
        'text-tertiary': '#6b6966',
        'text-muted': '#4a4845',
        // Accents
        accent: {
          DEFAULT: '#2dd4a8',
          hover: '#5eead4',
          muted: 'rgba(45, 212, 168, 0.15)',
          warm: '#e6a04a',
          'warm-hover': '#f0b866',
        },
        // Borders
        border: {
          DEFAULT: '#1f1f2a',
          hover: '#2a2a38',
          accent: 'rgba(45, 212, 168, 0.4)',
        },
        // Status
        success: '#4ade80',
        error: '#f87171',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h1': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '500' }],
        'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'h5': ['1rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
        'h6': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '500' }],
        'code': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.2)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.3)',
        'glow-accent': '0 0 20px rgba(45, 212, 168, 0.15)',
        'glow-warm': '0 0 20px rgba(230, 160, 74, 0.15)',
        'input-focus': '0 0 0 3px rgba(45, 212, 168, 0.15)',
        'input-error': '0 0 0 3px rgba(248, 113, 113, 0.15)',
      },
      keyframes: {
        'waveform-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'waveform-1': 'waveform-bar 1.2s ease-in-out infinite',
        'waveform-2': 'waveform-bar 1.2s ease-in-out 0.15s infinite',
        'waveform-3': 'waveform-bar 1.2s ease-in-out 0.3s infinite',
        'waveform-4': 'waveform-bar 1.2s ease-in-out 0.1s infinite',
        'waveform-5': 'waveform-bar 1.2s ease-in-out 0.25s infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      zIndex: {
        'sticky': '10',
        'audio-player': '30',
        'nav': '40',
        'dropdown': '50',
        'modal-backdrop': '60',
        'modal': '70',
        'toast': '80',
        'skip-link': '100',
      },
      maxWidth: {
        'content-narrow': '720px',
        'content': '1024px',
        'content-wide': '1280px',
        'content-max': '1440px',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
