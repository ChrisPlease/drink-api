import { Drink } from '@prisma/client'
import { Entries } from '@/graphql/src/models/Entry.model'
import { DrinkHistoryResolvers } from '@/graphql/src/__generated__/graphql'
import { Drinks } from '@/graphql/src/models/Drink.model'

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
