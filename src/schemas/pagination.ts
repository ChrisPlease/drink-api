import { GraphQLInt, GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString } from 'graphql'

const edgeType = (type: GraphQLObjectType) => new GraphQLObjectType({
  name: `${type.name}Edge`,
  fields: {
    cursor: { type: GraphQLString },
    node: { type },
  },
})

export const paginationType = (name: string, type: GraphQLObjectType) => new GraphQLObjectType({
  name,
  fields: {
    edges: {
      type: new GraphQLList(edgeType(type)),
    },
    pageInfo: {
      type: new GraphQLObjectType({
        name: `${type.name}PageInfo`,
        fields: {
          records: { type: GraphQLInt },
          lastCursor: { type: GraphQLString },
          hasNextPage: { type: GraphQLBoolean },
        },
      }),
    },
  },
})
