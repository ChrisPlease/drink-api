import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: [
        'src/types/*',
        'src/**/*.test.ts',
        'prisma/*',
        '__mocks__/*',
      ],
    },
  },
})
