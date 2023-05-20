import { Request } from 'express-jwt'
import { Response } from 'express'
import { GraphQLResolveInfo } from 'graphql'
import { Entry } from '@prisma/client'
import {
  describe,
  beforeEach,
  test,
  expect,
  vi,
} from 'vitest'
import {
  mutationResolvers,
} from './mutation.resolver'
import { toCursorHash } from '@/utils/cursorHash'
import { AppContext } from '@/types/context'
import prisma from '@/__mocks__/prisma'

describe('mutationResolvers', () => {
  const parent = {}
  const ctx: AppContext = {
    prisma,
    req: {
      auth: {
        sub: 'user-123',
      },
    } as Request,
    res: {} as Response,
  }
  const info = {} as GraphQLResolveInfo
  describe('entries', () => {
    const args = {
      volume: 12,
      drinkId: toCursorHash('BaseDrink:drink-123'),
    }
    const resolvedValue = {
      id: toCursorHash('Entry:123'),
      deleted: false,
      drinkId: 'drink-123',
      drink: {
        caffeine: 12,
        sugar: 12,
        coefficient: 1,
      },
      timestamp: new Date(2022, 0, 0, 0, 0),
      userId: 'user-123',
      volume: 12,
    }
    describe('entryCreate', () => {
      let mockEntry: Entry & {
        drink: {
          caffeine: number,
          sugar: number,
          coefficient: number,
          servingSize: number,
        },
      }
      beforeEach(() => {
        mockEntry = {
          id: '123',
          volume: 12,
          timestamp: new Date(2022, 0, 0, 0, 0),
          drinkId: 'drink-123',
          userId: 'user-123',
          drink: {
            caffeine: 1,
            sugar: 1,
            coefficient: 1,
            servingSize: 12,
          },
          deleted: false,
        }
        prisma.entry.create.mockResolvedValue(mockEntry)
      })

      test('makes a call to create an entry', async () => {
        await mutationResolvers.entryCreate?.(parent, args, ctx, info)

        expect(prisma.entry.create).toHaveBeenCalledWith({
          data: {
            drinkId: 'drink-123',
            userId: 'user-123',
            volume: 12,
          },
          include: {
            drink: {
              select: {
                caffeine: true,
                sugar: true,
                coefficient: true,
                servingSize: true,
              },
            },
          },
        })
      })

      test('returns the new entry', async () => {
        const res = await mutationResolvers.entryCreate?.(parent, args, ctx, info)
        const { drink, ...mockedRes } = resolvedValue

        expect(res).toStrictEqual({
          caffeine: 1,
          sugar: 1,
          waterContent: 12,
          servings: 1,
          ...mockedRes,
        })
      })
    })

    describe('entryDelete', () => {
      let mockEntryId: string

      beforeEach(() => {
        mockEntryId = toCursorHash('Entry:123')
        prisma.$transaction.mockResolvedValue(vi.fn())
      })
      test('initiates a transaction to delete the entry', async () => {
        await mutationResolvers.entryDelete?.(
          parent,
          { entryId: mockEntryId },
          ctx,
          info,
        )

        expect(prisma.$transaction).toHaveBeenCalled()
      })
    })
  })

  describe('drinks', () => {

    describe.todo('drinkCreate')

    describe.todo('drinkDelete')

    describe.todo('drinkEdit')
  })


  describe.todo('userCreate')
})
