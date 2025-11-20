/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#f1f5f9',
        'tiger-gold': '#FFD700',
        'tiger-gold-dark': '#FFA500',
        'tiger-red': '#DC2626',
        'tiger-red-dark': '#B91C1C',
        'tiger-green': '#059669',
      },
      backgroundImage: {
        'casino-gradient': 'linear-gradient(135deg, #1e1e1e 0%, #2d1810 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'red-gradient': 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      },
      keyframes: {
        'gold-shine': {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '-200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)' },
        },
        'coin-spin': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
      },
      animation: {
        'gold-shine': 'gold-shine 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'coin-spin': 'coin-spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}
