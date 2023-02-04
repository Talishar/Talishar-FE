/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const devURL = !!process.env.VITE_DEV_URL
    ? process.env.VITE_DEV_URL
    : 'localhost';
  const devPort = !!process.env.VITE_DEV_PORT
    ? process.env.VITE_DEV_PORT
    : '8080';
  const devDirectory = !!process.env.VITE_DEV_DIRECTORY
    ? process.env.VITE_DEV_PORT
    : 'game';

  return defineConfig({
    base: './',
    build: { outDir: './build' },
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
      proxy: {
        '/api/beta': {
          target: 'https://beta.talishar.net/game',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/api\/beta\//, '')
          // ** FOR DEBUGGING THE PROXY **
          // configure: (proxy, _options) => {
          //   proxy.on('error', (err, _req, _res) => {
          //     console.log('proxy error', err);
          //   });
          //   proxy.on('proxyReq', (proxyReq, req, _res) => {
          //     console.log('Sending Request to the Target:', req.method, req.url);
          //   });
          //   proxy.on('proxyRes', (proxyRes, req, _res) => {
          //     console.log(
          //       'Received Response from the Target:',
          //       proxyRes.statusCode,
          //       req.url
          //     );
          //   });
          // }
        },
        '/api/live': {
          target: 'https://talishar.net/game',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/api\/live\//, '')
        },
        '/api/dev': {
          target: `https://${devURL}:${devPort}/${devDirectory}`,
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
