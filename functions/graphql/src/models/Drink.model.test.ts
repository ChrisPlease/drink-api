import { afterEach } from 'node:test'
import {
  describe,
  beforeEach,
  test,
  expect,
  vi,
} from 'vitest'
import { Drink, Prisma } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import {
  deconstructId,
  encodeCursor,
  toCursorHash,
} from '../utils/cursorHash'
import {
  DrinkCreateInput,
  DrinkEditInput,
  DrinkFilter,
  DrinkNutrition,
  DrinkNutritionInput,
  DrinkSort,
  MutationDrinkDeleteArgs,
  QueryDrinksArgs,
  Sort,
} from '../__generated__/graphql'
import { DrinkWithIngredientCountPayload } from '../types/drinks'
import { Drinks } from './Drink.model'
import { ReturnedDrinkResult } from '@/types/models'

vi.mock('../utils/queries', () => ({
  queryIngredientNutrition: vi.fn().mockResolvedValue([{}]),
}))

describe('Drink Model', () => {
  const drink = Drinks(prisma.drink)

  beforeEach(() => {
    prisma.$transaction
      .mockImplementation((callback) => callback(prisma))
  })

  describe('findUniqueById', () => {
    let mockId: string
    let mockRes: DrinkWithIngredientCountPayload | null

    beforeEach(() => {
      mockId = toCursorHash('BaseDrink:123')

      mockRes = {
        id: mockId,
        name: 'Mock Drink',
        _count: {
          ingredients: 0,
        },
      } as DrinkWithIngredientCountPayload
    })

    test('calls prisma to find a drink and returns a hashed ID', async () => {
      expect.assertions(2)

      prisma.drink.findUnique.mockResolvedValue(mockRes)
      const res = await drink.findUniqueById(mockId)

      expect(prisma.drink.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: {
          _count: {
            select: {
              ingredients: true,
            },
          },
        },
      })
      expect(res).toStrictEqual({
        name: 'Mock Drink',
        id: mockId,
      })
    })

    test('check ingredient count to determine mixed drink', async () => {
      mockRes = { ...mockRes, _count: { ingredients: 2} } as DrinkWithIngredientCountPayload
      prisma.drink.findUnique.mockResolvedValue(mockRes)

      const res = await drink.findUniqueById(mockId)

      expect(deconstructId(res?.id || '')?.[0]).toEqual('MixedDrink')
    })

    test('returns undefined when not found in the database', async () => {
      mockRes = null
      prisma.drink.findUnique.mockResolvedValue(mockRes)

      const res = await drink.findUniqueById(mockId)

      expect(res).toBe(null)
    })
  })

  describe('findManyPaginated', () => {
    let mockResponse: DrinkWithIngredientCountPayload[]
    let mockFilterInput: QueryDrinksArgs

    beforeEach(() => {
      mockResponse = Array.from(new Array(12)).map((_, index) => ({
        id: `drink-${index}`,
        name: `Test drink ${index}`,
        upc: '000000000000',
        icon: 'test-icon',
        deleted: null,
        userId: null,
        createdAt: new Date(2023, 0, 0, 0),
        servingSize: 8,
        servingUnit: 'fl oz',
        metricSize: 227,
        _count: {
          ingredients: index % 2 === 0 ? 3 : 0,
        },
      }))
      prisma.drink.findMany.mockResolvedValue(mockResponse)
      prisma.drink.count.mockResolvedValue(12)

      mockFilterInput = {
        first: 1,
        orderBy: {
          name: 'asc',
          id: 'asc',
        },
        filter: {
          nutrition: {
            coefficient: [
              { comparison: 'GT', value: 10 },
              { comparison: 'LT', value: 99 },
            ],
          },
          id: {
            in: [
              toCursorHash('foo:mock-id-1'),
              toCursorHash('foo:mock-id-2'),
            ],
          },
          isMixedDrink: true,
          isUserDrink: true,
        } as DrinkFilter,
        sort: {
          name: 'ASC',
        } as DrinkSort,
      } as QueryDrinksArgs
    })

    test('makes calls to the database to return drinks and count', async () => {
      expect.assertions(2)
      await drink.findManyPaginated({}, 'user-123')

      expect(prisma.drink.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              ingredients: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        where: {
          OR: [
            {
              userId: 'user-123',
            },
            {
              userId: null,
            },
          ],
          deleted: null,
          nutrition: {},
        },
       })
       expect(prisma.drink.count).toHaveBeenCalled()
    })

    test('applies filters to the prisma query when provided', async () => {
      const after = toCursorHash(
        JSON.stringify(encodeCursor({ id: 'mock-id-1'}, [])),
      )
      mockFilterInput = {
        ...mockFilterInput,
        after,
      } as QueryDrinksArgs

      await drink.findManyPaginated(mockFilterInput, 'user-123')

      expect(prisma.drink.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: {
            id: 'mock-id-1',
          },
          skip: 1,
          take: 2,
          include: {
            _count: {
              select: {
                ingredients: true,
              },
            },
          },
          where: expect.objectContaining({
            id: { in: ['mock-id-1', 'mock-id-2'] },
            ingredients: { some: {} },
            nutrition: {
              coefficient: {
                GT: 10,
                LT: 99,
              },
            },
          }),
        }),
      )
    })

    test('searches by userId when provided', async () => {
      mockFilterInput = {
        userId: 'mock-user',
      }
      await drink.findManyPaginated(mockFilterInput,'user-123')

      expect(prisma.drink.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'mock-user',
          }),
        }),
      )
    })

    test('filters out drinks with ingredients when searching isMixedDrink: false', async () => {
      mockFilterInput = {
        filter: {
          isMixedDrink: false,
        },
      } as QueryDrinksArgs
      await drink.findManyPaginated(mockFilterInput, 'user-123')

      expect(prisma.drink.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ingredients: { none: {} },
          }),
        }),
      )
    })

    test('returns the nodes mapped to a hashed ID', async () => {
      const { nodes } = await drink.findManyPaginated({}, 'user-123')
      const mappedNodes = nodes.map(({ id, serving, ...node }) => ({
        id: deconstructId(id)[1],
        ...serving,
        ...node,
      }))

      expect(
        mockResponse.map(({ _count, ...rest }) => ({ ...rest })),
      ).toStrictEqual(mappedNodes)
    })

    describe('sorting', () => {
      let mockSortInput: DrinkSort

      test('sorts by entry count when entries is defined', async () => {
        mockSortInput = {
          entryCount: Sort.Desc,
        }
        await drink.findManyPaginated({ sort: mockSortInput }, 'user-123')

        expect(prisma.drink.findMany).toHaveBeenCalledWith(expect.objectContaining({
          orderBy: [{ entries: { _count: 'desc'} }, { name: 'asc' }],
        }))
      })

      test('sorts by nutrition values when nutrition is defined', async () => {
        mockSortInput = {
          nutrition: {
            coefficient: Sort.Asc,
          },
        }
        await drink.findManyPaginated({ sort: mockSortInput }, 'user-123')

        expect(prisma.drink.findMany).toHaveBeenCalledWith(expect.objectContaining({
          orderBy: [{ nutrition: { coefficient: 'ASC' } }, { name: 'asc' }],
        }))
      })
    })
  })

  describe('createWithNutrition', () => {
    let mockPayload: Omit<DrinkCreateInput, 'ingredients'> & { userId: string }
    let mockResponse: Prisma.DrinkGetPayload<{
      include: {
        servingSize: true,
        servingUnit: true,
        metricSize: true,
        nutrition: {
          select: {
            coefficient: true,
            sugar: true,
          },
        },
      },
    }>

    beforeEach(() => {
      mockResponse = {
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
        upc: '00000000',
        servingSize: 8,
        servingUnit: 'fl oz',
        metricSize: 237,
        nutrition: {
          coefficient: 100,
          sugar: 0,
        },
        userId: '456',
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        serving: {
          servingSize: 8,
          metricSize: 237,
          servingUnit: 'fl oz',
        },
        nutrition: {
          coefficient: 100,
          sugar: 0,
          caffeine: 0,
        },
        userId: '456',
      }
      prisma.drink.create.mockResolvedValue(mockResponse)
    })

    afterEach(() => {
      prisma.drink.create.mockReset()
    })

    test('calls prisma to create a drink', async () => {
      const { serving, nutrition, ...payload } = mockPayload
      await drink.createWithNutrition(mockPayload)
      expect(prisma.drink.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          ...serving,
          nutrition: {
            create: {
              ...nutrition,
            },
          },
        },
      })
    })

    test('returns a drink with a hashed ID', async () => {
      const res = await drink.createWithNutrition(mockPayload)
      expect(res).toStrictEqual({
        ...mockResponse,
        id: toCursorHash(`BaseDrink:${mockResponse.id}`),
      })
    })
  })

  describe('createWithIngredients', () => {
    let mockPayload: Omit<DrinkCreateInput, 'nutrition'> & { userId: string; nutrition: DrinkNutritionInput }
    let mockResponse: Drink

    beforeEach(async () => {
      mockResponse = {
        id: '123',
        upc: null,
        name: 'Test Drink',
        icon: 'test-icon',
        userId: '456',
        servingSize: 12,
        servingUnit: 'fl oz',
        metricSize: 350,
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        serving: {
          servingSize: 12,
          servingUnit: 'fl oz',
          metricSize: 350,
        },
        nutrition: {
          coefficient: 100,
        },
        userId: '456',
        ingredients: [
          { drinkId: toCursorHash('Ingredient:456'), parts: 1 },
          { drinkId: toCursorHash('Ingredient:567'), parts: 1 },
        ],
      }

      prisma.drink.create.mockResolvedValue(mockResponse)
      prisma.drink.update.mockResolvedValue(mockResponse)
    })

    afterEach(() => {
      prisma.drink.create.mockClear()
      prisma.drink.update.mockClear()
    })

    test('initiates a transaction to save the drink', async () => {
      await drink.createWithIngredients(mockPayload, prisma)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('creates the drink', async () => {
      const { ingredients, nutrition, serving, ...payload } = mockPayload
      await drink.createWithIngredients(mockPayload, prisma)
      expect(prisma.drink.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          ...serving,
          nutrition: {
            create: {
              ...nutrition,
            },
          },
          ingredients: {
            create: ingredients?.map(({ drinkId, parts }) => ({
              ingredient: {
                create: {
                  drinkId: deconstructId(drinkId)[1],
                  parts,
                },
              },
            })),
          },
        },
      })
    })

    test('calls `findWithIngredientNutrition` to save the drink with updated nutrition', async () => {
      vi.spyOn(drink, 'findWithIngredientNutrition')
      await drink.createWithIngredients(mockPayload, prisma)
      expect(drink.findWithIngredientNutrition).toHaveBeenCalled()
    })
  })

  describe('updateWithIngredients', () => {
    let mockPayload: Omit<DrinkEditInput, 'coefficient' | 'caffeine' | 'sugar'> & { userId: string }
    let mockResponse: Drink

    beforeEach(() => {

      mockResponse = {
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
        upc: null,
        userId: '456',
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
        servingSize: 8,
        metricSize: 227,
        servingUnit: 'fl oz',
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        userId: '456',
        id: toCursorHash('MixedDrink:123'),
        serving: {
          servingSize: 8,
          metricSize: 227,
          servingUnit: 'fl oz',
        },
        ingredients: [
          { drinkId: toCursorHash('Ingredient:456'), parts: 1 },
          { drinkId: toCursorHash('Ingredient:567'), parts: 1 },
        ],
      }

      prisma.drink.findUnique.mockReturnValue({
        ...mockResponse,
        ingredients: vi.fn().mockResolvedValue([{ ingredient: { id: '123' } }]),
      } as any)

      prisma.drink.update.mockResolvedValue(mockResponse)
    })

    test('initiates a transaction to update ingredients', async () => {
      await drink.updateWithIngredients(mockPayload, prisma)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('locates existing ingredients to delete them', async () => {
      expect.assertions(2)
      await drink.updateWithIngredients(mockPayload, prisma)
      expect(
        drink.findUnique({ where: { id: '123' }})
        .ingredients,
      ).toHaveBeenCalledWith({
        select: { ingredient: { select: { id: true } } },
      })
      expect(prisma.ingredient.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['123'] } },
      })
    })

    test('updates the drink with new ingredients', async () => {
      vi.spyOn(drink, 'findWithIngredientNutrition')
      expect.assertions(2)
      await drink.updateWithIngredients(mockPayload, prisma)
      expect(prisma.drink.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_userId: { id: '123', userId: '456' } } }),
      )
      expect(drink.findWithIngredientNutrition).toHaveBeenCalled()
    })
  })

  describe('updateWithNutrition', () => {
    let mockPayload: Omit<DrinkEditInput, 'ingredients'> & { userId: string }
    let mockResponse: Prisma.DrinkGetPayload<{
      select: {
        servingSize: true,
        servingUnit: true,
        metricSize: true,
      },
      include: {
        nutrition: {
          select: {
            coefficient: true,
            sugar: true,
          },
        },
      },
    }>

    beforeEach(() => {
      mockResponse = {
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
        upc: null,
        servingSize: 8,
        metricSize: 237,
        servingUnit: 'fl oz',
        nutrition: {
          coefficient: 1,
          sugar: 1,
        },
        userId: '456',
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        userId: '456',
        serving: {
          servingSize: 8,
          metricSize: 237,
          servingUnit: 'fl oz',
        },
        nutrition: {
          coefficient: 1,
          sugar: 1,
        },
        id: toCursorHash('BaseDrink:123'),
      }

      prisma.drink.update.mockResolvedValue(mockResponse)
    })

    test('makes a call to the db to update the drink', async () => {
      await drink.updateWithNutrition(mockPayload)
      const { id, ...expectedPayload } = mockPayload
      expect(prisma.drink.update).toHaveBeenCalledWith({
        data: {
          ...expectedPayload,
          nutrition: {
            update: {
              ...expectedPayload.nutrition,
            },
          },
        },
        where: { id: '123' },
      })
    })

    test('maps the id from the response', async () => {
      const res = await drink.updateWithNutrition(mockPayload)

      expect(res?.id).toEqual(toCursorHash('BaseDrink:123'))
    })
  })

  describe('deleteDrink', () => {
    const mockDrinkId = toCursorHash('BaseDrink:drink-123')
    let mockArgs: MutationDrinkDeleteArgs & { userId: string }
    let mockRes: Drink

    beforeEach(() => {
      mockArgs = {
        id: mockDrinkId,
        userId: 'user-123',
      }

      mockRes = {
        id: 'drink-123',
        name: 'foo',
      } as Drink

      prisma.drink.delete.mockResolvedValue(mockRes)

    })

    test('calls to Prisma delete with given arguments', async () => {
      await drink.deleteDrink(mockArgs)
      expect(prisma.drink.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id_userId: {
              id: 'drink-123',
              userId: 'user-123',
            },
          },
        }),
      )
    })

    test('hashes the id and returns the object', async () => {
      const res = await drink.deleteDrink(mockArgs)

      expect(res.id).toEqual(mockDrinkId)

    })

  })

  describe('findDrinkIngredients', () => {
    beforeEach(() => {
      prisma.drink.findUnique.mockReturnValue({
        ingredients: vi.fn().mockResolvedValue([
          { ingredient: { id: '123' } },
          { ingredient: { id: '456' } },
        ]),
      } as any)
    })

    test('returns unwrapped ingredients', async () => {
      const res = await drink.findDrinkIngredients(toCursorHash('BaseDrink:123'))
      expect(res).toEqual([{ id: '123' }, { id: '456' }])
    })
  })

  describe('findDrinkUser', () => {
    beforeEach(() => {
      prisma.drink.findUnique.mockReturnValue({
        user: vi.fn().mockResolvedValue({ id: 'user-123' }),
      } as any)
    })

    test('calls the user and returns a hashed id', async () => {
      expect.assertions(2)
      const res = await drink.findDrinkUser(toCursorHash('BaseDrink:drink-123'))

      expect(prisma.drink.findUnique).toHaveBeenCalledWith({ where: { id: 'drink-123' } })
      expect(res).toEqual({ id: toCursorHash('User:user-123') })
    })

    test('returns null when user not found', async () => {
      prisma.drink.findUnique.mockReturnValue({
        user: vi.fn().mockResolvedValue(null),
      } as any)

      const res = await drink.findDrinkUser('foo')
      expect(res).toBeNull()
    })
  })
})
