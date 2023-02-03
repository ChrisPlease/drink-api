import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks.schema'

export const ingredientType = new GraphQLObjectType({
  name: 'Ingredient',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    parts: { type: new GraphQLNonNull(GraphQLInt) },
    drink: { type: drinkType },
  }),
})

export const ingredientInput = new GraphQLInputObjectType({
  name: 'IngredientInput',
  fields: {
    parts: { type: new GraphQLNonNull(GraphQLInt) },
    drinkId: { type: new GraphQLNonNull(GraphQLString) },
  },
})
