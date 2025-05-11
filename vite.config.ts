import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react']
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
  },
  resolve: {
    alias: {}
  },
  server: {
    port: 3000,
    strictPort: true,
    headers: {}
  }
});