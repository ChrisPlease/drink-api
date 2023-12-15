import {
  vi,
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import prisma from '../__mocks__/prisma'
import { deconstructId, toCursorHash } from '../utils/cursorHash'
import { QueryDrinksHistoryArgs } from '../__generated__/graphql'
import { RawEntry } from '../types/queries'
import { queryDrinkHistory } from '../utils/queries'
import { DrinkHistory } from './History.model'

vi.mock('../utils/queries', () => ({
  queryDrinkHistory: vi.fn()
    .mockResolvedValueOnce([])
    .mockResolvedValue([{
      id: '123',
      total_volume: 4,
      water_volume: 4,
    }] as RawEntry[]),
}))

describe('DrinkHistory', () => {
  const history = DrinkHistory(prisma)

  beforeEach(() => {
    prisma.$transaction.mockImplementation(callback => callback(prisma))
  })

  describe('findUniqueDrinkHistory', () => {
    let mockHistoryId: string

    beforeEach(() => {
      mockHistoryId = toCursorHash('DrinkHistory:drink-123')

      // eslint-disable-next-line
      // @ts-ignore
      prisma.entry.groupBy.mockResolvedValue([{ _count: 3, _sum: { volume: 36 } }])
      prisma.drink.findUnique.mockReturnValue({
        nutrition: vi.fn().mockResolvedValue({ coefficient: 0.5 }),
      } as any)
    })

    test('initiates a transaction to retrieve drink history', async () => {
      await history.findUniqueDrinkHistory(toCursorHash('DrinkHistory:drink-123'), 'user-123')

      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('makes a call to prisma to group entries', async () => {
      await history.findUniqueDrinkHistory(toCursorHash('DrinkHistory:drink-123'), 'user-123')
      expect(prisma.entry.groupBy).toHaveBeenCalledWith({
        _count: true,
        _max: {
          timestamp: true,
        },
        _sum: {
          volume: true,
        },
        by: ['drinkId', 'userId'],
        where: {
          deleted: false,
          drinkId: 'drink-123',
          userId: 'user-123',
        },
      })
    })

    test('makes a call to prisma to retrieve nutritional information', async () => {
      await history.findUniqueDrinkHistory(toCursorHash('DrinkHistory:drink-123'), 'user-123')
      expect(prisma.drink.findUnique).toHaveBeenCalledWith({
        where: { id: 'drink-123' },
      })
    })

    test('returns a drink history object with hashed id', async () => {
      const res = await history.findUniqueDrinkHistory(toCursorHash('DrinkHistory:drink-123'), 'user-123')

      expect(res).toEqual({
        id: mockHistoryId,
        count: 3,
        volume: 36,
        water: 18,
      })
    })
  })

  describe('findManyPaginated', () => {
    let mockArgs: QueryDrinksHistoryArgs & { userId: string }

    beforeEach(() => {
      mockArgs = {
        userId: 'user-123',
      }

      prisma.drink.count.mockResolvedValue(1)
    })

    test('makes a raw query to `queryDrinkHistory`', async () => {
      await history.findManyPaginated(mockArgs)
      expect(queryDrinkHistory).toHaveBeenCalledWith(
        prisma,
        expect.objectContaining({
          userId: 'user-123',
        }),
      )
    })

    test('hashes the id on response', async () => {
      const res = await history.findManyPaginated(mockArgs)
      expect(
        deconstructId(res.nodes[0].id)?.[1],
      ).toEqual('123')
    })
  })
})
