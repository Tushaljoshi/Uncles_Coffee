/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        golden: "#c8901d",
        primaryDarkBlue: "#081F5C",
        white: "#FFFFFF",
      }
    },
  },
  plugins: [],
}
