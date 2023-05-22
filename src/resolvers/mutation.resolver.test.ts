import { Request } from 'express-jwt'
import { Response } from 'express'
import { GraphQLResolveInfo } from 'graphql'
import {
  describe,
  beforeEach,
  test,
  expect,
  vi,
  afterEach,
} from 'vitest'
import {
  MutationDrinkCreateArgs,
  MutationDrinkDeleteArgs,
  MutationDrinkEditArgs,
  MutationEntryCreateArgs,
  MutationEntryDeleteArgs,
} from '../__generated__/graphql'
import { AppContext } from '../types/context'
import prisma from '../__mocks__/prisma'
import { Drinks } from '../models/Drink.model'
import { Entries } from '../models/Entry.model'
import { toCursorHash } from '../utils/cursorHash'
import {
  mutationResolvers,
} from './mutation.resolver'

vi.mock('../models/Drink.model', () => ({
  Drinks: vi.fn().mockReturnValue({
    ...prisma.drink,
    createWithNutrition: vi.fn().mockResolvedValue({ id: 'mock' }),
    createWithIngredients: vi.fn().mockResolvedValue({ id: 'mock' }),
    deleteDrink: vi.fn().mockResolvedValue({ id: 'mock' }),
    updateWithIngredients: vi.fn().mockResolvedValue({ id: 'mock' }),
  }),
}))

vi.mock('../models/Entry.model', () => ({
  Entries: vi.fn().mockReturnValue({
    ...prisma.entry,
    createWithNutrition: vi.fn().mockResolvedValue({ id: 'mock' }),
    deleteAndReturn: vi.fn().mockResolvedValue({ id: 'mock' }),
  }),
}))

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

  afterEach(() => {
    vi.mocked(Drinks(prisma.drink).createWithNutrition).mockReset()
    vi.mocked(Drinks(prisma.drink).updateWithIngredients).mockReset()
  })

  describe('entries', () => {
    describe('entryCreate', () => {
      test('calls Entries model, calls createWithNutrition method and returns response', async () => {
        expect.assertions(3)
        const args: MutationEntryCreateArgs = { drinkId: '123', volume: 5 }
        const res = await mutationResolvers.entryCreate(parent, args, ctx, info)

        expect(Entries).toHaveBeenCalledWith(prisma.entry)
        expect(
          Entries(prisma.entry).createWithNutrition,
        ).toHaveBeenCalledWith({ ...args, userId: 'user-123' })
        expect(res).toStrictEqual({ id: 'mock' })
      })
    })

    describe('entryDelete', () => {
      test('calls Entries model, calls deleteAndReturn and returns response', async () => {
        expect.assertions(3)
        const args: MutationEntryDeleteArgs = { entryId: '123' }
        const res = await mutationResolvers.entryDelete(parent, args, ctx, info)

        expect(Entries).toHaveBeenCalledWith(prisma.entry)
        expect(
          Entries(prisma.entry).deleteAndReturn,
        ).toHaveBeenCalledWith({ ...args, userId: 'user-123' }, prisma)
        expect(res).toStrictEqual({ id: 'mock' })
      })
    })
  })

  describe('drinks', () => {
    describe('drinkCreate', () => {
      let args: MutationDrinkCreateArgs

      beforeEach(() => {
        args = {
          drinkInput: {
            name: 'Test',
            icon: 'test',
            servingSize: 12,
          },
        }
      })

      test('calls Drinks model', async () => {
        await mutationResolvers.drinkCreate({}, { userId: 'user-123', ...args }, ctx, info)
        expect(Drinks).toHaveBeenCalledWith(prisma.drink)
      })

      test('calls createWithNutrition when no ingredients are provided', async () => {
        args = {
          ...args,
          drinkInput: {
            ...args.drinkInput,
            caffeine: 12,
            sugar: 12,
            coefficient: 1,
          },
        }
        await mutationResolvers.drinkCreate({}, { ...args }, ctx, info)
        expect(Drinks(prisma.drink).createWithNutrition).toHaveBeenCalledWith({
          ...args.drinkInput,
          userId: 'user-123',
        })
      })

      test('calls createWithIngredients when ingredients are provided', async () => {
        expect.assertions(2)
        args = {
          ...args,
          drinkInput: {
            ...args.drinkInput,
            ingredients: [{ drinkId: '1', parts: 1 }, { drinkId: '2', parts: 1 }],
          },
        }

        await mutationResolvers.drinkCreate({}, args, ctx, info)
        expect(Drinks(prisma.drink).createWithNutrition).not.toHaveBeenCalled()
        expect(Drinks(prisma.drink).createWithIngredients).toHaveBeenCalledWith({
          ...args.drinkInput,
          userId: 'user-123',
        }, prisma)
      })
    })

    describe('drinkDelete', () => {
      test('calls Drink model to delete drink', async () => {
        const args: MutationDrinkDeleteArgs = { drinkId: '123' }
        await mutationResolvers.drinkDelete({}, args, ctx, info)

        expect.assertions(2)
        expect(Drinks).toHaveBeenCalledWith(prisma.drink)
        expect(Drinks(prisma.drink).deleteDrink).toHaveBeenCalledWith({
          userId: 'user-123',
          drinkId: '123',
        })
      })
    })

    describe('drinkEdit', () => {
      let args: MutationDrinkEditArgs

      beforeEach(() => {
        args = {
          drinkInput: {
            id: '123',
            name: 'Test',
            icon: 'test',
          },
        }
      })

      test('throws when id is not provided', async () => {
        expect.assertions(2)
        /* eslint-disable-next-line */
        // @ts-expect-error
        delete args.drinkInput.id

        try {
          await mutationResolvers.drinkEdit({}, args, ctx, info)
        } catch (err) {
          expect(err).toBeInstanceOf(Error)
          expect(err.message).toEqual('Drink ID required')
        }
      })

      test('throws when id is not found', async () => {
        expect.assertions(2)

        prisma.drink.findUniqueOrThrow.mockRejectedValue(new Error('not found'))
        try {
          await mutationResolvers.drinkEdit({}, args, ctx, info)
        } catch (err) {
          expect(err).toBeInstanceOf(Error)
          expect(err.message).toEqual('not found')
        }
      })

      test('throws when a drink type is not available', async () => {
        expect.assertions(2)
        args = {
          ...args,
          drinkInput: { ...args.drinkInput, id: toCursorHash('Drink:123') },
        }

        try {
          await mutationResolvers.drinkEdit({}, args, ctx, info)
        } catch (err) {
          expect(err).toBeInstanceOf(Error)
          expect(err.message).toEqual('Cannot recognize Drink Type')
        }
      })

      describe('editing mixed drinks', () => {
        beforeEach(() => {
          args = {
            drinkInput: {
              ...args.drinkInput,
              id: toCursorHash('MixedDrink:123'),
            },
          }
        })

        test('throws when a mixed drink provides nutrients', async () => {
          args = {
            ...args,
            drinkInput: {
              ...args.drinkInput,
              caffeine: 12,
            },
          }
          try {
            await mutationResolvers.drinkEdit({}, args, ctx, info)
          } catch (err) {
            expect(err).toBeInstanceOf(Error)
            expect(err.message).toEqual('Cannot add nutrition to a Mixed Drink')
          }
        })

        test('calls updateWithIngredients with new ingredients', async () => {
          args = {
            ...args,
            drinkInput: {
              ...args.drinkInput,
              ingredients: [
                { drinkId: '123', parts: 1 },
                { drinkId: '456', parts: 1 },
              ],
            },
          }

          await mutationResolvers.drinkEdit(
            {},
            {
              ...args,
              userId: '123',
            }, ctx, info)
          expect(Drinks(prisma.drink).updateWithIngredients).toHaveBeenCalled()
        })
      })

    })
  })

  describe('users', () => {
    describe.todo('userCreate')
  })
})
