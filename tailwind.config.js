/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      transform: ['responsive', 'hover', 'focus'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce']},
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}

