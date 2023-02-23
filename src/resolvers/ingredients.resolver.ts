import { GraphQLFieldResolver } from 'graphql'
import { AppContext } from '../types/context'
import { Drink } from '@prisma/client'
import { Drinks } from '../models/Drink.model'

// const ingredientRepository = dataSource.getRepository(Ingredient)

export const ingredientsResolver: GraphQLFieldResolver<Drink, AppContext, any, any> = async (
  parent,
  args,
  { prisma },
) => {
  // let ingredients: Ingredient[] = []

  return await prisma.drink.findUnique({ where: { id: parent.id } }).ingredients()
  // if (parent.ingredients?.length) {
  //   try {
  //     console.log('trying')
  //     ingredients = <Ingredient[]>await ingredientsLoader.load(parent?.id)
  //   } catch {
  //     console.log('catching')
  //     ingredients = await ingredientRepository.find({
  //       where: {
  //         drink: { id: parent.id },
  //       },
  //     })
  //   }
  // }

  // return ingredients
}
