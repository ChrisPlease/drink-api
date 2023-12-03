import {
  BaseDrinkResolvers,
  DrinkResolvers,
  DrinkResultResolvers,
  MixedDrinkResolvers,
} from '@/__generated__/graphql'
import { deconstructId } from '@/utils/cursorHash'
import { Drinks } from '@/models/Drink.model'
import { Entries } from '@/models/Entry.model'

export const drinkResultResolvers: DrinkResultResolvers = {
  async __resolveType(parent) {
    const [type] = deconstructId(parent.id)
    return type as 'MixedDrink' | 'BaseDrink'
  },
}

export const drinkResolvers: DrinkResolvers = {
  ...drinkResultResolvers,

  async entries(parent, args, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub
    const entries = await Entries(prisma.entry)
      .findManyPaginated(prisma, { ...args, drinkId: parent.id, userId })

    return entries
  },

  async nutrition(parent, args, { prisma }) {
    const drinkId = deconstructId(parent.id)[1]
    return await prisma.nutrition.findUnique({ where: { drinkId } })
  },

  async user(parent, args, { prisma }) {
    return await Drinks(prisma.drink).findDrinkUser(parent.id)
  },

}

export const baseDrinkResolvers: BaseDrinkResolvers = {
  ...drinkResolvers,
}

export const mixedDrinkResolvers: MixedDrinkResolvers = {
  ...drinkResolvers,

  async ingredients(parent, args, { prisma }) {
    return await Drinks(prisma.drink).findDrinkIngredients(parent.id)
  },
}
