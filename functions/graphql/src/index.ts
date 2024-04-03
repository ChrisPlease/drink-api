import { readFileSync } from 'node:fs'
import {
  startServerAndCreateLambdaHandler,
  handlers,
  middleware,
} from '@as-integrations/aws-lambda'
import * as dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
// import { RedisClientType } from 'redis'
import prisma from './client'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'

dotenv.config()

const server = new ApolloServer<AppContext>({
  typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
  introspection: process.env.NODE_ENV === 'development',
  resolvers,
  // cache: new KeyvAdapter(
  //   new Keyv(
  //     `redis://:${
  //       process.env.REDIS_PASSWORD
  //     }@${
  //       process.env.REDIS_HOST
  //     }:${
  //       process.env.REDIS_PORT
  //     }`,
  //   ),
  // ),
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
        // redis: {} as RedisClientType,
      }
    },
    middleware: [
      corsMiddleware,
    ],
  },
)
