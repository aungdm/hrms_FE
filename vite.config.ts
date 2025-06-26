import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/otherIncentives': {
        target: 'http://localhost:5000/api/v1',
        changeOrigin: true,
        secure: false,
      },
      '/employee': {
        target: 'http://localhost:5000/api/v1',
        changeOrigin: true,
        secure: false,
      },
      '/employees': {
        target: 'http://localhost:5000/api/v1',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-libs': ['jspdf', 'jspdf-autotable', 'html2canvas'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'html2canvas']
  }
})
