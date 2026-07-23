import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/web', import.meta.url)),
    },
  },
  test: {
    include: ['packages/**/*.test.ts', 'apps/web/lib/**/*.test.ts'],
    environment: 'node',
  },
})
