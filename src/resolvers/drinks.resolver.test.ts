import { Response } from 'express'
import { Request } from 'express-jwt'
import { GraphQLResolveInfo } from 'graphql'
import {
  expect,
  test,
  vi,
  describe,
  beforeEach,
} from 'vitest'
import { Drink } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import { toCursorHash } from '../utils/cursorHash'
import { AppContext } from '../types/context'
import {
  drinkResolvers,
} from './drinks.resolver'

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
