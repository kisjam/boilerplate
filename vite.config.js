import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist/assets/js',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/assets/js/app.ts'),
      output: {
        entryFileNames: 'bundle.js',
        assetFileNames: '[name].[ext]'
      }
    },
    sourcemap: true,
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});