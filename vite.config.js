import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Single React instance — avoids "Cannot set properties of undefined (setting 'Children')"
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // All React-dependent libs in one chunk so they share a single React instance
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-icons') ||
              id.includes('react-toastify') ||
              id.includes('react-i18next') ||
              id.includes('recharts') ||
              id.includes('framer-motion')
            ) {
              return 'vendor';
            }
            if (id.includes('i18next') && !id.includes('react')) {
              return 'i18n';
            }
            return 'vendor-libs';
          }
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true, // Auto-open browser in development
  },
  preview: {
    port: 5174,
    host: true,
  },
  // Environment variables configuration
  define: {
    // Ensure environment variables are properly replaced
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'axios',
      'react-i18next',
      'react-toastify',
      'react-icons/fi',
      'recharts',
      'framer-motion',
    ],
  },
})
