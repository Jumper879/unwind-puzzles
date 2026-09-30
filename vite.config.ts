import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  // The drawer's footer ("unwind puzzles · v{version}") reads this —
  // package.json's own version, not a separately-maintained number.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/favicon.ico'],
      manifest: {
        id: '/',
        name: 'Unwind Puzzles',
        short_name: 'Unwind',
        description: 'A calm, premium collection of single-player puzzle games.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#04073A',
        theme_color: '#04073A',
        icons: [
          {
            src: '/icons/icon-wordmark-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-wordmark-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-wordmark-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-wordmark-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-wordmark-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,webp,svg,ico}'],
        // icons/variants: /dev-only comparison assets, never needed by players.
        // stockfish: 1.8MB engine only chess players ever touch — loaded on
        // demand via the browser's normal HTTP cache instead of bloating
        // every installer's initial precache for a feature they may not use.
        globIgnores: ['icons/variants/**', 'stockfish/**'],
        navigateFallbackDenylist: [/^\/dev\//],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
