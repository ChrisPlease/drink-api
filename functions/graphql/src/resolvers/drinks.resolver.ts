import {
  BaseDrinkResolvers,
  DrinkNutrition,
  DrinkResolvers,
  DrinkResultResolvers,
  MixedDrinkResolvers,
  ScanDrinkResolvers,
  ScanDrinkResultResolvers,
} from '@/__generated__/graphql'
import { deconstructId } from '@/utils/cursorHash'
import { Drinks } from '@/models/Drink.model'
import { Entries } from '@/models/Entry.model'

export const drinkResultResolvers: DrinkResultResolvers = {
  async __resolveType(parent) {
    const [type] = deconstructId(parent?.id || '')
    return (type || 'BaseDrink') as 'MixedDrink' | 'BaseDrink'
  },
}

export const scanDrinkResultResolvers: ScanDrinkResultResolvers = {
  async __resolveType({ upc }, { prisma }) {
    const drink = await Drinks(prisma.drink).findUnique({ where: { upc: upc || '' } })
    return drink ? 'BaseDrink' : 'ScanDrink'
  },
}

export const scanDrinkResolvers: ScanDrinkResolvers = {
  nutrition(parent) {
    return parent.nutrition as DrinkNutrition
  },

}

export const drinkResolvers: DrinkResolvers = {
  ...drinkResultResolvers,

  async entries(parent, args, { prisma, user }) {
    const userId = <string>user
    const entries = await Entries(prisma.entry)
      .findManyPaginated(prisma, { ...args, drinkId: parent.id, userId })

    return entries
  },

  async nutrition(parent, args, { prisma }) {
    const drinkId = deconstructId(parent.id)[1]
    return <DrinkNutrition>await prisma.nutrition.findUnique({ where: { drinkId } })
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
