import { Drink } from '@prisma/client'
import {
  AbsoluteIngredient,
  AbsoluteIngredientResolvers,
  IngredientResolvers,
  RelativeIngredientResolvers,
} from '@/graphql/src/__generated__/graphql'
import { queryIngredientCount } from '@/graphql/src/utils/queries'
import { toCursorHash } from '@/graphql/src/utils/cursorHash'


export const ingredientTypeResolvers: IngredientResolvers = {
  async __resolveType(parent) {
    const type = parent as AbsoluteIngredient
    if (type.volume) return 'AbsoluteIngredient' as const

    return 'RelativeIngredient' as const
  },
}

export const ingredientResolvers: AbsoluteIngredientResolvers & RelativeIngredientResolvers = {
  ...ingredientTypeResolvers,

  async drink(parent, _, { prisma }): Promise<Drink> {
    const [{
      id,
      ingredients,
      ...drink
    }] = await queryIngredientCount(prisma, parent.id)

    return {
      id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${id}`),
      ...drink,
    }
  },
}
6
