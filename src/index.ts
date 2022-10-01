import 'dotenv/config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import session, { Store } from 'express-session'
import cors from 'cors'
import bodyParser from 'body-parser'
import { authRouter } from './routes'
import { PORT } from './config/constants'
import { sequelize/* , Drink, User */ } from './models'
import SequelizeSessionInit from 'connect-session-sequelize'
import passport from 'passport'
import { authHandler } from './middleware/authHandler'
import { errorHandler } from './middleware/errorHandler'
import { schema } from './schemas'
import './config/passport'
import { GraphQLSchema } from 'graphql'
import { resolvers } from './resolvers'
import { drinksLoader } from './loaders/drinksLoader'
import { ingredientsLoader } from './loaders/ingredientsLoader'
import { logsLoader } from './loaders/logsLoader'
import { AppContext } from './types/context'

const SequelizeStore = SequelizeSessionInit(Store)
const app: express.Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    store: new SequelizeStore({
      db: sequelize,
      tableName: 'sessions',
    }),
    resave: false,
    proxy: true,
    saveUninitialized: false,
  }),
)
app.use(passport.initialize())
app.use(passport.session())
app.use('/auth', authRouter)

app.use(cors({ origin: 'http://127.0.0.1:5173' }))

async function initServer(typeDefs: GraphQLSchema) {
  const server = new ApolloServer({
    typeDefs,
    context: (
      { req,
        res,
      }): AppContext => ({
      req,
      res,
      loaders: {
        drinksLoader,
        ingredientsLoader,
        logsLoader,
      },
    }),
    resolvers,
  })

  await server.start()
  console.log('Apollo server started')
  app.use(
    authHandler,
    server.getMiddleware({ path: '/graphql' }),
  )
}

initServer(schema)

app.get('/', (req, res) => {
  res.json({ info: 'Typescript With Express' })
})

app.use(errorHandler)

sequelize.sync(/* { force: true } */)
  .then(async () => {
    /* await Drink.bulkCreate([
      {
        name: 'Water',
        coefficient: 1,
        icon: 'glass-water',
        caffeine: 0,
      },
      {
        name: 'Coffee',
        coefficient: 0.8,
        icon: 'mug-saucer',
        caffeine: 73,
      },
      {
        name: 'Tea',
        coefficient: 0.85,
        icon: 'mug-tea-saucer',
        caffeine: 26,
      },
      {
        name: 'Smoothie',
        icon: 'blender',
        coefficient: 0.33,
        sugar: 23,
        caffeine: 0,
      },
      {
        name: 'Yogurt',
        icon: 'bowl-soft-serve',
        coefficient: 0.5,
        sugar: 45,
        caffeine: 0,
      },
      {
        name: 'Soda',
        icon: 'cup-straw-swoosh',
        coefficient: 0.6,
        sugar: 64,
        caffeine: 0,
      },
      {
        name: 'Juice',
        icon: 'glass',
        coefficient: 0.55,
        sugar: 30,
        caffeine: 0,
      },
      {
        name: 'Milk',
        icon: 'jug',
        coefficient: 0.78,
        caffeine: 0,
      },
      {
        name: 'Wine',
        icon: 'wine-glass',
        coefficient: -1.6,
        caffeine: 0,
      },
      {
        name: 'Beer',
        icon: 'beer-mug',
        coefficient: -0.6,
        caffeine: 0,
      },
      {
        name: 'Non Alcoholic Beer',
        icon: 'beer-mug',
        coefficient: 0.6,
        caffeine: 0,
      },
      {
        name: 'Whiskey',
        icon: 'whiskey-glass',
        coefficient: -3.5,
        caffeine: 0,
      },
      {
        name: 'Vodka',
        icon: 'martini-glass',
        coefficient: -3.5,
        caffeine: 0,
      },
      {
        name: 'Mineral Water',
        icon: 'glass-water',
        coefficient: 0.93,
        caffeine: 0,
      },
      {
        name: 'Milkshake',
        icon: 'blender',
        sugar: 40,
        coefficient: 0.5,
        caffeine: 0,
      },
      {
        name: 'Herbal Tea',
        icon: 'mug-tea-saucer',
        coefficient: 0.95,
        caffeine: 0,
      },
      {
        name: 'Energy Drink',
        icon: 'can-food',
        sugar: 80,
        coefficient: 0.4,
        caffeine: 34,
      },
      {
        name: 'Cacao',
        icon: 'mug-saucer',
        sugar: 60,
        coefficient: 0.65,
        caffeine: 3,
      },
      {
        name: 'Hot Chocolate',
        icon: 'mug-marshmallows',
        sugar: 60,
        coefficient: 0.4,
        caffeine: 22,
      },
      {
        name: 'Coconut Water',
        icon: 'glass',
        sugar: 15,
        coefficient: 0.85,
        caffeine: 0,
      },
      {
        name: 'Lemonade',
        icon: 'glass',
        sugar: 23,
        coefficient: 0.8,
        caffeine: 0,
      },
    ])

    await User.create({
        username: 'ChrisPlz',
        password: 'P@ssw0rd!',
        email: 'chris@chrisplease.me',
      })
    await User.create({
      username: 'testuser',
      password: 'P@ssw0rd!',
      email: 'chris@chrisplease.com',
    }) */
    console.log('Sync complete')
  })
  .catch(err => console.log(err))

app.listen(PORT, () => {

  console.log(`Typescript with Express http://localhost:${PORT}`)
})

