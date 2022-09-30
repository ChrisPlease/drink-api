import {
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
  }),
})
