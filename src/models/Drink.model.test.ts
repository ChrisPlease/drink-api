import {
  describe,
  beforeEach,
  test,
  expect,
  vi,
} from 'vitest'
import { Drinks } from './Drink.model'
import prisma from '../../__mocks__/prisma'
import { Drink } from '@prisma/client'
import { deconstructId, toCursorHash } from '../utils/cursorHash'
import {
  DrinkCreateInput,
  DrinkEditInput,
} from '../../__generated__/graphql'

describe('Drink Model', () => {
  const drink = Drinks(prisma.drink)

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

      vi.spyOn(drink, 'saveWithIngredientsNutrition').mockResolvedValue(
        mockResponse,
      )

      await drink.createWithIngredients(mockPayload, prisma)
    })

    test('makes a database call to save the drink', () => {
      const { ingredients, ...mockCall } = mockPayload
      expect(prisma.drink.create).toHaveBeenCalledWith({
        data: {
          ...mockCall,
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

    test('saves the drink again with the nutrition based off ingredients', async () => {
      expect(drink.saveWithIngredientsNutrition).toHaveBeenCalled()
    })
  })

  describe.skip('updateWithIngredients', () => {
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

      prisma.drink.findUnique.mockResolvedValue({
        ...mockResponse,
        ingredients: vi.fn().mockResolvedValue([]),
      } as any)
    })

    test('does something', async () => {
      await drink.updateWithIngredients(mockPayload, prisma)
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
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { id, ...expectedPayload } = mockPayload
      await drink.updateWithNutrition(mockPayload)
      expect(prisma.drink.update).toHaveBeenCalledWith({
        data: {
          ...expectedPayload,
        },
        where: { id: '123' },
      })
    })
  })

})
