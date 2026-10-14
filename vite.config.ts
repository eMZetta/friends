import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the build also works inside the Capacitor iOS shell.
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Older iPads (Air 2, mini 4, iPad 5/6) are stuck on iPadOS 15 / Safari 15.
    target: ['es2020', 'safari14'],
  },
  server: {
    // Reachable from an iPad on the same Wi-Fi for testing.
    host: true,
  },
})
