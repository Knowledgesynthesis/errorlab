/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'type1': '#ef4444', // Type I error - warm accent (red)
        'type2': '#3b82f6', // Type II error - cool accent (blue)
        'power': '#10b981', // Power - positive accent (green)
        'correct': '#6b7280', // Correct retain - neutral (gray)
      },
    },
  },
  plugins: [],
}
