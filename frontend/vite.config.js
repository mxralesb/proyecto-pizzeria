import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['motion-utils', 'motion-dom']
  },
  ssr: {
    noExternal: ['framer-motion', 'motion-utils', 'motion-dom']
  }
});
