import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
        screens: { '2xl': '1280px' },
      },
      keyframes: {
        'slide-in-from-right-8': { from: { transform: 'translateX(2rem)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'slide-in-from-top-2': { from: { transform: 'translateY(-0.5rem)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-from-right-8 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-top': 'slide-in-from-top-2 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
