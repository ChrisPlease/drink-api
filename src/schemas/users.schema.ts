import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks.schema'
import { entryType } from './entries.schema'

export const userInput = new GraphQLInputObjectType({
  name: 'UserInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const userType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    username: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    drinks: { type: new GraphQLList(drinkType) },
    entries: { type: new GraphQLList(entryType) },
  }),
})
