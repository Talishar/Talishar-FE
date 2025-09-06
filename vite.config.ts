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

  return defineConfig({
    base: './',
    build: { outDir: './build' },
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
      proxy: {
        '/api': {
          target: `http://${devURL}:${devPort}/${devDirectory}`,
          changeOrigin: true,
          secure: process.env.NODE_ENV === 'production',
          rewrite: (path) => path.replace(/api\//, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              //console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              //console.log('Sending request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              //console.log('Received response:', proxyRes.statusCode, req.url);
            });
          }
        },
        '/datadoll': {
          target: `http://${process.env.VITE_DATADOLL_BACKEND}:${process.env.VITE_DATADOLL_PORT}/${process.env.VITE_DATADOLL_DIRECTORY}`,
          changeOrigin: true,
          secure: process.env.NODE_ENV === 'production'
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
