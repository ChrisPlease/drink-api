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
import { AppContext } from '../types/context'
import { deconstructId } from '../utils/cursorHash'
import { ingredientResolvers } from './ingredients.resolver'

describe('ingredientResolvers', () => {
  let ctx: AppContext
  let res: Drink & { ingredients: number }

  beforeEach(() => {
    ctx = {
      prisma,
      req: {} as Request,
      res: {} as Response,
    }
    res = {} as Drink & { ingredients: number }
  })
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
