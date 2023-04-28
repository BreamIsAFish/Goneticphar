/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        night: "url('/public/Assets/night-background.webp')",
        dusk: "url('/public/Assets/dusk.jpeg')",
        mountain: "url('/public/Assets/mountain2.webp')",
      },
      fontFamily: {
        nordic: ['"Nordic"'],
        aqua: ['"Aqua"'],
      },
    },
  },
  plugins: [],
}
