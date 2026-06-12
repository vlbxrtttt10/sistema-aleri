/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fceef4',
          100: '#f6ccdc',
          200: '#ee99b9',
          300: '#e56696',
          400: '#cc3d72',
          500: '#af2154',
          600: '#8f1a43',
          700: '#6f1333',
          800: '#4f0d24',
          900: '#2f0614',
        },
        secondary: {
          50:  '#f7edf4',
          100: '#e9cde2',
          200: '#d49bc5',
          300: '#be69a8',
          400: '#a3408e',
          500: '#83266d',
          600: '#6b1d59',
          700: '#531545',
          800: '#3b0e31',
          900: '#23061d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
