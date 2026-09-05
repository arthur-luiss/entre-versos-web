/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FCFAF7",
        terra: "#8A5E52",
        charcoal: "#2E2A27",
        subtle: "#8A827C",
        bordercolor: "#DAD2CA",
        cardbg: "#F1EBE5",
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}