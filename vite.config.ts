import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tst/setup.ts'],
    include: ['tst/**/*.{test,spec}.{ts,tsx}'],
    server: {
      deps: {
        inline: [
          'lucide-react',
          'framer-motion',
          '@csstools/css-calc',
          '@asamuzakjp/css-color'
        ],
      },
    },
    pool: 'vmThreads',
  },
}))
