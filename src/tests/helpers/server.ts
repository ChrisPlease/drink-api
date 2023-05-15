import { ApolloServer } from '@apollo/server'
import { AppContext } from '../../types/context'
import { resolvers } from '../../resolvers'
import { readFileSync } from 'fs'

export const testServer = new ApolloServer<AppContext>({
  typeDefs: readFileSync('./schema.gql', {
    encoding: 'utf-8',
  }),
  resolvers,
})
