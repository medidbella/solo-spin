import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
    },
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'wss',
      clientPort: 8443,
    },
  },
});