import {
  BaseDrinkResolvers,
  DrinkResolvers,
  DrinkResultResolvers,
  MixedDrinkResolvers,
} from '@/__generated__/graphql'
import { deconstructId } from '@/utils/cursorHash'
import { Drinks } from '@/models/Drink.model'

export const drinkResultResolvers: DrinkResultResolvers = {
  async __resolveType(parent) {
    const [type] = deconstructId(parent.id)
    return type as 'MixedDrink' | 'BaseDrink'
  },

}

export const drinkResolvers: DrinkResolvers = {
  ...drinkResultResolvers,

  async entries(parent, args, { prisma, req: { auth } }) {
    return await Drinks(prisma.drink).findDrinkEntries(parent.id, <string>auth?.sub)
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
