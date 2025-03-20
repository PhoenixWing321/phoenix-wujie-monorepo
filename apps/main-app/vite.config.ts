import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8310
  },
  resolve: {
    alias: {
      '@phoenix-wujie-monorepo/ui': resolve(__dirname, '../../packages/ui/src/index.ts')
    }
  }
})
