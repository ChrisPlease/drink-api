import { readFileSync } from 'node:fs'
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda'
import * as dotenv from 'dotenv'
// import express from 'express'
import { ApolloServer } from '@apollo/server'
import { RedisClientType } from 'redis'
import prisma from './client'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'

dotenv.config()

  const server = new ApolloServer<AppContext>({
    typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
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

export const handler = startServerAndCreateLambdaHandler(
  server,
  requestHandler,
  {
    context: async ({ event }) => {
      console.log('EVENT:', event)
      return {
        req: {} as Request,
        res: {} as Response,
        prisma,
        redis: {} as RedisClientType,
      }
    },
  },
)
