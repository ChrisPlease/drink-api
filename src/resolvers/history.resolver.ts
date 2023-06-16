import { Drink } from '@prisma/client'
import { Entries } from '@/models/Entry.model'
import { DrinkHistoryResolvers } from '@/__generated__/graphql'
import { Drinks } from '@/models/Drink.model'

export const historyResolvers: DrinkHistoryResolvers = {
  async drink({ drink: { id: argId } }, args, { prisma }) {
    return <Drink>await Drinks(prisma.drink).findUniqueById(argId)
  },

  async entries(
    parent,
    args, {
      prisma,
      req: { auth },
    },
  ) {

    return await Entries(prisma.entry)
      .findManyPaginated(
        prisma,
        {
          ...args,
          userId: <string>auth?.sub,
          drinkId: parent.id,
        })
  },
}
