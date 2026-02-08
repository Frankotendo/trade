
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load environment variables from the actual shell/system env
  const env = loadEnv(mode, process.cwd(), '');
  
  // Vercel and AI Studio use different naming conventions sometimes.
  // This ensures we catch the key regardless of where it's defined.
  const apiKey = env.API_KEY || 
                 process.env.API_KEY || 
                 env.GEMINI_API_KEY || 
                 process.env.GEMINI_API_KEY ||
                 env.VITE_API_KEY;

  return {
    plugins: [react()],
    define: {
      // In Vite, process.env is not available by default in the client.
      // This "define" acts as a search-and-replace during build time.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1600,
    }
  };
});
