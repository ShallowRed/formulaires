import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base: the build works at the domain root, under a sub-path
  // (GitHub Pages) and inside an iframe, with hash routing
  base: './',
  plugins: [vue()],
})
