import {
  vi,
  expect,
  test,
  describe,
  beforeEach,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { GraphQLResolveInfo } from 'graphql'
import { Drink, Entry, User } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import redis from '../__mocks__/redis'
import { AppContext } from '../types/context'
import { toCursorHash } from '../utils/cursorHash'
import { DrinkHistory as DrinkHistoryModel, ResolvedEntry } from '../types/models'
import { Drinks } from '../models/Drink.model'
import { DrinkHistory } from '../models/History.model'
import { Entries } from '../models/Entry.model'
import { QueryDrinksArgs, QueryDrinksHistoryArgs, QueryEntriesArgs } from '../__generated__/graphql'
import { queryResolvers } from './query.resolver'

vi.mock('../models/Drink.model', () => ({
  Drinks: vi.fn().mockReturnValue({
    ...prisma.drink,
    findUniqueById: vi.fn().mockResolvedValue({ id: 'mock' }),
    findManyPaginated: vi.fn().mockResolvedValue({ drinks: { edges: [{ id: 'mock' }] }}),
  }),
}))

vi.mock('../models/History.model', () => ({
  DrinkHistory: vi.fn().mockReturnValue({
    findUniqueDrinkHistory: vi.fn().mockResolvedValue({ id: 'mock' }),
    findManyPaginated: vi.fn().mockResolvedValue({ drinks: { edges: [{ id: 'mock' }] } }),
  }),
}))

vi.mock('../models/Entry.model', () => ({
  Entries: vi.fn().mockReturnValue({
    ...prisma.entry,
    findUniqueWithNutrition: vi.fn().mockResolvedValue({ id: 'mock' }),
    findManyPaginated: vi.fn().mockResolvedValue({ entries: { edges: [{ id: 'mock' }] }}),
  }),
}))

describe('queryResolvers', () => {
  let ctx: AppContext

  beforeEach(() => {
    ctx = {
      prisma,
      redis,
      req: {
        auth: { sub: 'user-123' },
      } as Request,
      res: {} as Response,
    }
  })

  describe('node', () => {
    let node: Drink | User | Entry | DrinkHistoryModel
    let mockId: string

    describe('user node', () => {
      beforeEach(() => {
        mockId = '123'
        prisma.user.findUnique.mockResolvedValue({ id: '123' })
      })

      test('calls `prisma.user` when the node is a user', async () => {
        await queryResolvers.node?.({}, {
          id: toCursorHash(`User:${mockId}`),
        }, ctx, {})

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '123' } })
      })

      test('returns a hashed user', async () => {
        node = await queryResolvers.node?.({}, {
          id: toCursorHash(`User:${mockId}`),
        }, ctx, {})

        expect(node.id).toEqual(toCursorHash(`User:${mockId}`))
      })
    })

    describe('drink node', () => {
      beforeEach(() => {
        mockId = '123'
      })

      test('calls the Drinks model with `prisma.drink`', async () => {
        node = await queryResolvers.node?.({}, {
          id: toCursorHash(`BaseDrink:${mockId}`),
        }, ctx, {})

        expect(Drinks).toHaveBeenCalledWith(prisma.drink)
      })

      test('passes the hashed ID to `findUniqueById`', async () => {
        node = await queryResolvers.node?.({}, {
          id: toCursorHash(`BaseDrink:${mockId}`),
        }, ctx, {})
        expect(Drinks(prisma.drink).findUniqueById).toHaveBeenCalledWith(toCursorHash('BaseDrink:123'))
      })

      test('returns the node with the id mapped', async () => {
        node = await queryResolvers.node?.({}, {
          id: toCursorHash(`MixedDrink:${mockId}`),
        }, ctx, {})

        expect(node).toEqual({ id: 'mock' })
      })
    })

    describe('drink history node', () => {
      beforeEach(async () => {
        mockId = toCursorHash('DrinkHistory:123')
        node = await queryResolvers.node?.({}, { id: mockId }, ctx, {})
      })

      test('calls the History model with `prisma`', () => {
        expect(DrinkHistory).toHaveBeenCalledWith(prisma)
      })

      test('passes the hashed ID to `findUniqueDrinkHistory`', () => {
        expect(DrinkHistory(prisma).findUniqueDrinkHistory).toHaveBeenCalledWith(mockId, 'user-123')
      })

      test('returns the result from the call', () => {
        expect(node).toEqual({ id: 'mock' })
      })
    })

    describe('entry node', () => {
      beforeEach(async () => {
        mockId = toCursorHash('Entry:123')
        node = await queryResolvers.node?.({}, { id: mockId }, ctx, {})
      })

      test('calls the Entries model with `prisma.entry`', () => {
        expect(Entries).toHaveBeenCalledWith(prisma.entry)
      })

      test('passes the hashed ID to `findUniqueWithNutrition`', () => {
        expect(Entries(prisma.entry).findUniqueWithNutrition).toHaveBeenCalledWith(mockId, 'user-123')
      })

      test('returns the result from the call', () => {
        expect(node).toEqual({ id: 'mock' })
      })
    })
  })

  describe('drink', () => {
    let node: Drink
    let mockId: string

    beforeEach(async () => {
      mockId = toCursorHash('BaseDrink:123')
      node = await queryResolvers.drink?.(
        {},
        { id: mockId },
        ctx,
        {} as GraphQLResolveInfo,
      )
    })

    test('checks if drink exists in redis', () => {
      expect(redis.get).toHaveBeenCalledWith(`drinks:${mockId}`)
    })

    describe('when drink exists in redis', () => {
      test('returns the redis result', async () => {
        redis.get.mockResolvedValue(JSON.stringify({ id: 'mock-id' }))

        node = await queryResolvers.drink?.({}, { id: mockId }, ctx, {})
        expect(node).toEqual({ id: 'mock-id' })
      })

    })

    test('calls the Drinks model with `prisma.drink`', () => {
      expect(Drinks).toHaveBeenCalledWith(prisma.drink)
    })

    test('calls `findUniqueById` on the Drinks model with the given hashed ID', () => {
      expect(Drinks(prisma.drink).findUniqueById).toHaveBeenCalledWith(mockId)
    })

    test('returns the result of the call', () => {
      expect(node).toEqual({ id: 'mock' })
    })
  })

  describe('drinks', () => {
    let mockArgs: QueryDrinksArgs
    let res: Record<string, unknown>

    beforeEach(async () => {
      mockArgs = { first: 2, after: '123' }
      res = await queryResolvers.drinks?.({}, mockArgs, ctx, {})
    })

    test('calls the Drinks model, calls the paginated method and returns the result', () => {
      expect.assertions(3)

      expect(Drinks).toHaveBeenCalledWith(prisma.drink)
      expect(Drinks(prisma.drink).findManyPaginated).toHaveBeenCalledWith({ ...mockArgs }, 'user-123')
      expect(res).toStrictEqual({ drinks: { edges: [{ id: 'mock' }] }})
    })
  })

  describe('entry', () => {
    let mockId: string
    let res: ResolvedEntry

    beforeEach(async () => {
      mockId = toCursorHash('Entry:123')
      res = await queryResolvers.entry?.({}, { id: mockId }, ctx, {})
    })

    test('checks if entry exists in redis', () => {
      expect(redis.get).toHaveBeenCalledWith(`entries:user-123:${mockId}`)
    })

    describe('when entry exists in redis', () => {
      test('returns the redis result', async () => {
        redis.get.mockResolvedValue(JSON.stringify({ id: 'mock-id' }))

        res = await queryResolvers.entry?.({}, { id: mockId }, ctx, {})
        expect(res).toEqual({ id: 'mock-id' })
      })

    })

    test('calls the Entries model, calls the findUniqueById method and returns the result', () => {
      expect.assertions(3)

      expect(Entries).toHaveBeenCalledWith(prisma.entry)
      expect(Entries(prisma.entry).findUniqueWithNutrition).toHaveBeenCalledWith(mockId, 'user-123')
      expect(res).toStrictEqual({ id: 'mock' })
    })
  })

  describe('entries', () => {
    let mockArgs: QueryEntriesArgs
    let res: Record<string, unknown>

    beforeEach(async () => {
      mockArgs = { first: 2, after: '123' }
      res = await queryResolvers.entries?.({}, mockArgs, ctx, {})
    })

    test('calls the Entries model, calls the paginated method and returns the result', async () => {
      expect.assertions(3)

      expect(Entries).toHaveBeenCalledWith(prisma.entry)
      expect(Entries(prisma.entry).findManyPaginated).toHaveBeenCalled()
      expect(res).toStrictEqual({ entries: { edges: [{ id: 'mock' }] } })
    })
  })

  describe('drinkHistory', () => {
    let mockId: string
    let res: Record<string, unknown>

    beforeEach(async () => {
      mockId = toCursorHash('DrinkHistory:123')
      res = await queryResolvers.drinkHistory?.({}, { id: mockId }, ctx, {})
    })

    test('checks if drink history exists in redis', () => {
      expect(redis.get).toHaveBeenCalledWith(`drinkHistory:user-123:${mockId}`)
    })

    describe('when drink history exists in redis', () => {
      test('returns the redis result', async () => {
        redis.get.mockResolvedValue(JSON.stringify({ id: 'mock-id' }))

        res = await queryResolvers.drinkHistory?.({}, { id: mockId }, ctx, {})
        expect(res).toEqual({ id: 'mock-id' })
      })

    })

    test('calls the History model, calls the findUniqueDrinkHistory and returns the result', async () => {
      expect.assertions(3)

      expect(DrinkHistory).toHaveBeenCalledWith(prisma)
      expect(DrinkHistory(prisma).findUniqueDrinkHistory).toHaveBeenCalled()
      expect(res).toStrictEqual({ id: 'mock' })
    })
  })

  describe('drinksHistory', () => {
    let mockArgs: QueryDrinksHistoryArgs
    let res: Record<string, any>

    beforeEach(async () => {
      mockArgs = { first: 3, after: '123' }
      res = await queryResolvers.drinksHistory?.({}, { ...mockArgs, userId: 'user-123' }, prisma)
    })

    test('calls the History model, calls the findManyPaginated method and returns the result', () => {
      expect.assertions(3)
      expect(DrinkHistory).toHaveBeenCalledWith(prisma)
      expect(DrinkHistory(prisma).findManyPaginated).toHaveBeenCalled()
      expect(res).toStrictEqual({ drinks: { edges: [{ id: 'mock' }] } })
    })
  })

  describe('user requests', () => {
    let mockId: string
    let res: User

    beforeEach(() => {
      mockId = 'user-456'
      prisma.user.findUnique.mockResolvedValue({ id: mockId })
    })

    describe('me', () => {
      beforeEach(async () => {
        res = await queryResolvers.me({}, {}, ctx, {})
      })

      test('makes a call to `prisma.user` given the context id', async () => {
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' } })
      })

      test('resolves with a hashed id of context user', () => {
        expect(res).toEqual(
          expect.objectContaining({ id: toCursorHash('User:user-123')}),
        )
      })
    })

    describe('user', () => {
      test('makes a call to `prisma.user` with the given argument', async () => {

        await queryResolvers.user({}, { id: mockId }, ctx, {})
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-456' } })
      })
    })

    describe('users', () => {
      beforeEach(() => {
        prisma.user.findMany.mockResolvedValue([{ id: 'user-123' }])
      })

      test('makes a call to `prisma.user` to fetch all users', async () => {
        await queryResolvers.users({}, {}, ctx, {})
        expect(prisma.user.findMany).toHaveBeenCalled()
      })

      test('returns users with hashed ids', async () => {
        const res = await queryResolvers.users({}, {}, ctx, {})

        expect(res[0]).toEqual(
          expect.objectContaining({
            id: toCursorHash('User:user-123'),
          }),
        )
      })
    })

    describe.skip('drinkScan', () => {})
  })
})
