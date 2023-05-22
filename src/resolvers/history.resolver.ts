import { Drink } from '@prisma/client'
import { Entries } from '@/models/Entry.model'
import { DrinkHistoryResolvers } from '@/__generated__/graphql'
import { deconstructId } from '@/utils/cursorHash'

export const historyResolvers: DrinkHistoryResolvers = {
  async drink({ drink: { id: argId } }, args, { prisma }) {
    const [,id] = deconstructId(argId)
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
    args, {
      prisma,
      req: { auth },
    },
  ) {
    const [,id] = deconstructId(parent.id)

    return await Entries(prisma.entry)
      .findManyPaginated(prisma, { ...args, userId: <string>auth?.sub, drinkId: id })
  },
}
