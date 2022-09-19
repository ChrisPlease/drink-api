import 'dotenv/config'
import express from 'express'
import session, { Store } from 'express-session'
import bodyParser from 'body-parser'
import { authRouter, drinkRouter, entryRouter, userRouter } from './routes'
import { PORT } from './config/constants'
import { sequelize } from './models'
import SequelizeSessionInit from 'connect-session-sequelize'
import passport from 'passport'
import { authHandler } from './middleware/authHandler'
import { errorHandler } from './middleware/errorHandler'
import { graphqlHTTP } from 'express-graphql'
import { schema } from './schemas'
import './config/passport'

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

app.use(
  '/graphql',
  authHandler,
  graphqlHTTP(() => {
    return {
      graphiql: true,
      schema,
    }
  }),
)

app.use('/drinks', authHandler, drinkRouter)
app.use('/entries', authHandler, entryRouter)
app.use('/users', authHandler, userRouter)

app.get('/', (req, res) => {
  res.json({ info: 'Typescript With Express' })
})

app.use(errorHandler)

sequelize.sync(/* { alter: true } */)
  .then(async () => {
/*     await Drink.bulkCreate([
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
        caffeine: 0,
      },
      {
        name: 'Yogurt',
        icon: 'bowl-soft-serve',
        coefficient: 0.5,
        caffeine: 0,
      },
      {
        name: 'Soda',
        icon: 'cup-straw-swoosh',
        coefficient: 0.6,
        caffeine: 0,
      },
      {
        name: 'Juice',
        icon: 'glass',
        coefficient: 0.55,
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
        coefficient: 0.72,
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
        coefficient: 0.4,
        caffeine: 34,
      },
      {
        name: 'Cacao',
        icon: 'mug-saucer',
        coefficient: 0.65,
        caffeine: 3,
      },
      {
        name: 'Hot Chocolate',
        icon: 'mug-marshmallows',
        coefficient: 0.4,
        caffeine: 22,
      },
      {
        name: 'Coconut Water',
        icon: 'glass',
        coefficient: 0.85,
        caffeine: 0,
      },
    ]) */
    console.log('Sync complete')
  })
  .catch(err => console.log(err))

app.listen(PORT, () => {
  console.log(`Typescript with Express http://localhost:${PORT}`)
})

