/** @type {import('tailwindcss').Config} */
// Design tokens for the PHILAConnect vintage-philately theme.
// Palette: cream, off-white, dark ("forest") green and gold.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EFE0',
        parchment: '#EBE0C5',
        offwhite: '#FBF8F1',
        ink: '#26261F',
        forest: {
          50: '#EEF3EF',
          100: '#D5E2D9',
          600: '#355E49',
          700: '#2A4D3C',
          800: '#1F3A2E',
          900: '#14281F',
          950: '#0D1B14',
        },
        gold: {
          300: '#E3C77F',
          400: '#D4AF5A',
          500: '#B8923A',
          600: '#9A7A2C',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      dropShadow: {
        // Used on perforated stamps: a normal box-shadow would be clipped by the mask.
        stamp: '0 8px 12px rgba(10, 25, 18, 0.35)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,40,31,0.06), 0 12px 32px -12px rgba(20,40,31,0.22)',
        'card-hover': '0 2px 4px rgba(20,40,31,0.08), 0 22px 44px -14px rgba(20,40,31,0.32)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
