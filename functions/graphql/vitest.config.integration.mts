import path from 'node:path'
import { mergeConfig, defineConfig } from 'vitest/config'
import rootConfig from '../../vitest.config.integration.mts'

export default mergeConfig(
  rootConfig,

  defineConfig({
    test: {
      include: ['src/tests/**/*.test.ts'],
      setupFiles: ['src/tests/helpers/setup.ts'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '/opt/nodejs': path.resolve(__dirname, '../..', 'layers/prisma/nodejs'),
      },
      coverage: {

        all: true,
        reportsDirectory: './coverage/integration',
        include: [
          'src/**/*.ts',
          '!src/**/*.test.ts',

        ],
        exclude: [
          'src/tests/*',
          'src/**/*.test.ts',
          'src/index.ts',
          'src/client.ts',
          'src/__mocks__',
          'src/__generated__',
        ],
        reporter: ['html', 'json', 'lcov', 'text', 'text-summary'],
        provider: 'istanbul',
      },
    },
  }),
)
