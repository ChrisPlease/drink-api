import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { Nutrition } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import redis from '../__mocks__/redis'
import { Entries } from '../models/Entry.model'
import { AppContext } from '../types/context'
import { DrinkNutrition } from '../__generated__/graphql'
import { entryResolvers } from './entries.resolver'

vi.mock('../models/Entry.model', () => {
  const prismaEntry = vi.importActual('../models/Entry.model')
  return {
    Entries: vi.fn().mockReturnValue({
      ...prismaEntry,
      findDrinkByEntryId: vi.fn().mockResolvedValue({ id: '123' }),
      findUserByEntryId: vi.fn().mockResolvedValue({ id: '123' }),
    }),
  }
})

describe('entryResolvers', () => {
  let ctx: AppContext

  beforeEach(() => {
    ctx = {
      prisma,
      redis,
      req: {} as Request,
      res: {} as Response,
    }
  })

  describe('drink', () => {
    test('calls to the Entry.findDrinkByEntryId method', async () => {
      await entryResolvers.drink({ id: '123' }, {}, ctx, {})

      expect(Entries(prisma.entry).findDrinkByEntryId).toHaveBeenCalledWith('123')
    })
  })

  describe('nutrition', () => {
    beforeEach(() => {
      prisma.nutrition.findUnique.mockResolvedValue({
        servingSize: 1,
        servingUnit: 'bottle',
        metricSize: 355,
        imperialSize: 12,
        coefficient: 50,
        caffeine: 12,
        drinkId: 'drink-123',
      } as Nutrition)
    })
    test('makes a call to prisma to find the nutrition', async () => {
      await entryResolvers.nutrition({ drinkId: 'drink-123', volume: 12 }, {}, ctx, {})

      expect(prisma.nutrition.findUnique).toHaveBeenCalledWith({
        where: { drinkId: 'drink-123' },
      })
    })

    test('returns the revised nutrition based on entry input', async () => {
      const res = await entryResolvers.nutrition({ drinkId: 'drink-123', volume: 6 }, {}, ctx, {})
      expect(res).toEqual({
        caffeine: 6,
        water: 3,
      })
    })
  })

  describe('user', () => {
    test('calls to the Entry.findUserByEntryId method', async () => {
      await entryResolvers.user({ id: '123' }, {}, ctx, {})

      expect(Entries(prisma.entry).findUserByEntryId).toHaveBeenCalledWith('123')
    })
  })
})
