import { Drink } from '@prisma/client'
import { Entries } from '@/models/Entry.model'
import { DrinkHistoryResolvers } from '@/__generated__/graphql'
import { Drinks } from '@/models/Drink.model'

export const historyResolvers: DrinkHistoryResolvers = {
  async drink({ id }, _, { prisma }) {
    return <Drink>await Drinks(prisma.drink).findUniqueById(id || '')
  },

  async entries(
    parent,
    args,
    {
      prisma,
      user,
    },
  ) {
    return await Entries(prisma.entry)
      .findManyPaginated(
        prisma,
        {
          ...args,
          userId: user || '',
          drinkId: parent.id,
        })
  },
}