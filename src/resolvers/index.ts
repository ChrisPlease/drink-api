import { GraphQLScalarType, Kind } from 'graphql'
import { deconstructId } from '../utils/cursorHash'
import { queryResolvers } from './query.resolver'
import { mutationResolvers } from './mutation.resolver'
import {
  baseDrinkResolvers,
  drinkResolvers,
  drinkResultResolvers,
  mixedDrinkResolvers,
} from './drinks.resolver'
import { ingredientResolvers, ingredientTypeResolvers } from './ingredients.resolver'
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

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime()
    }

    throw Error('GraphQL Date Scalar serializer expected a `Date`')
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value)
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`')
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value)
    }
    return null
  },
})

export const resolvers: Resolvers = {
  Date: dateScalar,

  Query: queryResolvers,

  Node: nodeResolvers,

  Drink: drinkResolvers,
  BaseDrink: baseDrinkResolvers,
  MixedDrink: mixedDrinkResolvers,
  DrinkResult: drinkResultResolvers,
  DrinkHistory: historyResolvers,

  AbsoluteIngredient: ingredientResolvers,
  RelativeIngredient: ingredientResolvers,
  Ingredient: ingredientTypeResolvers,

  Entry: entryResolvers,

  User: usersResolver,

  Comparison: {
    LT: 'lt',
    GT: 'gt',
    LTE: 'lte',
    GTE: 'gte',
  },

  Sort: {
    ASC: 'asc',
    DESC: 'desc',
  },

  Mutation: mutationResolvers,
}
