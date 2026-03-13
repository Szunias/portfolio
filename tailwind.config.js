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
          DEFAULT: '#0C0C11',
          raised: '#141419',
          overlay: '#1C1C24',
          subtle: '#22222D',
        },
        // Text
        'text-primary': '#E8E4DE',
        'text-secondary': '#A8A4A0',
        'text-tertiary': '#6B6966',
        'text-muted': '#4A4845',
        // Accents
        accent: {
          DEFAULT: '#D4A853',
          hover: '#E6BE6A',
          muted: 'rgba(212, 168, 83, 0.12)',
          warm: '#D4A853',
          'warm-hover': '#E6BE6A',
          secondary: '#5B8A72',
          'secondary-hover': '#6FA088',
        },
        // Borders
        border: {
          DEFAULT: '#1E1E28',
          hover: '#2A2A36',
          accent: 'rgba(212, 168, 83, 0.3)',
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
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'h1': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '500' }],
        'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'h5': ['1rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
        'h6': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.7', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '400' }],
        'overline': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.12em', fontWeight: '500' }],
        'label': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.1em', fontWeight: '600' }],
        'code': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.25)',
        'hover': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'glow': '0 0 24px rgba(212, 168, 83, 0.1)',
        'glow-accent': '0 0 20px rgba(212, 168, 83, 0.15)',
        'input-focus': '0 0 0 3px rgba(212, 168, 83, 0.15)',
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
        'ease-standard': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
