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
        'darts-dark': '#0f172a',
        'darts-navy': '#1e293b', 
        'darts-accent': '#334155',
        'darts-green': '#10b981',
        'darts-red': '#ef4444',
        'darts-yellow': '#f59e0b',
        'darts-blue': '#3b82f6',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'score-pop': 'scorePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'celebrate': 'celebrate 0.6s ease-out',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' },
          'to': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' }
        },
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        celebrate: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.1) rotate(-5deg)' },
          '50%': { transform: 'scale(1.2) rotate(5deg)' },
          '75%': { transform: 'scale(1.1) rotate(-3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-lg': '0 0 30px rgba(16, 185, 129, 0.4)',
        'inner-glow': 'inset 0 0 10px rgba(16, 185, 129, 0.2)',
      },
      backgroundImage: {
        'darts-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'score-gradient': 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
      }
    },
  },
  plugins: [],
}