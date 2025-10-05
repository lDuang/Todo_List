import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    TanStackRouterVite(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron-main.ts',
      },
      {
        entry: 'electron-preload.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  },
})
