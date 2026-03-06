/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      transform: ['responsive', 'hover', 'focus'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce'],
      colors:{
        brand: '#44313a'
      },
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}

