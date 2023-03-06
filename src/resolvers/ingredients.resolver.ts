import { Drink } from '@prisma/client'
import { IngredientResolvers } from '../__generated__/graphql'

export const ingredientResolvers: IngredientResolvers = {
  async drink(parent, _, { prisma }) {
    const [drink] = <Drink[]>await prisma.$queryRaw`SELECT d.* FROM ingredients i INNER JOIN drinks d ON d.id = i.drink_id WHERE i.id = ${parent.id}::uuid`

    return drink
  },
}
