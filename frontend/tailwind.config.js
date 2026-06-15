/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette - calm medical teal/indigo
        brand: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bce7ff',
          300: '#8ed8ff',
          400: '#59c0ff',
          500: '#33a3ff',
          600: '#1b83f5',
          700: '#146ae1',
          800: '#1756b6',
          900: '#194b8f',
          950: '#142e57',
        },
        accent: {
          50: '#effefb',
          100: '#c9fff3',
          200: '#93ffe9',
          300: '#54f7da',
          400: '#1fe4c6',
          500: '#06c8ad',
          600: '#00a18e',
          700: '#058073',
          800: '#0a655d',
          900: '#0d534d',
          950: '#003330',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glow': '0 0 24px -4px rgba(51, 163, 255, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
