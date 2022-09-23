import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { DrinkModel } from '../models/Drink.model'

export const ingredientResolver: GraphQLFieldResolver<any, any> = async (
  _,
  { id },
) => {
  const ingredient = await Ingredient.findByPk(id, {
    include: [{
      model: Drink,
      as: 'drink',
    }],
  })

  return ingredient
}

export const ingredientsResolver: GraphQLFieldResolver<any, any> = async (
  prev: DrinkModel,
  {
    ...pagination
  },
) => {
  if (!prev) {
    const { rows: ingredients, count } = await Ingredient.findAndCountAll({
      distinct: true,
      order: [['id', 'ASC']],
    }).then(({ rows, count }) => ({ rows: rows.map(i => i.toJSON()), count }))

    return {
      nodes: ingredients,
      pageInfo: {
        records: count,
        ...pagination,
      },
    }
  }

  if (prev?.ingredients?.length > 0) {
    return await prev.getIngredients({ joinTableAttributes: [] })
  } else {
    return []
  }

}
