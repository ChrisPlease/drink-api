import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['functions/**/tests/**/*.test.ts'],
    threads: false,
    setupFiles: ['functions/graphql/tests/helpers/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './functions'),
    },
    coverage: {

      all: true,
      reportsDirectory: './coverage/integration',
      include: [
        'functions/**/*.ts',
        '!functions/**/*.test.ts',

      ],
      exclude: [
        'functions/**/tests/*',
        'functions/**/*.test.ts',
        'functions/**/index.ts',
        'functions/**/client.ts',
        'functions/**/__mocks__',
        'functions/**/__generated__',
      ],
      reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
      provider: 'istanbul',
    },
  },
})
