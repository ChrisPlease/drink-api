import { Drink, Entry } from '@prisma/client'
import { DrinkHistory as DrinkHistoryModel } from '@/types/models'
import { QueryResolvers } from '@/__generated__/graphql'
import { Entries } from '@/models/Entry.model'
import { DrinkHistory } from '@/models/History.model'
import { Drinks } from '@/models/Drink.model'
import {
  deconstructId,
} from '@/utils/cursorHash'

export const queryResolvers: QueryResolvers = {
  async node(_, { id: argId }, { prisma, req: { auth } }) {
    const [__typename] = deconstructId(argId)
    const userId = <string>auth?.sub

    switch (__typename) {
      case 'MixedDrink':
      case 'BaseDrink':
        return <Drink>await Drinks(prisma.drink)
          .findUniqueById(argId)
      case 'DrinkHistory':
        return <DrinkHistoryModel>await DrinkHistory(prisma)
          .findUniqueDrinkHistory(argId, userId)
      case 'Entry':
        return <Entry>await Entries(prisma.entry)
          .findUniqueWithNutrition(argId, userId)
    }
  },

  async drink(_, { drinkId: id }, { prisma }) {
    return await Drinks(prisma.drink)
      .findUniqueById(id)
  },

  async drinks(_, args, { prisma, req: { auth } }) {
    return await Drinks(prisma.drink).findManyPaginated({ ...args }, <string>auth?.sub)
  },

  async entry(_, { entryId }, { prisma, req: { auth } }) {
    return await Entries(prisma.entry).findUniqueWithNutrition(entryId, <string>auth?.sub)
  },

  async entries(_, args,  { prisma, req: { auth } }) {
    return await Entries(prisma.entry).findManyPaginated(prisma, { ...args, userId: <string>auth?.sub })
  },

  async drinkHistory(_, { drinkId }, { prisma, req: { auth } }) {
    return await DrinkHistory(prisma).findUniqueDrinkHistory(drinkId, <string>auth?.sub)
  },

  async drinksHistory(_, args, { prisma, req: { auth } }) {
    return await DrinkHistory(prisma).findManyPaginated({ ...args, userId: <string>auth?.sub }, prisma)
  },

  async me(parent, args, { prisma, req: { auth } }) {
    return await prisma.user.findUnique({ where: { id: <string>auth?.sub }})
  },

  async user(parent, { userId }, { prisma }) {
    return await prisma.user.findUnique({ where: { id: userId } })
  },

  async users(parent, args, { prisma }) {
    return await prisma.user.findMany()
  },
}

