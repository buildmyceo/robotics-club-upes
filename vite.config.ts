import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4}'],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB to accommodate videos
      }
    })
  ],
  base: process.env.GITHUB_PAGES === 'true' ? '/robotics-club-upes/' : '/',
})
