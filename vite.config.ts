import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  base: '/japan-interactive-map/',
  plugins: [
    dts({
      include: ['src/**/*'],
      outDir: 'dist',
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
});