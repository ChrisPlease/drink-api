import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
    ],
    exclude: [
      'src/tests/**/*',
    ],
    coverage: {
      all: true,
      reportsDirectory: './coverage/unit',
      include: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
      ],
      exclude: [
        'src/index.ts',
        'src/client.ts',
        'src/tests',
        'src/__mocks__',
        'src/__generated__',
        'src/middleware',
      ],
      reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
