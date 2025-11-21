/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a', // Slate 900 - Professional Dark
        accent: '#3b82f6',  // Blue 500 - Call to actions
        surface: '#f8fafc', // Slate 50 - Backgrounds
      }
    },
  },
  plugins: [],
}