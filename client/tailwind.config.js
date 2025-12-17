/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        python: {
          blue: "var(--color-python-blue)",
          yellow: "var(--color-python-yellow)",
          dark: "var(--color-python-dark)",
          light: "var(--color-python-light)",
        },
      },
    },
  },
};
