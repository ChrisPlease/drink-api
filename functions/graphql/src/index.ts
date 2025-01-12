import { readFileSync } from 'node:fs'
import {
  startServerAndCreateLambdaHandler,
  handlers,
  middleware,
} from '@as-integrations/aws-lambda'
import * as dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl'
import responseCachePlugin from '@apollo/server-plugin-response-cache'
import { getKeyvClient } from '/opt/nodejs/redis'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import prisma from '/opt/nodejs/client'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'

dotenv.config()

const redisCache = new KeyvAdapter(getKeyvClient())

const server = new ApolloServer<AppContext>({
  typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
  introspection: process.env.NODE_ENV === 'development',
  resolvers,
  cache: redisCache,
  plugins: [
    ApolloServerPluginCacheControl({
      defaultMaxAge: 60,
    }),
    responseCachePlugin({
      async sessionId(requestContext) {
        return requestContext.contextValue.user || null
      },
    }),
  ],
})

const requestHandler = handlers.createAPIGatewayProxyEventRequestHandler()

const corsMiddleware: middleware.MiddlewareFn<typeof requestHandler> = async () => {
  return async (result) => {
    result.headers = {
      ...result.headers,
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    }
  }
}

export const handler = startServerAndCreateLambdaHandler(
  server,
  requestHandler,
  {
    context: async ({ event }) => {
      return {
        user: event.requestContext.authorizer?.principalId,
        prisma,
      }
    },
    middleware: [
      corsMiddleware,
    ],
  },
)
