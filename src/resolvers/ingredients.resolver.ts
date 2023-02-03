import { GraphQLFieldResolver } from 'graphql'
import { AppContext } from '../types/context'
import { dataSource } from '../database/data-source'
import { Ingredient } from '../database/entities/Ingredient.entity'
import { Drink } from '../database/entities/Drink.entity'

const ingredientRepository = dataSource.getRepository(Ingredient)

export const ingredientsResolver: GraphQLFieldResolver<Drink, AppContext, any, any> = async (
  parent,
  args,
  { loaders: { ingredientsLoader} },
) => {
  let ingredients: Ingredient[] = []

  if (parent.ingredients?.length) {
    try {
      console.log('trying')
      ingredients = <Ingredient[]>await ingredientsLoader.load(parent?.id)
    } catch {
      console.log('catching')
      ingredients = await ingredientRepository.find({
        where: {
          drink: { id: parent.id },
        },
      })
    }
  }

  return ingredients
}
