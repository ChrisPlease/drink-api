import { readFileSync } from 'fs'
import { ApolloServer } from '@apollo/server'
import { AppContext } from '../../types/context'
import { resolvers } from '../../resolvers'

export const testServer = new ApolloServer<AppContext>({
  typeDefs: readFileSync('./schema.gql', {
    encoding: 'utf-8',
  }),
  resolvers,
})
