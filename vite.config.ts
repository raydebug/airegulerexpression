import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/ollama/, '');
          switch (newPath) {
            case '/generate':
              return '/api/chat';
            case '/version':
              return '/api/version';
            default:
              return `/api${newPath}`;
          }
        },
      },
    },
  },
}); 