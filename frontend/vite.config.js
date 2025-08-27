import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',         // default, can omit
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Put all assets (images, fonts, etc.) into dist/assets/
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },    // ensures all assets (images, fonts, etc.) go into dist/assets
  },
  server: {
    port:5173,
    proxy: {
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
