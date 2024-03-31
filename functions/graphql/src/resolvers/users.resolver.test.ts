import {
  vi,
  beforeEach,
  describe,
  test,
  expect,
} from 'vitest'
import { GraphQLResolveInfo } from 'graphql'
import prisma from '../__mocks__/prisma'
import { AppContext } from '../types/context'
import { Drinks } from '../models/Drink.model'
import { toCursorHash } from '../utils/cursorHash'
import { Entries } from '../models/Entry.model'
import { DrinkHistory } from '../models/History.model'
import { usersResolver } from './users.resolver'

vi.mock('../models/Drink.model', () => ({
  Drinks: vi.fn().mockReturnValue({
    ...prisma.drink,
    findManyPaginated: vi.fn().mockResolvedValue({ drinks: { edges: [{ id: 'mock' }] }}),
  }),
}))

vi.mock('../models/History.model', () => ({
  DrinkHistory: vi.fn().mockReturnValue({
    findManyPaginated: vi.fn().mockResolvedValue({ drinks: { edges: [{ id: 'mock' }] } }),
  }),
}))

vi.mock('../models/Entry.model', () => ({
  Entries: vi.fn().mockReturnValue({
    ...prisma.entry,
    findManyPaginated: vi.fn().mockResolvedValue({ entries: { edges: [{ id: 'mock' }] }}),
  }),
}))


describe('userResolvers', () => {
  let ctx: AppContext

  beforeEach(() => {
    ctx = {
      prisma,
      user: 'user-123',
    }
  })

  describe('drinks', () => {
    test('makes a call to the Drink model', async () => {
      await usersResolver.drinks?.({ id: toCursorHash('User:user-123') }, {}, ctx, {} as GraphQLResolveInfo)
      expect(Drinks).toBeCalledWith(prisma.drink)
    })

    test('calls `findManyPaginated` to find drinks associated with the user', async () => {
      await usersResolver.drinks?.({ id: toCursorHash('User:user-123') }, {}, ctx, {} as GraphQLResolveInfo)
      expect(Drinks(prisma.drink).findManyPaginated).toHaveBeenCalledWith({
        userId: 'user-123',
      })
    })
  })

  describe('entries', () => {
    test('makes a call to the Entries model', async () => {
      await usersResolver.entries?.({ id: toCursorHash('User:user-123') }, {}, ctx, {} as GraphQLResolveInfo)
      expect(Entries).toBeCalledWith(prisma.entry)
    })

    test('calls `findManyPaginated` to find drinks associated with the user', async () => {
      await usersResolver.entries?.({ id: toCursorHash('User:user-123') }, {}, ctx, {} as GraphQLResolveInfo)
      expect(Entries(prisma.entry).findManyPaginated).toHaveBeenCalledWith(prisma, {
        userId: 'user-123',
      })
    })
  })

  describe('drinksHistory', () => {
    test('makes a call to the Entries model', async () => {
      await usersResolver.drinksHistory?.({ id: toCursorHash('User:user-123') }, {}, ctx, {} as GraphQLResolveInfo)
      expect(DrinkHistory).toBeCalledWith(prisma)
    })

    test('calls `findManyPaginated` to find drinks associated with the user', async () => {
      await usersResolver.drinksHistory?.({ id: toCursorHash('User:user-123') }, {}, ctx, {} as GraphQLResolveInfo)
      expect(DrinkHistory(prisma).findManyPaginated).toHaveBeenCalledWith({
        filter: {
          hasEntries: true,
        },
        userId: 'user-123',
      })
    })
  })
})
