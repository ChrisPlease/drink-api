import { Drink } from '@prisma/client'
import { IngredientResolvers } from '../__generated__/graphql'
import { toCursorHash } from '../utils/cursorHash'

export const ingredientResolvers: IngredientResolvers = {
  async drink(parent, _, { prisma }) {
    const [{ id, ingredients, ...drink }] = <(Drink & { ingredients: number })[]>await prisma.$queryRaw`
      SELECT
        d.*,
        COUNT(i2) AS ingredients
      FROM ingredients i
      INNER JOIN drinks d ON d.id = i.drink_id
      LEFT JOIN drink_ingredients di ON di.ingredient_id = d.id
      LEFT JOIN ingredients i2 ON di.drink_id = i2.id
      WHERE i.id = ${parent.id}::uuid
      GROUP BY d.id`

    return {
      id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${id}`),
      ...drink,
    }
  },
}
