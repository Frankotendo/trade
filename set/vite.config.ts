
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const apiKey = env.API_KEY || 
                 process.env.API_KEY || 
                 env.GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY ||
                 env.VITE_API_KEY;

  return {
    plugins: [react()],
    base: '/',
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
    server: {
      port: 3000,
      host: true
    }
  };
});
