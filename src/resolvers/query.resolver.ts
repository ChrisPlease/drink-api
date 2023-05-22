import { Drink, Entry } from '@prisma/client'
import { DrinkHistory as DrinkHistoryModel } from '@/types/models'
import { QueryResolvers } from '@/__generated__/graphql'
import { Entries } from '@/models/Entry.model'
import { DrinkHistory } from '@/models/History.model'
import { Drinks } from '@/models/Drink.model'
import {
  toCursorHash,
  deconstructId,
} from '@/utils/cursorHash'

export const queryResolvers: QueryResolvers = {
  async node(_, { id: argId }, { prisma, req: { auth } }) {
    const [__typename,id] = deconstructId(argId)
    const userId = <string>auth?.sub

    let res

    switch (__typename) {
      case 'MixedDrink':
      case 'BaseDrink':
        res = <Drink>await Drinks(prisma.drink)
          .findUnique({ where: { id } })
        break
      case 'DrinkHistory':
        res = <DrinkHistoryModel>await DrinkHistory(prisma)
          .findUniqueDrinkHistory({
            where: {
              drinkId: id,
              userId,
            },
          })
        break
      case 'Entry':
        res = <Entry>await Entries(prisma.entry)
          .findUniqueWithNutrition({ where: { id } })
        break
    }

    const { id: resId, ...rest } = res

    return {
      id: toCursorHash(`${__typename}:${resId}`),
      ...rest,
    }
  },

  async drink(_, { drinkId: id }, { prisma }) {
    return await Drinks(prisma.drink)
      .findUniqueById(id)
  },

  async drinks(_, args, { prisma, req: { auth } }) {
    return await Drinks(prisma.drink).findManyPaginated({ ...args, userId: <string>auth?.sub })
  },

  async entry(_, { entryId }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub
    const [,id] = deconstructId(entryId)

    const entry = await Entries(prisma.entry).findUniqueWithNutrition({ where: { id, userId }})

    return entry
  },

  async entries(_, args,  { prisma, req: { auth } }) {
    return await Entries(prisma.entry).findManyPaginated(prisma, { ...args, userId: <string>auth?.sub })
  },

  async drinkHistory(_, { drinkId }, { prisma, req: { auth } }) {
    return await DrinkHistory(prisma).findUniqueDrinkHistory({
      where: {
        drinkId,
        userId: <string>auth?.sub,
      },
    })
  },

  async drinksHistory(
    _,
    args, { prisma, req: { auth } }) {
    return await DrinkHistory(prisma).findManyPaginated({ ...args, userId: <string>auth?.sub }, prisma)
  },

  async me(parent, args, { prisma, req }) {
    const userId = <string>req.auth?.sub
    return await prisma.user.findUnique({ where: { id: userId }})
  },

  async user(parent, { userId }, { prisma }) {
    return await prisma.user.findUnique({ where: { id: userId } })
  },

  async users(parent, args, { prisma }) {
    return await prisma.user.findMany()
  },
}

