import { Drink } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import {
  BaseDrinkResolvers,
  DrinkResolvers,
  DrinkResultResolvers,
  MixedDrinkResolvers,
} from '../__generated__/graphql'
import { fromCursorHash } from '../utils/cursorHash'

export const drinkResultResolvers: DrinkResultResolvers = {
  async __resolveType(parent, { prisma }) {
    const [,id] = fromCursorHash(parent.id).split(':')
    const ingredients = await prisma.drink.findUnique({
      where: { id },
    }).ingredients()
    return ingredients?.length ? 'MixedDrink' : 'BaseDrink'
  },

}

export const drinkResolvers: DrinkResolvers = {
  ...drinkResultResolvers,

  async entries(parent, args, { prisma, req: { auth } }) {
    const [,id] = fromCursorHash(parent.id).split(':')
    const entries = await prisma.drink.findUnique({
      where: { id },
    }).entries({
      where: { userId: auth?.sub },
      orderBy: {
        timestamp: 'desc',
      },
    })

    const {
      caffeine,
      sugar,
      coefficient,
    } = <Drink>await prisma.drink.findUnique({
      where: {
        id,
      },
      select: {
        caffeine: true,
        sugar: true,
        coefficient: true,
      },
    })

    return entries?.map(({ volume, ...entry }) => {
      const nutrition: { caffeine: number; waterContent: number; sugar: number } = {
        caffeine: roundNumber((caffeine ?? 0) * volume),
        waterContent: roundNumber((coefficient ?? 0) * volume),
        sugar: roundNumber((sugar ?? 0) * volume),
      }

      return {
        volume,
        ...nutrition,
        ...entry,
      }
    }) || []
  },

  async user(parent, args, { prisma }) {
    const [,id] = fromCursorHash(parent.id).split(':')
    return await prisma.drink.findUnique({
      where: { id },
    }).user()
  },

}

export const baseDrinkResolvers: BaseDrinkResolvers = {
  ...drinkResolvers,
}

export const mixedDrinkResolvers: MixedDrinkResolvers = {
  ...drinkResolvers,

  async ingredients(parent, args, { prisma }) {
    const [,id] = fromCursorHash(parent.id).split(':')
    const ingredients = await prisma.drink.findUnique({
      where: { id },
    }).ingredients({ include: { ingredient: true } })
      .then(ingredients => ingredients?.map(({ ingredient }) => ingredient))

    return ingredients || []
  },
}
