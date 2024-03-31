import path from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'
import rootConfig from '../../vitest.config.unit'


export default mergeConfig(rootConfig, defineConfig({
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
      ],
      reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
