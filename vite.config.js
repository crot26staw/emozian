import { defineConfig } from 'vite';
import pxToRem from 'postcss-pxtorem';
import { designRootSize } from './src/js/layout-units.js';

export default defineConfig({
  css: {
    postcss: {
      plugins: [pxToRem({ rootValue: designRootSize, propList: ['*'], unitPrecision: 6, mediaQuery: false })],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
