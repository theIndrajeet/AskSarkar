/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LEXLEAKS color palette
        cream: '#F5F0E8',
        'cream-dark': '#E8E0D3',
        'red-primary': '#8B1A1A',
        'text-primary': '#1A1A1A',
        'text-secondary': '#5A5A5A',
        'border-light': '#D4C5B9',
        'bg-card': '#FDFCF8',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'extra-wide': '0.3em',
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} 