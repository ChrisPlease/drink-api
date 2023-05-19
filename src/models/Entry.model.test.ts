import {
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import prisma from '../__mocks__/prisma'
import { Entries } from './Entry.model'
import { Entry } from '@prisma/client'
import { toCursorHash } from '../utils/cursorHash'

describe('Entry Model', () => {
  const entry = Entries(prisma.entry)

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
      await entry.findUniqueWithNutrition({ where: { id: '123' } })
      expect(prisma.entry.findUnique).toHaveBeenCalledWith({
        include: {
          drink: {
            select: {
              caffeine: true,
              coefficient: true,
              sugar: true,
            },
          },
        },
        where: { id: '123' },
      })
    })

    test('computes the nutrition based on volume', async () => {
      const res = await entry.findUniqueWithNutrition({
        where: { id: '123' },
      })

      expect(res).toStrictEqual(expect.objectContaining({
        caffeine: 12,
        sugar: 12,
        waterContent: 12,
      }))
    })

    test('base64 encodes the ID in the response', async () => {
      const res = await entry.findUniqueWithNutrition({
        where: { id: '123' },
      })
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
            select: { caffeine: true, sugar: true, coefficient: true },
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
