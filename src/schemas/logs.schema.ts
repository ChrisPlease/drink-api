import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

export const logType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Log',
  fields: () => ({
    entryTimestamp: { type: new GraphQLNonNull(GraphQLString) },
    volume: { type: new GraphQLNonNull(GraphQLInt) },
    waterContent: { type: GraphQLFloat },
    caffeine: { type: GraphQLFloat },
    sugar: { type: GraphQLFloat },
  }),
})

export const logVolumeHistoryType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'LogVolumeHistory',
  fields: () => ({
    timestamp: { type: new GraphQLNonNull(GraphQLString) },
    count: { type: GraphQLInt },
    volume: { type: new GraphQLNonNull(GraphQLInt) },
  }),
})
