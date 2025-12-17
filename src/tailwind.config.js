/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "cell-ripple": "cell-ripple 0.6s ease-out forwards",
      },
      keyframes: {
        "cell-ripple": {
          "0%": {
            transform: "scale(1)",
            opacity: "0.4",
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: "0.8",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "0.4",
          },
        },
      },
    },
  },
  plugins: [],
}