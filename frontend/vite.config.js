import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',         // default, can omit
    assetsDir: 'assets',    // ensures all assets (images, fonts, etc.) go into dist/assets
  },
   
})
