import path from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'
import rootConfig from '../../vitest.config.unit'

export default mergeConfig(rootConfig, defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
    ],
    coverage: {
      all: true,
      reportsDirectory: './coverage/unit',
      include: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
      ],
      reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
