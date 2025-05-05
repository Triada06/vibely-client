// tailwind.config.js
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-light)',
        text: 'var(--text-light)',
        primary: 'var(--primary-light)',
      },
    },
  },
  plugins: [],
};
