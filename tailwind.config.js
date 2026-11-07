/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#EEF1FB',
        accent: {
          DEFAULT: '#2B59E0',
          hover: '#2047B8',
          light: '#EBF0FF',
          glow: 'rgba(43, 89, 224, 0.4)',
        },
        navy: {
          DEFAULT: '#141B34',
          muted: '#6B7390',
          border: '#E6E9F5',
        },
        success: {
          DEFAULT: '#22A559',
          light: '#E8F7EE',
          dark: '#17733E',
        },
        warning: {
          DEFAULT: '#F5A524',
          light: '#FEF6E9',
          dark: '#B8720A',
        },
        bluechip: {
          DEFAULT: '#2B59E0',
          light: '#EDF2FE',
          dark: '#1E44B5',
        },
        greychip: {
          DEFAULT: '#6B7390',
          light: '#F1F3F7',
          dark: '#484F66',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px -12px rgba(24, 38, 85, 0.12), 0 4px 16px -2px rgba(24, 38, 85, 0.05)',
        'card-hover': '0 26px 50px -10px rgba(24, 38, 85, 0.18), 0 8px 20px -2px rgba(24, 38, 85, 0.08)',
        'card-heavy': '0 24px 55px -12px rgba(20, 35, 90, 0.15), 0 8px 24px -4px rgba(20, 35, 90, 0.07)',
        'card-depth': '0 30px 60px -15px rgba(20, 35, 90, 0.18), 0 12px 28px -6px rgba(20, 35, 90, 0.08)',
        pill: '0 4px 12px rgba(24, 38, 85, 0.06)',
        glow: '0 0 20px rgba(43, 89, 224, 0.45)',
        'glow-green': '0 0 16px rgba(34, 165, 89, 0.35)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      backdropBlur: {
        xs: '4px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        float: 'floatGentle 5s ease-in-out infinite',
        'float-delayed': 'floatGentle 5s ease-in-out 1.5s infinite',
        'float-slow': 'floatGentle 6.5s ease-in-out 0.8s infinite',
        'pulse-glow': 'pulseGlowBlue 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-green': 'pulseGlowGreen 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'glassShimmerSweep 5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
