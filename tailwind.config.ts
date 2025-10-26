import type { Config } from 'tailwindcss';

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        temp: {
          hot: '#FF6B35',
          warm: '#FF8C42',
          medium: '#FFB84D',
          cool: '#FFF066',
          cold: '#4CAF50',
        },
      },
      fontSize: {
        '10xl': '10rem',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;
