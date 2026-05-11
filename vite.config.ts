import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['favicon.svg', 'icons.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'City Bingo',
        short_name: 'CityBingo',
        description: 'A fun city-wide bingo scavenger hunt game',
        theme_color: '#3B82F6',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
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
