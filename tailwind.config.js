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
        tertiary: "#0f0f0f", // Even lighter
        accent: "#38bdf8", // Sky blue
        gold: "#c9a961", // From Amorak/Shadow Frames
        dim: "#a1a1aa", // Dim text
        success: "#22c55e", // Green-500
        canvas: {
          DEFAULT: "#0d1117", // GitHub Dark dim
          header: "#161b22", // GitHub Dark header
          border: "#30363d", // GitHub Dark border
        }
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
        },
        'mist': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'visualizer-bar': {
          '0%, 100%': { height: '10%' },
          '25%': { height: '60%' },
          '50%': { height: '90%' },
          '75%': { height: '40%' },
        }
      },
      animation: {
        'mist-slow': 'mist 20s linear infinite',
        'visualizer-bar': 'visualizer-bar 0.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}