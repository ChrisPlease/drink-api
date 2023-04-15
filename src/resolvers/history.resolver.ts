import { Drink } from '@prisma/client'
import { Entries } from '../models/Entry.model'
import { DrinkHistoryResolvers } from '../__generated__/graphql'
import { fromCursorHash } from '../utils/cursorHash'

export const historyResolvers: DrinkHistoryResolvers = {
  async drink({ drink: { id: argId } }, args, { prisma }) {
    const [,id] = fromCursorHash(argId).split(':')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...drink } = <Drink>await prisma.drink.findUnique({
      where: { id },
    })

    return {
      id: argId,
      ...drink,
    }
  },

  async entries(
    parent,
      {
      sort,
      distinct,
      first,
      last,
      before,
      after,
    }, {
      prisma,
      req: { auth },
    },
  ) {
    const [,id] = fromCursorHash(parent.id).split(':')
    const entries = Entries(prisma.entry)

    return await entries.findManyPaginated(
      prisma,
      { sort, distinct, drinkId: id },
      { first, last, after, before },
      <string>auth?.sub,
    )
  },
}
