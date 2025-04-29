/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto Mono', 'serif'],
        Montserrat: ['Montserrat', 'serif']
      }
    },
  },
  plugins: [],
}

