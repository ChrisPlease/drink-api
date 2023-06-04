import { deconstructId } from '../utils/cursorHash'
import { queryResolvers } from './query.resolver'
import { mutationResolvers } from './mutation.resolver'
import {
  baseDrinkResolvers,
  drinkResolvers,
  drinkResultResolvers,
  mixedDrinkResolvers,
} from './drinks.resolver'
import { ingredientResolvers } from './ingredients.resolver'
import { entryResolvers } from './entries.resolver'
import { historyResolvers } from './history.resolver'
import { usersResolver } from './users.resolver'
import { NodeResolvers, Resolvers } from '@/__generated__/graphql'

const nodeResolvers: NodeResolvers = {
  __resolveType(parent) {
    const [__typename] = deconstructId(parent.id)
    return __typename
  },
}

export const resolvers: Resolvers = {
  Query: queryResolvers,

  Node: nodeResolvers,

  Drink: drinkResolvers,
  BaseDrink: baseDrinkResolvers,
  MixedDrink: mixedDrinkResolvers,
  DrinkResult: drinkResultResolvers,
  DrinkHistory: historyResolvers,

  Ingredient: ingredientResolvers,

  Entry: entryResolvers,

  User: usersResolver,

  Sort: {
    ASC: 'asc',
    DESC: 'desc',
  },

  Mutation: mutationResolvers,
}
