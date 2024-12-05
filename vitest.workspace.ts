import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./vitest.config.unit.ts",
  "./vitest.config.integration.ts",
  "./functions/nutritionix-api/vitest.config.unit.ts",
  "./functions/graphql/vitest.config.integration.ts",
  "./functions/graphql/vitest.config.unit.ts",
  "./functions/authorizer/vitest.config.unit.ts",
  "./functions/auth-callback/vitest.config.unit.ts"
])
