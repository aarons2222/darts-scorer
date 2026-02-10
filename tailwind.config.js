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
        // Dartboard-inspired palette
        'dartboard': {
          'black': '#1a1a1a',
          'cream': '#f5f5dc',
          'green': '#1b5e20',
          'red': '#c62828',
          'wire': '#666666',
        },
        'darts': {
          'background': '#2a2a2a',
          'surface': '#3a3a3a',
          'border': '#4a4a4a',
        }
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
          'from': { boxShadow: '0 0 4px rgba(198, 40, 40, 0.3)' },
          'to': { boxShadow: '0 0 8px rgba(198, 40, 40, 0.6)' }
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
        'dartboard': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'dartboard-lg': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'score-active': '0 0 0 2px rgba(198, 40, 40, 0.5)',
      },
      backgroundImage: {
        'dartboard-subtle': 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
      }
    },
  },
  plugins: [],
}