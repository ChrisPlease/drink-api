import { readFileSync } from 'node:fs'
import type { Handler, APIGatewayEvent, Context } from 'aws-lambda'
import {
  startServerAndCreateLambdaHandler,
  handlers,
  middleware,
} from '@as-integrations/aws-lambda'
import * as dotenv from 'dotenv'
// import express from 'express'
import { ApolloServer, HeaderMap } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
// import cors from 'cors'
// import bodyParser from 'body-parser'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import Keyv from 'keyv'
// import { redis } from './redis'
import { PrismaClient } from '@prisma/client'
import { RedisClientType } from 'redis'
import prisma from './client'
import { errorHandler } from './middleware/errorHandler'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'
import { toCursorHash } from './utils/cursorHash'

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

// const app: express.Application = express()

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use(cors({ origin: '*' }))

// async function initServer() {
//   const server = new ApolloServer<AppContext>({
//     typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
//     resolvers,
//     cache: new KeyvAdapter(
//       new Keyv(
//         `redis://:${
//           process.env.REDIS_PASSWORD
//         }@${
//           process.env.REDIS_HOST
//         }:${
//           process.env.REDIS_PORT
//         }`,
//       ),
//     ),
//   })

//   await redis.connect()
//   await server.start()
//   console.log('Apollo server started')

//   // set the cache
//   await redis.flushAll()

//   // Add drinks to the cache
//   await prisma.drink.findMany({ include: { _count: { select: { ingredients: true } } } })
//     .then(res => res.map(({
//       id,
//       _count: { ingredients },
//       ...drink
//     }) => ({
//       id: toCursorHash(`${ ingredients > 0 ? 'Mixed' : 'Base'}Drink:${id}`),
//       ...drink,
//     })))
//     .then(drinks => drinks.map(drink => redis.set(`drinks:${drink.id}`, JSON.stringify(drink))))

//   app.use(
//     '/graphql',
//     jwtHandler,
//     expressMiddleware(server, {
//       context: async ({ req, res }) => ({
//         req,
//         res,
//         prisma,
//         redis,
//       }),
//     }),
//     errorHandler,
//   )
//   app.use(errorHandler)
// }

// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to the WaterLog API' })
// })

// initServer()

// app.listen(process.env.PORT || 4040, () => {
//   console.log(
//     `Typescript with Express http://${process.env.HOST}:${process.env.PORT}`,
//   )
// })

type CustomInvokeEvent = string

type CustomInvokeResult = {
    success: true,
    body: string,
  }
  | {
    success: false,
  }

const requestHandler = handlers.createRequestHandler<CustomInvokeEvent, CustomInvokeResult>({
  parseHttpMethod: ()  => 'POST',
  parseQueryParams: () => '',
  parseHeaders(event) {
    console.log('====')
    console.log('parsing headers', event)
    console.log('====')
    const headerMap = new HeaderMap()
    for (const [key, value] of Object.entries({})) {
      headerMap.set(key, value as string)
    }
    headerMap.set('content-type', 'application/json')
    return headerMap
  },
  parseBody(event, headers) {
    console.log('EVENT:', event)
    return event
  },
}, {
  success(response) {
    console.log('HEADERS: ', response.headers)
    return {
      success: true,
      body: response.body,
    }
  },
  error(e) {
    if (e instanceof Error) {
      return {
        success: false,
        error: e.toString(),
      }
    }
    console.log('Unknown error: ', e)
    throw e
  },
})

export const handler = startServerAndCreateLambdaHandler(
  server,
  requestHandler,
  {
    context: async ({ event }) => {
      return {
        req: {} as Request,
        res: {} as Response,
        prisma,
        redis: {} as RedisClientType,
      }
    },
    // middleware: [
    //   ((e) => {
    // //     console.log('\n')
    // //     console.log('\n')
    // //     console.log('\n')
    // //     console.log('===============')
    // //     console.log('in the middleware')
    // //     console.log('===============')
    //     e.body = e
    //     e.http = 200
    //     return (result) => {
    //       result.headers = {
    //         ...result.headers,
    //         'content-type': 'application/json',
    //       }
    //     }
    //   }) as middleware.MiddlewareFn<typeof requestHandler>],
  },
)
