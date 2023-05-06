
import { Drink } from '@prisma/client'
import { EntryResolvers } from '../__generated__/graphql'
import { deconstructId, toCursorHash } from '../utils/cursorHash'

export const entryResolvers: EntryResolvers = {
  async drink({ id: argId }, _, { prisma }) {
    const [,id] = deconstructId(argId)
    const drink = <Drink>await prisma.entry.findUnique({
      where: { id },
    }).drink({ include: { _count: { select: { ingredients: true } } } })

    return {
      ...drink,
      id: toCursorHash(`DrinkResult:${drink.id}`),
    }
  },

  async user({ id }, _, { prisma }) {
    return await prisma.entry.findUnique({
      where: { id },
    }).user()
  },
}
