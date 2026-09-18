/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Permite alternar o tema manualmente
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        charcoal: 'var(--color-charcoal)',
        subtle: 'var(--color-subtle)',
        terra: 'var(--color-terra)',
        cardbg: 'var(--color-cardbg)',
        bordercolor: 'var(--color-bordercolor)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}