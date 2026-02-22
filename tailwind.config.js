/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        secondary: "#1a1a1a",
        tertiary: "#1c1c1c",
        elevated: "#222222",
        accent: "#c17f3e",
        'accent-light': "#d4a574",
        dim: "#a0a0a0",
        cream: "#e8e4df",
        'cream-light': "#f0ece6",
        border: "#2a2a2a",
        'border-hover': "#3a3a3a",
        tech: "#4a6fa5",
        success: "#6b9e7a",
        error: "#cc6b6b",
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        label: ['Space Grotesk', 'sans-serif'],
      },
      keyframes: {
        'music-bar': {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        },
      },
    },
  },
  plugins: [],
}
