import 'dotenv/config'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import { dataSource } from './database/data-source'
import { errorHandler } from './middleware/errorHandler'
import { schema } from './schemas'
import { GraphQLSchema } from 'graphql'
import { resolvers } from './resolvers'
import { drinksLoader } from './loaders/drinksLoader'
import { ingredientsLoader } from './loaders/ingredientsLoader'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'

import 'reflect-metadata'

const app: express.Application = express()

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

app.use(
  cors({
    origin: 'https://waterlog.test:8433',
  }),
)

async function initServer(typeDefs: GraphQLSchema) {
  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
  })

  await server.start()
  console.log('Apollo server started')
  app.use(jwtHandler)
  app.use(
    '/graphql',
    jwtHandler,
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        loaders: {
          drinksLoader,
          ingredientsLoader,
          // logsLoader,
        },
      }),
    }),
    errorHandler,
  )
  app.use(errorHandler)
}

initServer(schema)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WaterLog API' })
})

dataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized successfully')
  })
  .catch((err) => {
    console.error('Error during Data Source Init:', err)
  })

// sequelize.sync({ force: isDev })
//   .then(async () => {
//     console.log('Sync complete')
//   })
//   .catch(err => console.log(err))

app.listen(process.env.PORT || 4040, () => {
  console.log(
    `Typescript with Express http://${process.env.HOST}:${process.env.PORT}`,
  )
})

