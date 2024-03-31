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
import redis from '../__mocks__/redis'
import { toCursorHash } from '../utils/cursorHash'
import { AppContext } from '../types/context'
import { Drinks } from '../models/Drink.model'
import { Entries } from '../models/Entry.model'
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

vi.mock('../models/Entry.model', () => ({
  Entries: vi.fn().mockReturnValue({
    ...prisma.entry,
    findManyPaginated: vi.fn().mockReturnValue([{ id: 'mock-entry' }]),
    findWithNutrition: vi.fn().mockReturnValue([{ id: 'foo' }]),
  }),
}))


describe('drinks.resolver', () => {
  const args = {}
  let ctx: AppContext
  const info = {} as GraphQLResolveInfo
  let parent: Drink

  beforeEach(() => {
    ctx = {
      redis,
      prisma,
      user: 'mock-user',
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
        const res = await drinkResolvers.__resolveType(parent, ctx, {} as GraphQLResolveInfo)
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

        expect(Entries).toHaveBeenCalledWith(prisma.entry)
        expect(
          Entries(prisma.entry).findManyPaginated,
        ).toHaveBeenCalledWith(prisma, { drinkId: parent.id, userId: 'mock-user' })
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

