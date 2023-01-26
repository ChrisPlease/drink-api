import { GraphQLFieldResolver } from 'graphql'
import { AppContext } from '../types/context'
import { dataSource } from '../database/data-source'
import { Ingredient } from '../database/entities/Ingredient.entity'
import { Drink } from '../database/entities/Drink.entity'

const ingredientRepository = dataSource.getRepository(Ingredient)

export const ingredientResolver: GraphQLFieldResolver<any, AppContext, { id: string }, any> = async (
  parent,
  { id },
) => {
  console.log('in the ingredient resolver:', id)
  const ingredient = ingredientRepository.findOneBy({ id })

  const foo = await Ingredient.findOneBy({ id })
  console.log(foo)
  throw new Error('Not yet implemented')
  // return await Ingredient.findByPk(parent?.id || id, {
  //   include: [{ model: DrinkIngredient, as: 'drinkIngredient', required: true }],
  // }) as IngredientModel
}

export const ingredientsResolver: GraphQLFieldResolver<Drink, AppContext, any, any> = async (
  parent,
  args,
  { loaders: { ingredientsLoader} },
) => {
  let ingredients: Ingredient[] = []
  const isDrinkIngredients = parent instanceof Drink

  console.log('here', parent.ingredients, parent.totalParts)

  if (isDrinkIngredients && parent.ingredients?.length) {
    try {
      ingredients = <Ingredient[]>await ingredientsLoader.load(parent?.id)
    } catch {
      ingredients = await ingredientRepository.find({
        where: {
          drink: { id: parent.id },
        },
      })
    }
  }

  return ingredients
}
