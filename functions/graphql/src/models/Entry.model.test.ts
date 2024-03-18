import {
  vi,
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import { Prisma } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import { deconstructId, encodeCursor, toCursorHash } from '../utils/cursorHash'
import { MutationEntryCreateArgs, QueryEntriesArgs, Sort } from '../__generated__/graphql'
import { entriesDistinctCount } from '../utils/queries'
import { ResolvedEntry } from '../types/models'
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
            metricSize: true,
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
          metricSize: 355,
        },
      }
      prisma.entry.findUnique.mockResolvedValue(mockResult)
    })

    test('makes a call to find the entry in the database', async () => {
      await entry.findUniqueWithNutrition(mockResult.id, 'user-123')
      expect(prisma.entry.findUnique).toHaveBeenCalledWith({
        include: {
          drink: {
            select: {
              metricSize: true,
              servingSize: true,
              servingUnit: true,
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
            metricSize: true,
            servingUnit: true,
            servingSize: true,
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
          metricSize: 355,
          servingUnit: 'fl oz',
          servingSize: 12,
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
              metricSize: true,
              servingUnit: true,
              servingSize: true,
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
        })) as ResolvedEntry[],
      )
    })

    test('provides a default empty filter when none is provided', async () => {
      mockArgs = { userId: 'user-123' }
      await entry.findManyPaginated(prisma, mockArgs)

      expect(entry.findWithNutrition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            drink: {
              name: 'desc',
            },
          },
          where: {
            AND: [{
              userId: 'user-123',
            },{
              deleted: false,
            }],
          },
        }),
      )
    })

    test('makes a call to findWithNutrition with the provided args', async () => {
      const after = toCursorHash(
        JSON.stringify(encodeCursor({ id: 'mock-id-1'}, [])),
      )
      mockArgs = {
        first: 4,
        after,
        filter: {
          search: 'f',
          limit: new Date(2022, 12, 12),
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
          skip: 1,
          take: 5,
          cursor: {
            id: 'mock-id-1',
          },
          orderBy: { volume: 'ASC' },
          where: {
            AND: [
              { userId: 'user-123' },
              { deleted: false },
              { drinkId: 'drink-123' },
              { timestamp: { gt: new Date(2022, 12, 12) } },
              {
                drink: { name: { contains: 'f', mode: 'insensitive' } },
              },
            ],
          },
        }),
      )
    })

    test('makes a call to `entriesDistinctCount` when searching distinct entries', async () => {
      mockArgs = {
        ...mockArgs,
        first: 3,
        filter: { distinct: true },
      }
      await entry.findManyPaginated(prisma, mockArgs)
      expect(entriesDistinctCount).toHaveBeenCalledWith(expect.anything(), {
        userId: 'user-123',
        drinkId: 'drink-123',
      })
    })
  })

  describe('createEntry', () => {
    let mockArgs: MutationEntryCreateArgs & { userId: string }

    beforeEach(() => {
      mockArgs = {
        drinkId: toCursorHash('BaseDrink:drink-123'),
        volume: 12,
        unit: 'fl oz',
        userId: 'user-123',
      }

      prisma.drink.findUnique.mockReturnValue({
        nutrition: vi.fn().mockResolvedValue({
          servingUnit: 'fl oz',
          servingSize: 12,
          metricSize: 355,
        }),
      } as any)

      prisma.entry.create.mockResolvedValue({
        id: 'entry-123',
        volume: 12,
        userId: 'user-123',
        deleted: false,
        drinkId: 'drink-123',
        timestamp: new Date(2022, 12, 12),
      })
    })

    test('queries prisma to find the drink nutrition', async () => {
      await entry.createEntry(mockArgs, prisma.drink)
      expect(prisma.drink.findUnique).toHaveBeenCalledWith({ where: { id: 'drink-123' }, select: { metricSize: true, servingUnit: true, servingSize: true } })
    })

    test('creates the entry', async () => {
      await entry.createEntry(mockArgs, prisma.drink)
      expect(prisma.entry.create).toHaveBeenCalledWith({
        data: {
          drinkId: 'drink-123',
          userId: 'user-123',
          volume: 12,
        },
      })
    })

    test('returns the entry with a hashed id', async () => {
      const res = await entry.createEntry(mockArgs, prisma.drink)
      expect(res).toEqual(
        expect.objectContaining({
          id: toCursorHash('Entry:entry-123'),
        }),
      )
    })
  })

  describe('deleteAndReturn', () => {
    let mockDrinkId: string

    beforeEach(() => {
      mockDrinkId = toCursorHash('BaseDrink:123')

      prisma.$transaction.mockImplementation(callback => callback(prisma))
      prisma.entry.delete.mockResolvedValue({
        id: 'entry-123',
        drinkId: mockDrinkId,
      } as ResolvedEntry)
      prisma.drink.findUnique.mockReturnValue({
        nutrition: vi.fn().mockResolvedValue({ servingSize: 12 }),
      } as any)

    })

    test('initiates a transaction', async () => {
      await entry.deleteAndReturn({ userId: 'user-123', id: toCursorHash('Entry:123') }, prisma)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('deletes the provided entry', async () => {
      await entry.deleteAndReturn({ userId: 'user-123', id: toCursorHash('Entry:123') }, prisma)
      expect(prisma.entry.delete).toHaveBeenCalledWith({
        where: {
          id_userId: {
            id: '123',
            userId: 'user-123',
          },
        },
      })
    })

    test('retrieves the nutrition of the deleted entry drink', async () => {
      await entry.deleteAndReturn({ userId: 'user-123', id: toCursorHash('Entry:123') }, prisma)
      expect(prisma.drink.findUnique).toHaveBeenCalledWith({
        where: { id: mockDrinkId },
        select: { metricSize: true },
      })
    })

    test('returns the deleted entry', async () => {
      const res = await entry.deleteAndReturn({ userId: 'user-123', id: toCursorHash('Entry:123') }, prisma)

      expect(res).toEqual(
        expect.objectContaining({
          id: '123',
          drinkId: mockDrinkId,
        }),
      )
    })
  })
})
