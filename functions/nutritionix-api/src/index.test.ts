import { describe, expect, test } from 'vitest'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { Context } from 'aws-lambda'
import { handler } from '.'

const mockAgent = new MockAgent()

setGlobalDispatcher(mockAgent)

const mockPool = mockAgent.get(`${process.env.NUTRITIONIX_API}/v2`)

mockPool.intercept({
  path: '/search/item',
})

describe('this', () => {
  test('this', async () => {
    // console.log(process.env.NUTRITIONIX_API)
    // const foo = await handler({ upc: '123' }, {} as Context, () => {})

    // console.log(foo)
    expect(true).toBeTruthy()
  })
})
