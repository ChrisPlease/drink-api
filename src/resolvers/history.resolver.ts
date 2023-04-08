import { Drink } from '@prisma/client'
import { Entries } from '../models/Entry.model'
import { DrinkHistoryResolvers } from '../__generated__/graphql'

export const historyResolvers: DrinkHistoryResolvers = {
  async drink({ drink: { id } }, _, { prisma }) {
    return <Drink>await prisma.drink.findUnique({ where: { id } })
  },

  async entries({
    id,
  }, {
    sort,
    distinct,
    first,
    last,
    before,
    after,
  }, {
    prisma,
    req: { auth },
  }) {
    const entries = Entries(prisma.entry)

    return await entries.findManyPaginated(
      prisma,
      { sort, distinct, drinkId: id },
      { first, last, after, before },
      <string>auth?.sub,
    )
  },
}
