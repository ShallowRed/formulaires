import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // The peer dependencies and the dependencies are installed by the consumer: one Vue and one JSON Forms per app
      external: [/^vue$/, /^@jsonforms\//, /^@gouvminint\/vue-dsfr/, /^ajv/],
    },
  },
  test: {
    environment: 'happy-dom',
  },
})
