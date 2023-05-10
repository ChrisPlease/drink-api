import 'dotenv/config'
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import prisma from './client'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import { errorHandler } from './middleware/errorHandler'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'
import { readFileSync } from 'fs'

const app: express.Application = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
  origin: 'https://waterlog.test:8433',
}))

prisma.$use(
  createSoftDeleteMiddleware({
    models: {
      Drink: {
        field: 'deleted',
        createValue: (value) => value ? new Date() : null,
      },
      Entry: true,
    },
  }),
)

async function initServer() {
  const server = new ApolloServer<AppContext>({
    typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
    resolvers,
  })

  await server.start()
  console.log('Apollo server started')

  app.use(
    '/graphql',
    jwtHandler,
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        prisma,
      }),
    }),
    errorHandler,
  )
  app.use(errorHandler)
}

initServer()

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WaterLog API' })
})

app.listen(process.env.PORT || 4040, () => {
  console.log(
    `Typescript with Express http://${process.env.HOST}:${process.env.PORT}`,
  )
})

