import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      TanStackRouterVite(),
    ],
    base: './', // Electron 需要相对路径
    build: {
      outDir: 'dist', // 输出目录
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 路径别名
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 3000, // Use port from .env file or default to 3000
    },
  }
})
