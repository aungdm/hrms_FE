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
      },
      '/arrears': {
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
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable', 'html2canvas']
  },
  base: './'
})
