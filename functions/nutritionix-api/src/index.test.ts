import { beforeEach, describe, expect, test } from 'vitest'
import { MockAgent, setGlobalDispatcher } from 'undici'
import { Context } from 'aws-lambda'
import { handler } from '.'

const mockAgent = new MockAgent()

setGlobalDispatcher(mockAgent)

const mockPool = mockAgent.get(`${process.env.NUTRITIONIX_API}`)
const mockItem = {
  upc: '123',
  serving: {
    servingSize: 8,
    servingUnit: 'fl oz',
    metricSize: undefined,
  },
  nutrition: {
    calories: 0,
    totalFat: 0,
    saturatedFat: 0,
    sodium: 0,
    carbohydrates: 0,
    sugar: 0,
    addedSugar: 0,
    protein: 0,
    potassium: 0,
  },
}

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
  foods: [mockItem],
  message: 'transaction processed',
})

describe('nutritionix handler', () => {
  let ctx: Context
  const cb = () => {}

  beforeEach(() => {
    ctx = {} as Context
  })
  test('returns a `NutritionixItem` object', async () => {
    const res = await handler({ upc: '123' }, ctx, cb)

    expect(res).toEqual(mockItem)
  })
})
