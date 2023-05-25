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
import { Drinks } from '../models/Drink.model'
import {
  drinkResolvers,
  mixedDrinkResolvers,
} from './drinks.resolver'

vi.mock('../models/Drink.model', () => ({
  Drinks: vi.fn().mockReturnValue({
    ...prisma.drink,
    findDrinkEntries: vi.fn().mockReturnValue([{ id: 'mock-entry' }]),
    findDrinkUser: vi.fn().mockReturnValue({ id: 'user-123' }),
    findDrinkIngredients: vi.fn().mockReturnValue([{ id: '123' }]),
  }),
}))

describe('drinks.resolver', () => {
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
  })

  describe('drinkResolvers', () => {
    beforeEach(() => {
      parent = {
        id: toCursorHash('BaseDrink:123'),
        name: 'Test Drink',
        icon: 'test-icon',
      } as Drink
    })

    describe('__resolveType', () => {
      test('returns the proper typename dehashed from the id', async () => {
        const res = await drinkResolvers.__resolveType(parent)
        expect(res).toEqual('BaseDrink')
      })
    })

    describe('entries', () => {
      test('makes a call to Drink model to return entries', async () => {
        expect.assertions(3)
        const res = await drinkResolvers.entries?.(
          parent,
          args,
          ctx,
          info,
        )

        expect(Drinks).toHaveBeenCalledWith(prisma.drink)
        expect(
          Drinks(prisma.drink).findDrinkEntries,
        ).toHaveBeenCalledWith(prisma, parent.id, 'mock-user')
        expect(res).toStrictEqual([{ id: 'mock-entry' }])
      })
    })

    describe('user', () => {
      test('makes a call to Drink model to return the user', async () => {
        expect.assertions(3)
        const res = await drinkResolvers.user?.(
          parent,
          args,
          ctx,
          info,
        )

        expect(Drinks).toHaveBeenCalledWith(prisma.drink)
        expect(
          Drinks(prisma.drink).findDrinkUser,
        ).toHaveBeenCalledWith(parent.id)
        expect(res).toStrictEqual({ id: 'user-123' })
      })
    })
  })

  describe('mixedDrinkResolvers', () => {
    beforeEach(() => {
      parent = {
        id: toCursorHash('MixedDrink:123'),
        name: 'Test Drink',
        icon: 'test-icon',
      } as Drink
    })

    describe('ingredients', () => {
      test('makes a call to Drink model to return ingredients', async () => {
        expect.assertions(3)
        const res = await mixedDrinkResolvers.ingredients?.(
          parent,
          args,
          ctx,
          info,
        )

        expect(Drinks).toHaveBeenCalledWith(prisma.drink)
        expect(
          Drinks(prisma.drink).findDrinkIngredients,
        ).toHaveBeenCalledWith(parent.id)
        expect(res).toStrictEqual([{ id: '123' }])
      })
    })
  })
})

