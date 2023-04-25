import 'dotenv/config'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import { errorHandler } from './middleware/errorHandler'
import { resolvers } from './resolvers'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const app: express.Application = express()

const prisma = new PrismaClient({
  log: [/* 'query',  */'info', 'error'],
})

prisma.$use(async (params, next) => {
  console.log('===========================================')
  console.log('=============start=========================')
  console.log('===========================================')
  if (params.model == 'Drink') {
    if (params.action == 'delete') {
      // Delete queries
      // Change action to an update
      params.action = 'update'
      params.args['data'] = { deleted: new Date() }
    }
    if (params.action == 'deleteMany') {
      // Delete many queries
      params.action = 'updateMany'
      if (params.args.data !== undefined) {
        params.args.data['deleted'] = new Date()
      } else {
        params.args['data'] = { deleted: new Date() }
      }
    }
    if (params.action === 'findUnique') {
      params.action = 'findFirst'
      params.args.where['deleted'] = null
    }

    if (params.action === 'findMany') {
      params.args.where['deleted'] = null
    }
  }
  console.log('===========================================')
  console.log('==============end==========================')
  console.log('===========================================')
  return next(params)
})

async function initServer() {
  const server = new ApolloServer<AppContext>({
    typeDefs: readFileSync('./schema.gql', { encoding: 'utf-8' }),
    resolvers,
  })

  await server.start()
  console.log('Apollo server started')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use(cors())
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

