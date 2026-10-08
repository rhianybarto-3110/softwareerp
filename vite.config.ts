import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const apiPlugin = (): Plugin => ({
  name: 'api-server-middleware',
  apply: 'serve',
  async configureServer(server) {
    const express = (await import('express')).default;
    const { createApiRouter } = await import('./server/api.ts');
    const app = express();
    app.use('/api', createApiRouter());
    server.middlewares.use(app);
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
