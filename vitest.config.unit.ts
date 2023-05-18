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
        'src/**/*.test.ts',
        '!src/tests/**',
      ],
      exclude: [
        'src/tests/**',
        'src/types/*',
        'src/**/*.test.ts',
        'prisma/*',
        '__mocks__/*',
      ],
    },
  },
})
