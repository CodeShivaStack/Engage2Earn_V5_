import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['process', 'buffer', 'stream-browserify', 'util'], // Ensure these dependencies are included in optimization
  },
  resolve: {
    alias: {
      util: path.resolve(__dirname, 'node_modules/util/'),
      buffer: path.resolve(__dirname, 'node_modules/buffer/'),
      process: path.resolve(__dirname, 'node_modules/process/'),
      stream: path.resolve(__dirname, 'node_modules/stream-browserify/'),
    },
  },
  define: {
    // Polyfill process globally (this is for replacing 'process.env' references in the code)
    'process.env': {},
  },
});

