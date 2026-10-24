import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    target: 'esnext' // Allows top-level "await box.initialize()" in main.js
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Cache all code, sounds, and 3D dice textures for 100% offline play
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,ogg,jpg,webp}'],
        maximumFileSizeToCacheInBytes: 5000000 // 5MB limit in case any texture/sound is large
      },
      manifest: {
        name: 'Fancy RPG Dice Roller',
        short_name: 'Dice',
        description: 'Custom 3D Dice Roller',
        theme_color: '#1e2026',
        background_color: '#1e2026',
        display: 'standalone', // Hides the Safari address bar and tabs!
        orientation: 'any',
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});