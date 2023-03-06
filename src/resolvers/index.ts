import { Resolvers } from '../__generated__/graphql'
import { queryResolvers } from './query.resolver'
import { mutationResolvers } from './mutation.resolver'
import { drinkResolvers } from './drinks.resolver'
import { ingredientResolvers } from './ingredients.resolver'
import { entryResolvers } from './entries.resolver'
import { historyResolvers } from './history.resolver'

export const resolvers: Resolvers = {
  Query: queryResolvers,
  Drink: drinkResolvers,
  Ingredient: ingredientResolvers,
  Entry: entryResolvers,
  DrinkHistory: historyResolvers,

  Mutation: mutationResolvers,
}
