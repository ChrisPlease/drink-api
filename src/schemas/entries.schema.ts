import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks.schema'
import { logType, logVolumeHistoryType } from './logs.schema'
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
    totalVolume: { type: GraphQLInt },
    logs: {
      type: new GraphQLList(logType),
      args: {
        unique: { type: GraphQLBoolean },
      },
    },
    logHistory: {
      type: new GraphQLList(logVolumeHistoryType),
    },
  }),
})

export const entryInput = new GraphQLInputObjectType({
  name: 'EntryInput',
  fields: {
    drinkId: { type: GraphQLInt },
    volume: { type: GraphQLInt },
  },
})
