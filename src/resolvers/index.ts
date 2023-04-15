import { NodeResolvers, Resolvers } from '../__generated__/graphql'
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
import { fromCursorHash } from '../utils/cursorHash'

const nodeResolvers: NodeResolvers = {
  __resolveType(parent) {
    const [__typename] = fromCursorHash(parent.id).split(':') as ['BaseDrink' | 'MixedDrink' | 'Entry']
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

  Sort: {
    ASC: 'asc',
    DESC: 'desc',
  },

  Mutation: mutationResolvers,
}
