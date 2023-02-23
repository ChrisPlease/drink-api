import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { drinkType } from './drinks.schema'
import { userType } from './users.schema'

export const drinkHistoryType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'DrinkEntryHistory',
  fields: () => ({
    count: {
      type: GraphQLInt,
      resolve(obj) {
        console.log(obj)
        return obj.caffeine
      },
    },
    totalVolume: { type: GraphQLFloat },
    lastEntry: { type: GraphQLString },
    drink: { type: drinkType },
    entries: { type: new GraphQLList(entryType) },
  }),
})

export const entryType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Entry',
  fields: () => ({
    id: { type: GraphQLID },
    volume: { type: new GraphQLNonNull(GraphQLFloat) },
    user: { type: userType },
    drink: { type: drinkType },
    timestamp: { type: new GraphQLNonNull(GraphQLString) },
  }),
})

export const entryInput = new GraphQLInputObjectType({
  name: 'EntryInput',
  fields: {
    drinkId: { type: new GraphQLNonNull(GraphQLString) },
    volume: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})
