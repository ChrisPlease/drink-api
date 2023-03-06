
import { EntryResolvers } from '../__generated__/graphql'

export const entryResolvers: EntryResolvers = {
  async drink(parent, _, { prisma }) {
    return await prisma.entry.findUnique({
      where: {
        id: parent.id,
      },
    }).drink()
  },

  async user(parent, _, { prisma }) {
    return await prisma.entry.findUnique({
      where: {
        id: parent.id,
      },
    }).user()
  },
}
