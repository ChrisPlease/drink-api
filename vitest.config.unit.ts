import path from 'node:path'
import { defineConfig } from 'vitest/config'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: path.resolve(__dirname, '.env.test') })

export default defineConfig({
  test: {
    setupFiles: ['dotenv/config'],
  },
  plugins: [
    viteTsconfigPaths(),
  ],
})
