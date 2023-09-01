/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const devURL = !!process.env.VITE_BACKEND_URL
    ? process.env.VITE_BACKEND_URL
    : 'localhost';
  const devPort = !!process.env.VITE_BACKEND_PORT
    ? process.env.VITE_BACKEND_PORT
    : '8080';
  const devDirectory = !!process.env.VITE_BACKEND_DIRECTORY
    ? process.env.VITE_BACKEND_DIRECTORY
    : 'game';

  const http = process.env.DEV ? 'http' : 'https';

  return defineConfig({
    base: './',
    build: { outDir: './build' },
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
      proxy: {
        '/api': {
          target: `${http}://${devURL}:${devPort}/${devDirectory}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/api\/dev\//, '')
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      coverage: {
        provider: 'c8'
      },
      setupFiles: './src/setupTests.ts'
    }
  });
};
