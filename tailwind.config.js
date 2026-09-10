/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cy: {
          bg: '#0A0A0B',
          secondary: '#111113',
          panel: '#151518',
          border: '#27272A',
          hover: '#1F1F23',
          active: '#27272E',
          accent: {
            DEFAULT: '#6366F1',
            hover: '#4F46E5',
            glow: '#7C3AED',
            light: '#818CF8',
            subtle: 'rgba(99, 102, 241, 0.12)',
            border: 'rgba(99, 102, 241, 0.3)',
          },
          text: {
            primary: '#F4F4F5',
            secondary: '#A1A1AA',
            muted: '#71717A',
          },
          status: {
            online: '#10B981',
            offline: '#EF4444',
            warning: '#F59E0B',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'cy-glow': '0 0 20px -3px rgba(99, 102, 241, 0.25)',
        'cy-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'cy-input': '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
