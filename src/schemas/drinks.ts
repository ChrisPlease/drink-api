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
import { entryType } from './entries'
import { ingredientType, ingredientInput } from './ingredients'

export const drinkType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Drink',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    coefficient: { type: GraphQLFloat },
    caffeine: { type: GraphQLFloat },
    sugar: { type: GraphQLFloat },
    ingredients: { type: new GraphQLList(ingredientType) },
    entries: { type: new GraphQLList(entryType) },
  }),
})

export const drinkInput = new GraphQLInputObjectType({
  name: 'DrinkInput',
  fields: {
    id: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: new GraphQLNonNull(GraphQLString) },
    caffeine: { type: GraphQLInt },
    coefficient: { type: GraphQLFloat },
    sugar: { type: GraphQLInt },
    ingredients: { type: new GraphQLList(ingredientInput) },
  },
})
