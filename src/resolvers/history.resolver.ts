import { Drink } from '@prisma/client'
import { DrinkHistoryResolvers } from '../__generated__/graphql'
export const historyResolvers: DrinkHistoryResolvers = {
  async drink({ drink: { id } }, _, { prisma }) {
    return <Drink>await prisma.drink.findUnique({ where: { id } })
  },
}
