import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts'],
    threads: false,
    setupFiles: ['src/tests/helpers/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
