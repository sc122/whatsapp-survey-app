/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp-green': '#25D366',
        'whatsapp-dark-green': '#128C7E',
        'whatsapp-light-green': '#DCF8C6',
      }
    },
  },
  plugins: [],
}