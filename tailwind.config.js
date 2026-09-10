/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        // Cafe Brand Colors
        cream: "#FAF6EE",          // Main background
        espresso: "#3D2314",       // Main text / headings
        caramel: "#A35D38",        // Primary CTA / active states
        caramelHover: "#8F4F30",   // Darker caramel for hover
        latte: "#EAD8C0",          // Cards / inputs / surfaces
        terracotta: "#C86D46",     // Badges / highlights / favorites

        // Optional semantic colors
        success: "#5F7654",
        warning: "#B7793E",
        error: "#A64B3C",

        // Neutral colors
        white: "#FFFFFF",
      },
    },
  },

  plugins: [],
};