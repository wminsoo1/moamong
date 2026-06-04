/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3182f6",
        danger: "#f04452",
        income: "#3182f6",
        expense: "#f04452",
      },
    },
  },
  plugins: [],
};
