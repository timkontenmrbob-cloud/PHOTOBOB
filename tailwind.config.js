/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1769E0',
          'blue-hover': '#1254B3',
          'blue-light': '#EFF5FF',
          'blue-subtle': '#F4F8FF',
          dark: '#141E30',
          muted: '#475569',
          border: '#E2E8F0',
          red: '#D83B45',
          'red-light': '#FDF2F2',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      minHeight: {
        'btn': '60px',
      },
      fontSize: {
        'touch': ['19px', { lineHeight: '26px' }],
      }
    },
  },
  plugins: [],
};
