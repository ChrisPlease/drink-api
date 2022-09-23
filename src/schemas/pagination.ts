import { GraphQLInt, GraphQLObjectType, GraphQLList, GraphQLBoolean, GraphQLString } from 'graphql'
import DataLoader from 'dataloader'
import { Drink } from '../models'
import { Op } from 'sequelize'

const edgeType = (type: GraphQLObjectType) => new GraphQLObjectType({
  name: `${type.name}Edge`,
  fields: {
    cursor: { type: GraphQLString },
    node: { type },
  },
})

export const paginationType = (type: GraphQLObjectType) => new GraphQLObjectType({
  name: `${type.name}Paginated`,
  fields: {
    edges: {
      type: new GraphQLList(edgeType(type)),
      resolve: async ({ nodes, pageInfo }) => {
        const edges: any[] = nodes
          .map((node: any) => ({ cursor: node.id, node }))
        return edges
      },
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
