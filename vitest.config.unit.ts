import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      all: true,
      include: [
        'src/**/*.test.ts',
        '!src/tests',
      ],
      exclude: [
        'src/types/*',
        'src/**/*.test.ts',
        'prisma/*',
        '__mocks__/*',
      ],
    },
  },
})
