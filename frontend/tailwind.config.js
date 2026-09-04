/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Identité Findoor (affinée lors des maquettes de la phase 2).
        primary: {
          DEFAULT: '#0f9b9b',
          50: '#eafbfb',
          100: '#cdf3f2',
          200: '#9de6e5',
          300: '#63d2d1',
          400: '#33b6b6',
          500: '#0f9b9b',
          600: '#0c7c7d',
          700: '#0e6465',
          800: '#115052',
          900: '#134345',
        },
        ink: '#1f2937',
      },
      fontFamily: {
        sans: ['Poppins', 'Roboto', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
