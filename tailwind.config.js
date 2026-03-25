/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        gh: {
          bg: 'var(--gh-bg)',
          card: 'var(--gh-card)',
          badge: 'var(--gh-badge)',
          border: 'var(--gh-border)',
          'text-primary': 'var(--gh-text-primary)',
          'text-secondary': 'var(--gh-text-secondary)',
          accent: 'var(--gh-accent)',
          'accent-hover': 'var(--gh-accent-hover)',
          danger: 'var(--gh-danger)',
        },
        contrib: {
          none: 'var(--contrib-none)',
          q1: 'var(--contrib-q1)',
          q2: 'var(--contrib-q2)',
          q3: 'var(--contrib-q3)',
          q4: 'var(--contrib-q4)',
        },
      },
    },
  },
  plugins: [],
}
