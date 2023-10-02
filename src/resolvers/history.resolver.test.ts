import {
  vi,
  beforeEach,
  describe,
  test,
  expect,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import prisma from '../__mocks__/prisma'
import { Drinks } from '../models/Drink.model'
import { Entries } from '../models/Entry.model'
import { AppContext } from '../types/context'
import { toCursorHash } from '../utils/cursorHash'
import { historyResolvers } from './history.resolver'

vi.mock('../models/Drink.model', () => ({
  Drinks: vi.fn().mockReturnValue({
    ...prisma.drink,
    findUniqueById: vi.fn().mockResolvedValue({ id: 'mock' }),
  }),
}))

vi.mock('../models/Entry.model', () => ({
  Entries: vi.fn().mockReturnValue({
    ...prisma.entry,
    findManyPaginated: vi.fn().mockResolvedValue({
      entries: {
        edges: [{ id: 'mock' }],
      },
    }),
  }),
}))

describe('historyResolvers', () => {
  let ctx: AppContext

  beforeEach(() => {
    ctx = {
      prisma,
      redis: {} as any,
      req: {} as Request,
      res: {} as Response,
    }
  })

  describe('drink', () => {
    test('calls the DrinkModel.findByUnique', async () => {
      await historyResolvers.drink({ drink: { id: '123' } }, {}, ctx)
      expect(Drinks(prisma.drink).findUniqueById).toHaveBeenCalledWith('123')
    })
  })

  describe('entries', () => {
    test('calls the EntriesModel.findManyPaginated', async () => {
      await historyResolvers.entries({
        id: toCursorHash('123'),
        userId: '123',
      }, {}, ctx)
      expect(
        Entries(prisma.entry).findManyPaginated,
      ).toHaveBeenCalledWith(prisma, expect.any(Object))
    })
  })
})

