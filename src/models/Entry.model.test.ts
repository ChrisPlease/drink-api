import {
  vi,
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import { Entry } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import { toCursorHash } from '../utils/cursorHash'
import { Entries } from './Entry.model'

describe('Entry Model', () => {
  const entry = Entries(prisma.entry)

  describe('computeNutrition', () => {
    test('calculates and nutritional content', () => {
      expect(entry.computeNutrition({
        caffeine: 12,
        sugar: 12,
        coefficient: 1,
        servingSize: 12,
      }, 12)).toEqual({
        caffeine: 12,
        sugar: 12,
        waterContent: 12,
        servings: 1,
      })
    })
  })

  describe('findUniqueWithNutrition', () => {
    let mockResult: Entry & {
      drink?: {
        caffeine: number,
        sugar: number,
        coefficient: number,
      },
    }

    beforeEach(() => {
      mockResult = {
        id: toCursorHash('Entry:123'),
        volume: 12,
        timestamp: new Date(2022, 0, 0, 0),
        drinkId: toCursorHash('BaseDrink:123'),
        userId: '123',
        deleted: false,
        drink: {
          caffeine: 1,
          sugar: 1,
          coefficient: 1,
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
              caffeine: true,
              coefficient: true,
              sugar: true,
              servingSize: true,
            },
          },
        },
        where: {
          id: '123',
          userId: 'user-123',
        },
      })
    })

    test('computes the nutrition based on volume', async () => {
      expect.assertions(2)
      vi.spyOn(entry, 'computeNutrition')
      const res = await entry.findUniqueWithNutrition(mockResult.id, 'user-123')

      expect(entry.computeNutrition).toHaveBeenCalled()
      expect(res).toStrictEqual(expect.objectContaining({
        caffeine: 12,
        sugar: 12,
        waterContent: 12,
      }))
    })

    test('base64 encodes the ID in the response', async () => {
      const res = await entry.findUniqueWithNutrition(mockResult.id, 'user-123')
      expect(res?.id).toEqual(toCursorHash('Entry:123'))
    })
  })

  describe('findWithNutrition', () => {
    let mockResult: (Entry & {
      drink?: {
        caffeine: number,
        sugar: number,
        coefficient: number,
      },
    })[]

    beforeEach(() => {
      mockResult = [{
        id: toCursorHash('Entry:123'),
        volume: 12,
        timestamp: new Date(2022, 0, 0, 0),
        drinkId: toCursorHash('BaseDrink:123'),
        userId: '123',
        deleted: false,
        drink: {
          caffeine: 1,
          sugar: 1,
          coefficient: 1,
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
              caffeine: true,
              sugar: true,
              coefficient: true,
              servingSize: true,
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
