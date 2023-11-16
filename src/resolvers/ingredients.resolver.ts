import { Drink } from '@prisma/client'
import {
  AbsoluteIngredient,
  AbsoluteIngredientResolvers,
  IngredientResolvers,
  RelativeIngredientResolvers,
} from '@/__generated__/graphql'
import { toCursorHash } from '@/utils/cursorHash'


export const ingredientTypeResolvers: IngredientResolvers = {
  async __resolveType(parent) {
    const type = parent as AbsoluteIngredient
    if (type.volume) return 'AbsoluteIngredient' as const

    return 'RelativeIngredient' as const
  },
}

export const ingredientResolvers: AbsoluteIngredientResolvers & RelativeIngredientResolvers = {
  ...ingredientTypeResolvers,

  async drink(parent, _, { prisma }) {
    const [{
      id,
      ingredients,
      serving_size: servingSize,
      ...drink
    }] = <(Omit<Drink, 'servingSize'> & { ingredients: number; serving_size: string })[]>await prisma.$queryRaw`
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
      servingSize: +servingSize,
      ...drink,
    }
  },
}
