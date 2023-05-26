import 'dotenv/config'
import { readFileSync } from 'fs'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import prisma from './client'
import { errorHandler } from './middleware/errorHandler'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'

const app: express.Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: `${process.env.UI_DOMAIN}` }))

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

