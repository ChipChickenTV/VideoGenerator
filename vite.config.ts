import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: 'showcase',
  publicDir: '../public',
  plugins: [react(), tsconfigPaths({
    root: '../'
  })],
  server: {
    port: 3000,
    host: '0.0.0.0', // 외부 접근 허용
  },
  build: {
    outDir: '../dist-showcase',
    emptyOutDir: true,
  },
});