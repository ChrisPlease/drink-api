import { roundNumber } from '../utils/roundNumber'
import { Drinks } from '../models/Drink.model'
import { MutationResolvers } from '../__generated__/graphql'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, { volume, drinkId }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub

    const {
      drink: { caffeine, sugar, coefficient },
      ...entry
    } = await prisma.entry.create({
      data: {
        volume,
        drinkId,
        userId,
      },
      include: {
        drink: {
          select: {
            caffeine: true,
            coefficient: true,
            sugar: true,
          },
        },
      },
    })

    const nutrition = {
      sugar: roundNumber((sugar ?? 0) * volume),
      waterContent: roundNumber((coefficient ?? 0) * volume),
      caffeine: roundNumber((caffeine ?? 0) * volume),
    }

    return {
      ...nutrition,
      ...entry,
    }
  },

  async drinkCreate(_, { drinkInput }, { prisma, req: { auth } }) {
    const drink = Drinks(prisma.drink, prisma)
    const userId = <string>auth?.sub

    const {
      caffeine,
      sugar,
      servingSize,
      ingredients,
      ...rest
    } = drinkInput

    if (ingredients) {
      return await drink.createWithIngredients(
        { userId, ...rest },
        ingredients,
      )
    }

    const nutrition = {
      caffeine: roundNumber(+(caffeine ?? 0) / +(servingSize ?? 1)),
      sugar: roundNumber(+(sugar ?? 0) / +(servingSize ?? 1)),
      coefficient: roundNumber(+(drinkInput.coefficient ?? 0)),
    }

    return await drink.create({ data: { ...rest, ...nutrition, userId }})
  },

  async drinkDelete(_, { drinkId }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub
    return await prisma.drink.delete({ where: { id_userId: { id: drinkId, userId } } })
  },
}
