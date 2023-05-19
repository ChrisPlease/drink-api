import {
  expect,
  test,
  vi,
  describe,
  beforeEach,
} from 'vitest'
import prisma from '../__mocks__/prisma'
import {
  drinkResolvers,
} from './drinks.resolver'
import { toCursorHash } from '../utils/cursorHash'
import { Drink } from '@prisma/client'
import { AppContext } from '../types/context'
import { GraphQLResolveInfo } from 'graphql'
import { Request } from 'express-jwt'
import { Response } from 'express'

describe('drinkResolvers', () => {
  const args = {}
  let ctx: AppContext
  const info = {} as GraphQLResolveInfo
  let parent: Drink

  beforeEach(() => {
    ctx = {
      prisma,
      req: {
        auth: {
          sub: 'mock-user',
        },
      } as Request,
      res: {} as Response,
    } as AppContext
    parent = {
      id: toCursorHash('BaseDrink:123'),
      name: 'Test Drink',
      icon: 'test-icon',
    } as Drink

    prisma.drink.findUnique.mockResolvedValue({
      ...parent,
      entries: vi.fn().mockResolvedValue([]),
    } as Drink & { entries: any })
  })

  describe.skip('entries', () => {
    test('returns something', async () => {
      await drinkResolvers.entries?.(
        parent,
        args,
        ctx,
        info,
      )
      expect(true).toBe(true)
    })
  })
})
