import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks.schema'
import { logType } from './logs.schema'
import { userType } from './users.schema'

export const entryType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Entry',
  fields: () => ({
    id: { type: GraphQLID },
    volume: { type: new GraphQLNonNull(GraphQLInt) },
    user: { type: userType },
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
