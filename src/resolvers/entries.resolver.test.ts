import {
  vi,
  describe,
  test,
  expect,
  beforeEach,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import prisma from '../__mocks__/prisma'
import { Entries } from '../models/Entry.model'
import { AppContext } from '../types/context'
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
  describe('user', () => {
    test('calls to the Entry.findUserByEntryId method', async () => {
      await entryResolvers.user({ id: '123' }, {}, ctx, {})

      expect(Entries(prisma.entry).findUserByEntryId).toHaveBeenCalledWith('123')
    })
  })
})
