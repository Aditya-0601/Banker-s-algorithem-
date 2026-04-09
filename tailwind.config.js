/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040d06', // deep black with slight green tint
        surface: '#08170d',   // slightly lighter black/green
        surfaceHighlight: '#0d2415', // lighter for hover states
        border: '#143820', // darker outline
        primary: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#34d399',   // emerald-400
          active: '#059669',  // emerald-600
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        text: {
          DEFAULT: '#e5e7eb', // gray-200
          muted: '#9ca3af',   // gray-400
          highlight: '#ffffff', // pure white for active focus
        },
        status: {
          safe: '#10b981', // emerald
          evaluating: '#eab308', // yellow
          blocked: '#ef4444', // red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 15px -3px rgba(16, 185, 129, 0.4)',
        'glow-strong': '0 0 25px -5px rgba(16, 185, 129, 0.6)',
      },
      animation: {
        'border-pulse': 'border-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'border-pulse': {
          '0%, 100%': { borderColor: 'rgba(16, 185, 129, 0.5)' },
          '50%': { borderColor: 'rgba(16, 185, 129, 0.1)' },
        }
      }
    },
  },
  plugins: [],
}
