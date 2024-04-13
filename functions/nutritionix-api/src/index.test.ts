import { beforeEach, describe, expect, test } from 'vitest'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { Context } from 'aws-lambda'
import { handler } from '.'

const mockAgent = new MockAgent()

setGlobalDispatcher(mockAgent)

const mockPool = mockAgent.get(`${process.env.NUTRITIONIX_API}`)

mockPool.intercept({
  path: '/v2/search/item',
  method: 'GET',
  query: {
    upc: '123',
  },
  headers: {
    'x-app-id': process.env.NUTRITIONIX_APP_ID,
    'x-app-key': process.env.NUTRITIONIX_API_KEY,
  },
}).reply(200, {
  status: { ok: true },
  message: 'transaction processed',
})

describe('this', () => {
  let ctx: Context
  const cb = () => {}

  beforeEach(() => {
    ctx = {} as Context
  })
  test('this', async () => {
    // console.log(process.env.NUTRITIONIX_API)
    const foo = await handler({ upc: '123' }, ctx, cb)

    console.log(foo)
    expect(true).toBeTruthy()
  })
})
