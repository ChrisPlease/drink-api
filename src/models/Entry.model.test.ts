import {
  vi,
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import { Entry, Prisma } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import { toCursorHash } from '../utils/cursorHash'
import { Entries } from './Entry.model'

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

  test('true should be true', () => {
    expect(true).toBe(true)
  })
})
