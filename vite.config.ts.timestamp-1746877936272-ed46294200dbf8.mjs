// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "xmlbuilder2",
      "events",
      "buffer",
      "process",
      "html-to-docx",
      "file-saver"
    ]
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
          react: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["lucide-react"],
          utils: ["file-saver", "html-to-docx"]
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  },
  resolve: {
    alias: {
      // Provide browser polyfills for Node.js modules
      "stream": "stream-browserify",
      "buffer": "buffer",
      "process": "process/browser",
      "events": "events"
    }
  },
  define: {
    "process.env": {},
    "global": "globalThis"
  },
  server: {
    port: 3e3,
    strictPort: true,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    headers: {
      // These headers help prevent the "Separate previews are unsupported" issue
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcbiAgICAgICd4bWxidWlsZGVyMicsXG4gICAgICAnZXZlbnRzJyxcbiAgICAgICdidWZmZXInLFxuICAgICAgJ3Byb2Nlc3MnLFxuICAgICAgJ2h0bWwtdG8tZG9jeCcsXG4gICAgICAnZmlsZS1zYXZlcidcbiAgICBdLFxuICB9LFxuICBidWlsZDoge1xuICAgIC8vIEVuYWJsZSBjb2RlIHNwbGl0dGluZyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgLy8gT3B0aW1pemUgY2h1bmsgc2l6ZXNcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgcmVhY3Q6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICBzdXBhYmFzZTogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcbiAgICAgICAgICB1aTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICAgICAgICB1dGlsczogWydmaWxlLXNhdmVyJywgJ2h0bWwtdG8tZG9jeCddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbW1vbmpzT3B0aW9uczoge1xuICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG4gICAgICBpbmNsdWRlOiBbL25vZGVfbW9kdWxlcy9dXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAvLyBQcm92aWRlIGJyb3dzZXIgcG9seWZpbGxzIGZvciBOb2RlLmpzIG1vZHVsZXNcbiAgICAgICdzdHJlYW0nOiAnc3RyZWFtLWJyb3dzZXJpZnknLFxuICAgICAgJ2J1ZmZlcic6ICdidWZmZXInLFxuICAgICAgJ3Byb2Nlc3MnOiAncHJvY2Vzcy9icm93c2VyJyxcbiAgICAgICdldmVudHMnOiAnZXZlbnRzJ1xuICAgIH1cbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgJ3Byb2Nlc3MuZW52Jzoge30sXG4gICAgJ2dsb2JhbCc6ICdnbG9iYWxUaGlzJ1xuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAwLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgY29yczoge1xuICAgICAgb3JpZ2luOiAnKicsXG4gICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnT1BUSU9OUyddLFxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nXVxuICAgIH0sXG4gICAgaGVhZGVyczoge1xuICAgICAgLy8gVGhlc2UgaGVhZGVycyBoZWxwIHByZXZlbnQgdGhlIFwiU2VwYXJhdGUgcHJldmlld3MgYXJlIHVuc3VwcG9ydGVkXCIgaXNzdWVcbiAgICAgICdDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5JzogJ3JlcXVpcmUtY29ycCcsXG4gICAgICAnQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3knOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCwgUE9TVCwgUFVULCBERUxFVEUsIE9QVElPTlMnLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBBdXRob3JpemF0aW9uJ1xuICAgIH1cbiAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxjQUFjO0FBQUEsSUFDZCxXQUFXO0FBQUE7QUFBQSxJQUVYLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLE9BQU8sQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsVUFDaEQsVUFBVSxDQUFDLHVCQUF1QjtBQUFBLFVBQ2xDLElBQUksQ0FBQyxjQUFjO0FBQUEsVUFDbkIsT0FBTyxDQUFDLGNBQWMsY0FBYztBQUFBLFFBQ3RDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLE1BQ2YseUJBQXlCO0FBQUEsTUFDekIsU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQTtBQUFBLE1BRUwsVUFBVTtBQUFBLE1BQ1YsVUFBVTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsVUFBVTtBQUFBLElBQ1o7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixlQUFlLENBQUM7QUFBQSxJQUNoQixVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLE1BQ1IsU0FBUyxDQUFDLE9BQU8sUUFBUSxPQUFPLFVBQVUsU0FBUztBQUFBLE1BQ25ELGdCQUFnQixDQUFDLGdCQUFnQixlQUFlO0FBQUEsSUFDbEQ7QUFBQSxJQUNBLFNBQVM7QUFBQTtBQUFBLE1BRVAsZ0NBQWdDO0FBQUEsTUFDaEMsOEJBQThCO0FBQUEsTUFDOUIsK0JBQStCO0FBQUEsTUFDL0IsZ0NBQWdDO0FBQUEsTUFDaEMsZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
