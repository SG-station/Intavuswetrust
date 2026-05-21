/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Alstom February 2026 V1.0 — Primary
        alstom: {
          carbon: "#1E3246",       // Carbon Blue
          blueprint: "#142846",    // Blueprint Blue
          red: "#DC3223",          // Vibrant Red
          ultramarine: "#2850F0",  // Dynamic Ultramarine
          limestone: "#E6E6F0",    // Limestone Grey
        },
        // Alstom — Secondary
        alstomAccent: {
          green: "#78C86E",        // Ecosystem Green
          purple: "#9646DC",       // Visionary Purple
          gold: "#9B875F",         // Integrity Gold
        },
      },
      fontFamily: {
        sans: ["League Spartan", "Helvetica Neue", "Helvetica", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "alstom-glow": "0 0 0 1px rgba(40, 80, 240, 0.15), 0 20px 60px -10px rgba(20, 40, 70, 0.45)",
      },
    },
  },
  plugins: [],
};
