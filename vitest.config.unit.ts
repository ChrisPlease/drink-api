import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      '!src/tests/**',
    ],
    coverage: {
      all: true,
      include: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!coverage',
      ],
      exclude: [
        'coverage/**',
        'src/tests',
        'src/types',
        'prisma/**',
        '__mocks__/**',
      ],
    },
  },
})
