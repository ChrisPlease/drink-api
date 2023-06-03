import { createClient } from 'redis'
import { beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

beforeEach(() => {
  mockReset(redis)
})

export const redis = mockDeep<ReturnType<typeof createClient>>()
