import { defineConfig } from 'vite';

export default defineConfig({
  // This ensures paths are handled correctly relative to the root
  base: './', 
  build: {
    // This helps resolve Three.js and other node_modules
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['three']
  }
});