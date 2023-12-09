import 'dotenv/config'
import { readFileSync } from 'fs'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import Keyv from 'keyv'
import prisma from './client'
import { redis } from './redis'
import { errorHandler } from './middleware/errorHandler'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'
import { toCursorHash } from './utils/cursorHash'

const app: express.Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: '*' }))

async function initServer() {
  const server = new ApolloServer<AppContext>({
    typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
    resolvers,
    cache: new KeyvAdapter(
      new Keyv(
        `redis://:${
          process.env.REDIS_PASSWORD
        }@${
          process.env.REDIS_HOST
        }:${
          process.env.REDIS_PORT
        }`,
      ),
    ),
  })

  await redis.connect()
  await server.start()
  console.log('Apollo server started')

  // set the cache
  await redis.flushAll()

  // Add drinks to the cache
  await prisma.drink.findMany({ include: { _count: { select: { ingredients: true } } } })
    .then(res => res.map(({
      id,
      _count: { ingredients },
      ...drink
    }) => ({
      id: toCursorHash(`${ ingredients > 0 ? 'Mixed' : 'Base'}Drink:${id}`),
      ...drink,
    })))
    .then(drinks => drinks.map(drink => redis.set(`drinks:${drink.id}`, JSON.stringify(drink))))

  app.use(
    '/graphql',
    jwtHandler,
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        prisma,
        redis,
      }),
    }),
    errorHandler,
  )
  app.use(errorHandler)
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WaterLog API' })
})

initServer()

app.listen(process.env.PORT || 4040, () => {
  console.log(
    `Typescript with Express http://${process.env.HOST}:${process.env.PORT}`,
  )
})

