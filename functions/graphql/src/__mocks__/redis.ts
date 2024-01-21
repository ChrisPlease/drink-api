import { createClient } from 'redis'
import { beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'

beforeEach(() => {
  mockReset(redis)
})

const redis = mockDeep<ReturnType<typeof createClient>>()
export default redis
