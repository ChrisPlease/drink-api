import { getIngredientCount } from '/opt/nodejs/node_modules/.prisma/client/sql'
import { constructId, deconstructId } from '@waterlog/utils'
import {
  AbsoluteIngredient,
  AbsoluteIngredientResolvers,
  IngredientResolvers,
  RelativeIngredientResolvers,
} from '@/__generated__/graphql'


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
    const [,ingredientId] = deconstructId(parent.id)
    const [{
      id,
      ingredients,
      user_id: userId,
      created_at: createdAt,
      metric_size: metricSize,
      serving_size: servingSize,
      serving_unit: servingUnit,
      ...drink
    }] = await prisma.$queryRawTyped(getIngredientCount(ingredientId)) ?? [{}]

    return {
      id: constructId(`${ingredients! > 0 ? 'Mixed' : 'Base'}Drink`, id),
      userId,
      createdAt,
      metricSize,
      servingSize,
      servingUnit,
      ...drink,
    }
  },
}

