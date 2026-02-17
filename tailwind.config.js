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
        secondary: "#161616",
        tertiary: "#1c1c1c",
        accent: "#c17f3e",
        'accent-light': "#d4a574",
        dim: "#8a8a8a",
        cream: "#e8e4df",
        'cream-light': "#f0ece6",
        border: "#2a2a2a",
        'border-hover': "#3a3a3a",
        gold: "#c17f3e",
        success: "#22c55e",
        canvas: {
          DEFAULT: "#161616",
          header: "#1c1c1c",
          border: "#2a2a2a",
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      keyframes: {
        'music-bar': {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        },
      },
      animation: {},
    },
  },
  plugins: [],
}
