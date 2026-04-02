import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { figmaAssetsPlugin } from './vite-plugin-figma-assets'

export default defineConfig({
  plugins: [
    // Resolves Figma Make `figma:asset/...` imports; missing files use a tiny
    // transparent PNG so production builds (e.g. Docker) succeed. Drop real
    // assets into src/assets/figma/<hash>.png to replace placeholders.
    figmaAssetsPlugin(__dirname),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // Alias for root-level utils folder
      '@utils': path.resolve(__dirname, './utils'),
    },
  },
})