/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vue: {
          green: '#42b883',
          dark: '#35495e',
        },
      },
    },
  },
  plugins: [],
};
