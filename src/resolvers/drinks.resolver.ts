import { Drink } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { DrinkResolvers } from '../__generated__/graphql'

export const drinkResolvers: DrinkResolvers = {

  async entries(parent, args, { prisma, req: { auth } }) {
    const entries = await prisma.drink.findUnique({
      where: { id: parent.id },
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
        id: parent.id,
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

  async ingredients(parent, args, { prisma }) {
    const ingredients = await prisma.drink.findUnique({
      where: { id: parent.id },
    }).ingredients()

    return ingredients
  },

  async user(parent, args, { prisma }) {
    return await prisma.drink.findUnique({
      where: { id: parent.id },
    }).user()
  },

}
