/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'darts-dark': '#1a1a2e',
        'darts-navy': '#16213e',
        'darts-accent': '#0f3460',
        'darts-green': '#4ade80',
        'darts-red': '#ef4444',
      },
    },
  },
  plugins: [],
}