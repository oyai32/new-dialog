import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NewDialog',
      fileName: 'new-dialog',
    },
    rollupOptions: {
      external: ['vue', 'element-plus', '@element-plus/icons-vue'],
      output: {
        globals: { vue: 'Vue', 'element-plus': 'ElementPlus' },
        assetFileNames: asset => asset.name?.endsWith('.css') ? 'style.css' : asset.name ?? '[name][extname]',
      },
    },
    cssCodeSplit: false,
  },
})
