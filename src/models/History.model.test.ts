import {
  describe,
  beforeEach,
  test,
  expect,
  vi,
} from 'vitest'
import prisma from '../../__mocks__/prisma'
import { DrinkHistory } from './History.model'
import { Prisma } from '@prisma/client'

vi.mock('../../__mocks__/prisma', () => ({
  default: () => ({
    ...prisma,
    groupBy: vi.fn(),
  }),
}))

describe('DrinkHistory', () => {
  const history = DrinkHistory(prisma)

  describe('findDrinkHistory', () => {
    let mockArgs: Pick<Prisma.EntryAggregateArgs, 'where'>
    let mockResponse: any

    beforeEach(() => {

      // vi.spyOn((prisma.entry as any), 'groupBy').mockResolvedValue([{
      //   _count: 1,
      //   _max: 1,
      //   _sum: 1,
      // }])
    })

    test('is true', () => {
      expect(true).toBeTruthy()
    })
    // test('foo', async () => {
    //   const foo = await history.findDrinkHistory({
    //     where: { userId: '123', drinkId: '123' },
    //   })

    //   console.log(foo)
    // })
  })
})
