import 'dotenv/config'
import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import cors from 'cors'
import bodyParser from 'body-parser'
import { sequelize } from './models'
import { errorHandler } from './middleware/errorHandler'
import { schema } from './schemas'
import { GraphQLSchema } from 'graphql'
import { resolvers } from './resolvers'
import { drinksLoader } from './loaders/drinksLoader'
import { ingredientsLoader } from './loaders/ingredientsLoader'
import { logsLoader } from './loaders/logsLoader'
import { AppContext } from './types/context'
import { jwtHandler } from './middleware/jwtHandler'

const app: express.Application = express()


const isDev: boolean = process.env.NODE_ENV === 'develop'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors({ origin: 'http://127.0.0.1:5173' }))

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
          logsLoader,
        },
      }),
    }),
  )
  app.use(errorHandler)
}

initServer(schema)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WaterLog API' })
})

sequelize.sync({ force: isDev })
  .then(async () => {
    console.log('Sync complete')
  })
  .catch(err => console.log(err))

app.listen(process.env.PORT || 4040, () => {
  console.log(
    `Typescript with Express http://${
      process.env.HOST
    }${ isDev ? `:${process.env.PORT}` : '' }`,
  )
})

