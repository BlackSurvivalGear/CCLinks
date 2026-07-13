/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#0E0E11',
          800: '#15151A',
          700: '#1E1E24',
          600: '#2A2A32',
          500: '#3F3F4C',
        },
        construction: {
          orange: {
            DEFAULT: '#FF6B00',
            hover: '#E05E00',
            light: '#FF8833',
            50: '#FFF5EE',
          },
          steel: {
            DEFAULT: '#0EA5E9',
            hover: '#0284C7',
            light: '#38BDF8',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
