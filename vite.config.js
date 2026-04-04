import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/** Canonical HTTPS API for production (avoids mixed content if .env still has http:// IP). */
const PRODUCTION_VITE_API_URL = 'https://back.rattelapp.com/api'

function resolveViteApiUrl(mode, fileEnv) {
  const fromShell = (process.env.VITE_API_URL || '').trim()
  const fromFile = (fileEnv.VITE_API_URL || '').trim()
  const merged = fromShell || fromFile

  if (mode !== 'production') {
    return (merged || 'http://localhost:8002/api').replace(/\/$/, '')
  }

  if (!merged) return PRODUCTION_VITE_API_URL.replace(/\/$/, '')

  const lower = merged.toLowerCase()
  // Any non-TLS API URL in prod → mixed content on https://rattelapp.com — force HTTPS backend
  if (lower.startsWith('http://') && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(merged)) {
    return PRODUCTION_VITE_API_URL.replace(/\/$/, '')
  }

  return merged.replace(/\/$/, '')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const viteApiUrl = resolveViteApiUrl(mode, fileEnv)

  return {
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
  // Pin VITE_API_URL so production bundles never embed http:// IP from .env.local by mistake
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    'import.meta.env.VITE_API_URL': JSON.stringify(viteApiUrl),
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
  }
})
