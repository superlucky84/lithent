/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{tsx,ts,js,jsx}', './server.js'],
  safelist: [
    {
      pattern:
        /bg-pokemon-(normal|fighting|flying|poison|ground|rock|bug|ghost|steel|fire|water|grass|electric|psychic|ice|dragon|dark|fairy)/,
      pattern:
        /text-pokemon-(normal|fighting|flying|poison|ground|rock|bug|ghost|steel|fire|water|grass|electric|psychic|ice|dragon|dark|fairy)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        pokemon: {
          normal: '#A8A77A',
          fighting: '#C22E28',
          flying: '#A98FF3',
          poison: '#A33EA1',
          ground: '#E2BF65',
          rock: '#B6A136',
          bug: '#A6B91A',
          ghost: '#735797',
          steel: '#B7B7CE',
          fire: '#EE8130',
          water: '#6390F0',
          grass: '#7AC74C',
          electric: '#F7D02C',
          psychic: '#F95587',
          ice: '#96D9D6',
          dragon: '#6F35FC',
          dark: '#705746',
          fairy: '#D685AD',
        },
      },
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
