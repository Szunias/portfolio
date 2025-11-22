/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#050505", // Deeper black like old site
        secondary: "#0a0a0a", // Slightly lighter for cards
        accent: "#38bdf8", // Sky blue
        gold: "#c9a961", // From Amorak/Shadow Frames
        dim: "#a1a1aa", // Dim text
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      },
      keyframes: {
        'music-bar': {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        }
      },
    },
  },
  plugins: [],
}