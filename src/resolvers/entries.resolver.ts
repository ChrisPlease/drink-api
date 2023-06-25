
import { EntryResolvers } from '@/__generated__/graphql'
import { Entries } from '@/models/Entry.model'

export const entryResolvers: EntryResolvers = {
  async drink({ id }, _, { prisma }) {
    console.log('here', id)
    return await Entries(prisma.entry).findDrinkByEntryId(id)
  },


  async user({ id }, _, { prisma }) {
    return await Entries(prisma.entry).findUserByEntryId(id)
  },
}
