import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'functions/**/*.test.ts',
    ],
    exclude: [
      'functions/**/tests/**/*',
    ],
    coverage: {
      all: true,
      reportsDirectory: './coverage/unit',
      include: [
        'functions/**/*.ts',
        '!functions/**/*.test.ts',
      ],
      exclude: [
        'functions/index.ts',
        'functions/client.ts',
        'functions/tests',
        'functions/__mocks__',
        'functions/__generated__',
        'functions/middleware',
      ],
      reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
    },
    alias: {
      '@': path.resolve(__dirname, './functions'),
    },
  },
})
