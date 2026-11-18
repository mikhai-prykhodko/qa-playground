import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE is set to "/<repo-name>/" when building for GitHub Pages.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
});
