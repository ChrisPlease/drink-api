import {
  vi,
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import { Prisma } from '@prisma/client'
import { entriesDistinctCount } from '../utils/queries'
import prisma from '../__mocks__/prisma'
import { deconstructId, toCursorHash } from '../utils/cursorHash'
import { QueryEntriesArgs, Sort } from '../__generated__/graphql'
import { Entries } from './Entry.model'

vi.mock('../utils/queries', () => ({
  entriesDistinctCount: vi.fn().mockResolvedValue([{ count: 5 }]),
}))

describe('Entry Model', () => {
  const entry = Entries(prisma.entry)

  describe('findUniqueWithNutrition', () => {
    let mockResult: Prisma.EntryGetPayload<{
      include: {
        drink: {
          select: {
            nutrition: {
              select: {
                metricSize: true,
              },
            },
          },
        },
      },
    }>

    beforeEach(() => {
      mockResult = {
        id: toCursorHash('Entry:123'),
        volume: 12,
        timestamp: new Date(2022, 0, 0, 0),
        drinkId: toCursorHash('BaseDrink:123'),
        userId: '123',
        deleted: false,
        drink: {
          nutrition: {
            metricSize: 355,
          },
        },
      }
      prisma.entry.findUnique.mockResolvedValue(mockResult)
    })

    test('makes a call to find the entry in the database', async () => {
      await entry.findUniqueWithNutrition(mockResult.id, 'user-123')
      expect(prisma.entry.findUnique).toHaveBeenCalledWith({
        include: {
          drink: {
            include: {
              nutrition: {
                select: {
                  metricSize: true,
                  servingSize: true,
                  servingUnit: true,
                },
              },
            },
          },
        },
        where: {
          id_userId: {
            id: '123',
            userId: 'user-123',
          },
        },
      })
    })

    test('computes the nutrition based on volume', async () => {
      const res = await entry.findUniqueWithNutrition(mockResult.id, 'user-123')

      expect(res).toStrictEqual(expect.objectContaining({
        servings: 1,
        volume: 12,
      }))
    })

    test('base64 encodes the ID in the response', async () => {
      const res = await entry.findUniqueWithNutrition(mockResult.id, 'user-123')
      expect(res?.id).toEqual(toCursorHash('Entry:123'))
    })

    test('returns null when entry is not found', async () => {
      prisma.entry.findUnique.mockResolvedValue(null)
      const res = await entry.findUniqueWithNutrition(mockResult.id, 'user-123')

      expect(res).toBeNull()
    })
  })

  describe('findWithNutrition', () => {
    let mockResult: Prisma.EntryGetPayload<{
      include: {
        drink: {
          select: {
            nutrition: {
              select: {
                metricSize: true,
                servingUnit: true,
                servingSize: true,
              },
            },
          },
        },
      },
    }>[]

    beforeEach(() => {
      mockResult = [{
        id: toCursorHash('Entry:123'),
        volume: 12,
        timestamp: new Date(2022, 0, 0, 0),
        drinkId: toCursorHash('BaseDrink:123'),
        userId: '123',
        deleted: false,
        drink: {
          nutrition: {
            metricSize: 355,
            servingUnit: 'fl oz',
            servingSize: 12,
          },
        },
      }]

      prisma.entry.findMany.mockResolvedValue(mockResult)
    })

    test('makes a call to the database to retrieve entries', async () => {
      await entry.findWithNutrition({ where: { userId: '123' } })
      expect(prisma.entry.findMany).toHaveBeenCalledWith({
        include: {
          drink: {
            select: {
              nutrition: {
                select: {
                  metricSize: true,
                  servingUnit: true,
                  servingSize: true,
                },
              },
            },
          },
        },
        where: { userId: '123' },
      })
    })
  })

  describe('findDrinkByEntryId', () => {
    beforeEach(() => {
      prisma.entry.findUnique.mockReturnValue({
        drink: vi.fn().mockResolvedValue({ _count: { ingredients: 4 }, id: 'drink-123' }),
      } as any)
    })

    test('queries entry for the drink id and checks ingredients', async () => {
      expect.assertions(2)
      const res = await entry.findDrinkByEntryId(toCursorHash('drink:drink-123'))

      expect(prisma.entry.findUnique).toHaveBeenCalledWith({ where: { id: 'drink-123' }})
      expect(deconstructId(res.id)?.[0]).toEqual('MixedDrink')
    })

    test('returns base drink when no ingredients are found', async () => {
      prisma.entry.findUnique.mockReturnValue({
        drink: vi.fn().mockResolvedValue({ _count: { ingredients: 0 }, id: 'drink-123' }),
      } as any)
      const res = await entry.findDrinkByEntryId(toCursorHash('drink:drink-123'))

      expect(prisma.entry.findUnique).toHaveBeenCalledWith({ where: { id: 'drink-123' }})
      expect(deconstructId(res.id)?.[0]).toEqual('BaseDrink')

    })
  })

  describe('findUserByEntryId', () => {
    test('queries entry for the drink id and checks ingredients', async () => {
      prisma.entry.findUnique.mockReturnValue({
        user: vi.fn().mockResolvedValue({ id: 'user-123' }),
      } as any)
      expect.assertions(2)
      const res = await entry.findUserByEntryId(toCursorHash('user:user-123'))

      expect(prisma.entry.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' }})
      expect(deconstructId(res.id)?.[0]).toEqual('User')
    })
  })

  describe('findManyPaginated', () => {

  let mockDrinkId: string
  let mockArgs: QueryEntriesArgs & { userId: string }

    beforeEach(() => {
      mockDrinkId = toCursorHash('BaseDrink:drink-123')

      vi.spyOn(entry, 'findWithNutrition').mockResolvedValue(
        new Array(4).fill({}).map((_, index) => ({
          id: toCursorHash(`entry:entry-${index}`),
          volume: 12 % index,
          servings: 2,
          drinkId: mockDrinkId,
        })),
      )
    })
    test('makes a call to findWithNutrition with the provided args', async () => {
      mockArgs = {
        filter: {
          search: 'f',
        },
        sort: {
          volume: Sort.Asc,
        },
        drinkId: mockDrinkId,
        userId: 'user-123',
      }
      await entry.findManyPaginated(prisma, mockArgs)

      expect(entry.findWithNutrition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { volume: 'ASC' },
          where: {
            AND: [
              { userId: 'user-123' },
              { deleted: false },
              { drinkId: 'drink-123' },
              {
                drink: { name: { contains: 'f', mode: 'insensitive' } },
              },
            ],
          },
        }),
      )
    })

    test('does something else', async () => {
      mockArgs = {
        ...mockArgs,
        filter: { distinct: true },
      }
      await entry.findManyPaginated(prisma, mockArgs)
    })
  })

  describe('createEntry', () => {
    test('', () => {
      expect(true).toBeTruthy()
    })
  })

  test('true should be true', () => {
    expect(true).toBe(true)
  })
})
