import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
    base: './',                              // нужно для Яндекс Игр: относительные пути
    build: {
  chunkSizeWarningLimit: 3000,
      rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('node_modules/react')) { return 'react' }
        if (id.includes('node_modules/@react-three/fiber')) { return 'fiber' }
      },
    },
  },
},  // Phaser весит ~1 МБ
})
