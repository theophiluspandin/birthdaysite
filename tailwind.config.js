/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0a192f',
        navy: '#112240',
        royal: '#1d3a75',
        moon: '#e6f1ff',
        cream: '#fbf7ef',
      },
      fontFamily: {
        maru: ['"Zen Maru Gothic"', 'sans-serif'],
        serifjp: ['"Noto Serif JP"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        dancing: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
};
