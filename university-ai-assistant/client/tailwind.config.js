/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0b0f19',
          panel: '#131826',
          border: '#232a3d',
          accent: '#6366f1',
          accentSoft: '#818cf8',
          text: '#e5e7eb',
          muted: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
