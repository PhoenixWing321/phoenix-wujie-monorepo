import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  resolve: {
    alias: {
      '@phoenix-ui': resolve(__dirname, 'src')
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PhoenixUI',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'lit'],
      output: {
        globals: {
          vue: 'Vue',
          lit: 'Lit'
        }
      }
    }
  },
  esbuild: {
    target: 'es2020',
    supported: {
      'decorators': true
    }
  }
}); 