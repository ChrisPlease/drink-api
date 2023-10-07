import {
  describe,
  beforeEach,
  test,
  expect,
  vi,
} from 'vitest'
import { Drink } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import { deconstructId, toCursorHash } from '../utils/cursorHash'
import {
  DrinkCreateInput,
  DrinkEditInput,
} from '../__generated__/graphql'
import { Drinks } from './Drink.model'

describe('Drink Model', () => {
  const drink = Drinks(prisma.drink)

  beforeEach(() => {
    prisma.$transaction
      .mockImplementation((callback) => callback(prisma))
  })

  describe('findUniqueById', () => {
    test('calls prisma to find a drink and returns a hashed ID', async () => {
      expect.assertions(2)
      const mockId = toCursorHash('Base:123')
      const mockRes = {
        id: toCursorHash('Base:123'),
        name: 'Mock Drink',
      }
      prisma.drink.findUnique.mockResolvedValue({
        ...mockRes,
      } as Drink)
      const res = await drink.findUniqueById(mockId)

      expect(prisma.drink.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      })
      expect(res).toStrictEqual({ ...mockRes })
    })
  })

  describe('findManyPaginated', () => {
    let mockResponse: (Drink & { _count: { ingredients: number } })[]
    beforeEach(() => {
      mockResponse = Array.from(new Array(12)).map((_, index) => ({
        id: `drink-${index}`,
        name: `Test drink ${index}`,
        icon: 'test-icon',
        caffeine: 12,
        sugar: 12,
        coefficient: 1,
        servingSize: 8,
        deleted: null,
        userId: null,
        createdAt: new Date(2023, 0, 0, 0),
        _count: {
          ingredients: index % 2 === 0 ? 3 : 0,
        },
      }))
      prisma.drink.findMany.mockResolvedValue(mockResponse)
      prisma.drink.count.mockResolvedValue(12)
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
        },
       })
       expect(prisma.drink.count).toHaveBeenCalled()
    })

    test('returns the nodes mapped to a hashed ID', async () => {
      const { nodes } = await drink.findManyPaginated({}, 'user-123')
      const mappedNodes = nodes.map(({ id, ...node }) => ({
        id: deconstructId(id)[1],
        ...node,
      }))

      expect(
        mockResponse.map(({ _count, ...rest }) => ({ ...rest })),
      ).toStrictEqual(mappedNodes)
    })
  })

  describe('createWithNutrition', () => {
    let mockPayload: Omit<DrinkCreateInput, 'ingredients'> & { userId: string }
    let mockResponse: Drink

    beforeEach(() => {
      mockResponse = {
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
        caffeine: 0,
        coefficient: 1,
        sugar: 0,
        userId: '456',
        deleted: null,
        servingSize: 8,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        sugar: 0,
        caffeine: 0,
        userId: '456',
        servingSize: 8,
        coefficient: 1,
      }
      prisma.drink.create.mockResolvedValue(mockResponse)
    })

    test('calls prisma to create a drink', async () => {
      await drink.createWithNutrition(mockPayload)
      expect(prisma.drink.create).toHaveBeenCalledWith({
        data: {
          caffeine: 0,
          sugar: 0,
          coefficient: 1,
          servingSize: 8,
          name: 'Test Drink',
          icon: 'test-icon',
          userId: '456',
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
    let mockPayload: Omit<DrinkCreateInput, 'caffeine' | 'sugar' | 'coefficient'> & { userId: string }
    let mockResponse: Drink

    beforeEach(async () => {
      mockResponse = {
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
        caffeine: 0,
        servingSize: 8,
        coefficient: 1,
        sugar: 0,
        userId: '456',
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        servingSize: 8,
        userId: '456',
        ingredients: [
          { drinkId: toCursorHash('Ingredient:456'), parts: 1 },
          { drinkId: toCursorHash('Ingredient:567'), parts: 1 },
        ],
      }

      prisma.drink.create.mockResolvedValue(mockResponse)
      vi.spyOn(Drinks(prisma.drink), 'saveWithIngredientsNutrition').mockResolvedValue(mockResponse)
    })

    test('initiates a transaction to save the drink', async () => {
      await drink.createWithIngredients(mockPayload, prisma)
      expect(prisma.$transaction).toHaveBeenCalled()
    })

    test('creates the drink', async () => {
      const { ingredients, ...payload } = mockPayload
      await drink.createWithIngredients(mockPayload, prisma)
      expect(prisma.drink.create).toHaveBeenCalledWith({
        data: {
          ...payload,
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

    test('calls `saveWithIngredientsNutrition` to save the drink with updated nutrition', async () => {
      await drink.createWithIngredients(mockPayload, prisma)
      expect(drink.saveWithIngredientsNutrition).toHaveBeenCalled()
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
        caffeine: 0,
        coefficient: 1,
        servingSize: 8,
        sugar: 0,
        userId: '456',
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        userId: '456',
        id: toCursorHash('MixedDrink:123'),
        ingredients: [
          { drinkId: toCursorHash('Ingredient:456'), parts: 1 },
          { drinkId: toCursorHash('Ingredient:567'), parts: 1 },
        ],
      }

      prisma.drink.findUnique.mockReturnValue({
        ...mockResponse,
        ingredients: vi.fn().mockResolvedValue([{ ingredient: { id: '123' } }]),
      } as any)
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
      expect.assertions(2)
      await drink.updateWithIngredients(mockPayload, prisma)
      expect(prisma.drink.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_userId: { id: '123', userId: '456' } } }),
      )
      expect(drink.saveWithIngredientsNutrition).toHaveBeenCalled()
    })
  })

  describe('updateWithNutrition', () => {
    let mockPayload: Omit<DrinkEditInput, 'ingredients'> & { userId: string }
    let mockResponse: Drink

    beforeEach(() => {
      mockResponse = {
        id: '123',
        name: 'Test Drink',
        icon: 'test-icon',
        caffeine: 0,
        coefficient: 1,
        sugar: 1,
        servingSize: 8,
        userId: '456',
        deleted: null,
        createdAt: new Date(2022, 1, 1, 0),
      }
      mockPayload = {
        name: 'Test Drink',
        icon: 'test-icon',
        userId: '456',
        coefficient: 1,
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
        },
        where: { id: '123' },
      })
    })

    test('maps the id from the response', async () => {
      const res = await drink.updateWithNutrition(mockPayload)

      expect(res?.id).toEqual(toCursorHash('BaseDrink:123'))
    })
  })

  describe('calculateIngredientNutrition', () => {
    beforeEach(() => {
      prisma.$queryRaw.mockResolvedValue([{
        sugar: '0',
        caffeine: '0',
        coefficient: '1',
      }])
    })

    test('calls queryRaw to retrieve nutrition', () => {
      drink.calculateIngredientNutrition('123', prisma)

      expect(prisma.$queryRaw).toHaveBeenCalled()
    })

    test('returns the nutrition as an object', async () => {
      const res = await drink.calculateIngredientNutrition('123', prisma)

      expect(res).toStrictEqual({
        sugar: 0,
        caffeine: 0,
        coefficient: 1,
      })
    })
  })

})
