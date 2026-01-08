import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
      interval: 100,
    },
    strictPort: true,
    // hmr: {
      // protocol: 'wss',
      // clientPort: 8443, 
    // },
  },
});