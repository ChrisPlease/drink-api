import { GraphQLFieldResolver } from 'graphql'
import { DrinkIngredient, Ingredient } from '../models'
import { DrinkModel } from '../models/Drink.model'
import { IngredientModel } from '../models/Ingredient.model'
import { AppContext } from '../types/context'

export const ingredientResolver: GraphQLFieldResolver<any, AppContext, { id: string }, any> = async (
  parent,
  { id },
) => {
  return await Ingredient.findByPk(id, {
    include: [{ model: DrinkIngredient, as: 'drinkIngredient', required: true }],
  })
}

export const ingredientsResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
  parent: DrinkModel,
  args,
  { loaders: { ingredientsLoader} },
) => {
  let ingredients: IngredientModel[] = []
  if (parent?.totalParts > 1) {
    ingredients = await ingredientsLoader.load(parent?.id) as IngredientModel[]
  } else if (!parent) {
    ingredients = await Ingredient.findAll({
      include: [{
        model: DrinkIngredient, as: 'drinkIngredient', required: true,
      }],
    })
  }

  return ingredients
}
