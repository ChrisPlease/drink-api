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
    coverage: {

      all: true,
      reportsDirectory: './coverage/integration',
      include: [
        'src/**/*.ts',
        '!src/**/*.test.ts',

      ],
      exclude: [
        'src/tests/*',
        'src/**/*.test.ts',
        'src/index.ts',
        'src/client.ts',
        'src/__mocks__',
        'src/__generated__',
        'src/middleware',
      ],
      reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
    },
  },
})
