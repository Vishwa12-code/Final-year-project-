/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0a0f',
          green: '#00ffcc',
          blue: '#0088ff',
          red: '#ff3366',
          panel: '#151520'
        }
      }
    },
  },
  plugins: [],
}
