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
      reporter: ['html', 'json', 'lcov'],
      provider: 'istanbul',
    },
    alias: {
      '@': 'src',
    },
  },
})
