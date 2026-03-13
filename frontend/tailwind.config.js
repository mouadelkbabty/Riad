/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        riad: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f5dca8',
          300: '#eec470',
          400: '#e6a83a',
          500: '#d4891a',
          600: '#b86c12',
          700: '#944f11',
          800: '#783f14',
          900: '#623514',
          950: '#371a07',
        },
        terracotta: {
          50:  '#fef4ee',
          100: '#fce6d8',
          200: '#f9cab0',
          300: '#f5a67d',
          400: '#ef7748',
          500: '#eb5525',
          600: '#dc3d1b',
          700: '#b62d18',
          800: '#91261b',
          900: '#752319',
          950: '#3f0e0b',
        },
        morocco: {
          green:  '#2d6a4f',
          blue:   '#1b4f72',
          sand:   '#f5deb3',
          gold:   '#d4ac0d',
        }
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'zellige': "url('/assets/patterns/zellige.svg')",
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease-in-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'shimmer':   'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
