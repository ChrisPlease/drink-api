import {
  expect,
  test,
  describe,
  beforeEach,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { GraphQLResolveInfo } from 'graphql'
import { Drink, Entry } from '@prisma/client'
import { queryResolvers } from './query.resolver'
import prisma from '@/__mocks__/prisma'
import { AppContext } from '@/types/context'
import { toCursorHash } from '@/utils/cursorHash'
import { DrinkHistory } from '@/types/models'

describe('queryResolvers', () => {
  let ctx: AppContext

  beforeEach(() => {
    ctx = {
      prisma,
      req: {} as Request,
      res: {} as Response,
    }
  })

  describe('node', () => {
    let node: Drink | Entry | DrinkHistory
    let mockId: string

    test('makes a call to drink.findUnique when type is Drink', async () => {
      expect.assertions(2)
      prisma.drink.findUnique.mockResolvedValue(({
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
      } as Drink))
      mockId = toCursorHash('BaseDrink:123')

      node = await queryResolvers.node?.(
        {},
        { id: mockId },
        ctx,
        {} as GraphQLResolveInfo,
      ) as Drink

      expect(prisma.drink.findUnique).toHaveBeenCalled()
      expect(node).toEqual({ ...node })
    })

    test('makes a call to entry.findUnique when type is Entry', async () => {
      expect.assertions(2)
      prisma.entry.findUnique.mockResolvedValue(({
        id: '123',
        volume: 8,
        drink: {
          caffeine: 12,
          sugar: 12,
          coefficient: 1,
          servingSize: 8,
        },
      } as Entry & { drink: Partial<Drink> }))
      mockId = toCursorHash('Entry:123')

      node = await queryResolvers.node?.(
        {},
        { id: mockId },
        ctx,
        {} as GraphQLResolveInfo,
      ) as Entry

      expect(prisma.entry.findUnique).toHaveBeenCalled()
      expect(node).toEqual({
        caffeine: 12,
        id: 'RW50cnk6MTIz',
        sugar: 12,
        volume: 8,
        waterContent: 8,
        servings: 1,
       })
    })

    test.todo('makes calls to `entry.groupBy` and `drink.findUnique` when type is DrinkHistory', () => {
      // prisma.entry.groupBy.mockResolvedValue([{}])

      mockId = toCursorHash('DrinkHistory:123')

    })
  })

  describe('drink', () => {
    let drink: Drink
    let mockId: string

    beforeEach(() => {
      mockId = toCursorHash('BaseDrink:123')
      drink = {
        name: 'Test Drink',
        icon: 'test-icon',
        caffeine: 0,
      } as Drink
      prisma.drink.findUnique.mockResolvedValue(drink)
    })

    test.skip('calls something', async () => {
      const foo = await queryResolvers.drink?.(
        {},
        { drinkId: mockId },
        ctx,
        {} as GraphQLResolveInfo,
      )

      console.log(foo)
    })
  })
})
