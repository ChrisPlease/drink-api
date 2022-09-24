import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { DrinkModel } from '../models/Drink.model'

export const ingredientResolver: GraphQLFieldResolver<any, any> = async (
  _,
  { id },
) => {
  console.log('resolving a single ingredient')
  const ingredient = await Ingredient.findByPk(id, {
    include: [{
      model: Drink,
      as: 'drink',
    }],
  })

  return ingredient
}

export const ingredientsResolver: GraphQLFieldResolver<any, any> = async (
  parent: DrinkModel,
) => {
  if (!parent) {
    const ingredients = await Ingredient.findAll({
      order: [['id', 'ASC']],
    })
    return ingredients
  } else {
    return await parent.getIngredients({ joinTableAttributes: [] })
  }

}
