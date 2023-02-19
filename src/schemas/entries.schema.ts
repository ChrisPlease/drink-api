import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks.schema'
import { userType } from './users.schema'

export const entryType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Entry',
  fields: () => ({
    id: { type: GraphQLID },
    volume: { type: new GraphQLNonNull(GraphQLInt) },
    user: { type: userType },
    drink: { type: drinkType },
    count: { type: new GraphQLNonNull(GraphQLInt) },
    timestamp: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

export const entryInput = new GraphQLInputObjectType({
  name: 'EntryInput',
  fields: {
    drinkId: { type: new GraphQLNonNull(GraphQLString) },
    volume: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
