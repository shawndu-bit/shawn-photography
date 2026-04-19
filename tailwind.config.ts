import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: '#1A1A1A',
        carbonSoft: '#111111'
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.35', transform: 'translate(-50%, 0px)' },
          '50%': { opacity: '1', transform: 'translate(-50%, 6px)' }
        }
      },
      animation: {
        breathe: 'breathe 1.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config;
