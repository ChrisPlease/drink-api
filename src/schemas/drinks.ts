import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLInt,
} from 'graphql'
import { ingredientType, ingredientInput } from './ingredients'

export const drinkType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Drink',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: new GraphQLNonNull(GraphQLString) },
    coefficient: { type: GraphQLFloat },
    caffeine: { type: GraphQLFloat },
    sugar: { type: GraphQLFloat },
    ingredients: { type: new GraphQLList(ingredientType) },
  }),
})

export const drinkInput = new GraphQLInputObjectType({
  name: 'DrinkInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: new GraphQLNonNull(GraphQLString) },
    caffeine: { type: GraphQLInt },
    coefficient: { type: GraphQLFloat },
    sugar: { type: GraphQLInt },
    ingredients: { type: new GraphQLList(ingredientInput) },
  },
})
