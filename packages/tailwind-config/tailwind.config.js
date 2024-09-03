/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // apps content
    "./src/**/*.{js,ts,jsx,tsx}",
    // packages content
    "../../packages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
