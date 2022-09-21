import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
} from 'graphql'
import { drinkResolver } from '../resolvers/drinks.resolver'
import { drinkType } from './drinks'

export const ingredientType = new GraphQLObjectType({
  name: 'Ingredient',
  fields: () => ({
    id: { type: GraphQLID },
    parts: { type: GraphQLInt },
    drink: {
      type: drinkType,
      resolve: drinkResolver,
    },
  }),
})

export const ingredientInput = new GraphQLInputObjectType({
  name: 'IngredientInput',
  fields: {
    parts: { type: new GraphQLNonNull(GraphQLInt) },
    drinkId: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
