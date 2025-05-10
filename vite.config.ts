import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'xmlbuilder2',
      'events',
      'buffer',
      'process',
      'html-to-docx',
      'file-saver'
    ],
  },
  build: {
    // Enable code splitting for better performance
    cssCodeSplit: true,
    sourcemap: false,
    // Optimize chunk sizes
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react'],
          utils: ['file-saver', 'html-to-docx']
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
  },
  resolve: {
    alias: {
      // Provide browser polyfills for Node.js modules
      'stream': 'stream-browserify',
      'buffer': 'buffer',
      'process': 'process/browser',
      'events': 'events'
    }
  },
  define: {
    'process.env': {},
    'global': 'globalThis'
  },
  server: {
    port: 3000,
    strictPort: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'cross-origin-isolated',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, X-Client-Info'
    }
  }
});