
import { Drink } from '@prisma/client'
import { EntryResolvers } from '@/__generated__/graphql'
import { toCursorHash } from '@/utils/cursorHash'

export const entryResolvers: EntryResolvers = {
  async drink({ id }, _, { prisma }) {
    const {
      _count: { ingredients },
      ...drink
    } = <Drink & { _count: { ingredients: number } }>await prisma.entry.findUnique({
      where: { id },
    }).drink({ include: { _count: { select: { ingredients: true } } } })
    return {
      ...drink,
      id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${drink.id}`),
    }
  },


  async user({ id }, _, { prisma }) {
    return await prisma.entry.findUnique({
      where: { id },
    }).user()
  },
}
