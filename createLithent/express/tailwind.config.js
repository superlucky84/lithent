/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts,js,jsx}', './server.js'],
  theme: {
    extend: {
      animation: {
        dots: 'dots 1.5s infinite steps(1, end)',
      },
      keyframes: {
        dots: {
          '0%': { '--dots': '"Loading"' },
          '25%': { '--dots': '"Loading."' },
          '50%': { '--dots': '"Loading.."' },
          '75%': { '--dots': '"Loading..."' },
          '100%': { '--dots': '"Loading."' },
        },
      },
    },
  },
  plugins: [],
};
