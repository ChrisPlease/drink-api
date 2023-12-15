import {
  beforeEach,
  describe,
  test,
  expect,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { Drink } from '@prisma/client'
import prisma from '../__mocks__/prisma'
import redis from '../__mocks__/redis'
import { AppContext } from '../types/context'
import { deconstructId } from '../utils/cursorHash'
import { ingredientResolvers, ingredientTypeResolvers } from './ingredients.resolver'

describe('ingredients.resolver', () => {
  let ctx: AppContext
  let res: Drink & { ingredients: number }

  beforeEach(() => {
    ctx = {
      prisma,
      redis,
      req: {} as Request,
      res: {} as Response,
    }
    res = {} as Drink & { ingredients: number }
  })

  describe('ingredientTypeResolvers', () => {
    test('returns the ingredient type `AbsoluteIngredient` when volume is provided', async () => {
      const res = await ingredientTypeResolvers.__resolveType({ volume: 12 })

      expect(res).toEqual('AbsoluteIngredient')
    })
    test('returns the ingredient type `RelativeIngredient` when volume is not provided', async () => {
      const res = await ingredientTypeResolvers.__resolveType({ parts: 12 })

      expect(res).toEqual('RelativeIngredient')
    })
  })

  describe('ingredientResolvers', () => {

    test('makes a raw query to retrieve drink information', async () => {
      prisma.$queryRaw.mockResolvedValue([res])
      await ingredientResolvers.drink({ id: '123' }, {}, ctx, {})

      expect(prisma.$queryRaw).toHaveBeenCalled()
    })

    test('returns a MixedDrink type when response has ingredients', async () => {
      res = { ingredients: 3 } as Drink & { ingredients: number }
      prisma.$queryRaw.mockResolvedValue([res])
      const result = await ingredientResolvers.drink({ id: '123' }, {}, ctx, {})

      expect(deconstructId(result.id)[0]).toEqual('MixedDrink')
    })
    test('returns a MixedDrink type when response has ingredients', async () => {
      res = { ingredients: 0 } as Drink & { ingredients: number }
      prisma.$queryRaw.mockResolvedValue([res])
      const result = await ingredientResolvers.drink({ id: '123' }, {}, ctx, {})

      expect(deconstructId(result.id)[0]).toEqual('BaseDrink')
    })
  })

})
