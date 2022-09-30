import {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks'
import { logType } from './logs.schema'

export const entryType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Entry',
  fields: () => ({
    volume: { type: new GraphQLNonNull(GraphQLInt) },
    drink: { type: drinkType },
    count: { type: new GraphQLNonNull(GraphQLInt) },
    updatedAt: { type: new GraphQLNonNull(GraphQLString) },
    logs: { type: new GraphQLList(logType) },
  }),
})

export const entryInput = new GraphQLInputObjectType({
  name: 'EntryInput',
  fields: {
    drinkId: { type: GraphQLInt },
    volume: { type: GraphQLInt },
  },
})
