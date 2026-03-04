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
      // Force single React instance (fixes "setting 'Children'" error)
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Single vendor chunk = single React instance (fixes "setting 'Children'" on Vercel)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
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
