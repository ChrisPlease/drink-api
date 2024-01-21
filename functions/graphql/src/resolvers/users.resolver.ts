import { UserResolvers } from '../__generated__/graphql'
import { Drinks } from '../models/Drink.model'
import { Entries } from '../models/Entry.model'
import { deconstructId } from '@/graphql/src/utils/cursorHash'
import { DrinkHistory } from '@/graphql/src/models/History.model'

export const usersResolver: UserResolvers = {
  async drinks(parent, args, { prisma }) {
    const [,userId] = deconstructId(parent.id)
    return await Drinks(prisma.drink).findManyPaginated({ ...args, userId })
  },

  async entries(parent, args, { prisma }) {
    const [,userId] = deconstructId(parent.id)
    return await Entries(prisma.entry).findManyPaginated(prisma, { ...args, userId })
  },

  async drinksHistory(parent, args, { prisma }) {
    const [,userId] = deconstructId(parent.id)
    return await DrinkHistory(prisma).findManyPaginated({
      ...args,
      userId,
      filter: {
        ...args.filter,
        hasEntries: true,
      },
    })
  },
}
