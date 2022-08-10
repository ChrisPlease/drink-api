import 'dotenv/config'
import express from 'express'
import session, { Store } from 'express-session'
import bodyParser from 'body-parser'
import { authRouter, drinkRouter, entryRouter, userRouter } from './routes'
import { PORT } from './config/constants'
import { /* Drink,  */sequelize } from './models'
import SequelizeSessionInit from 'connect-session-sequelize'
import passport from 'passport'

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

app.use(authRouter)

app.use('/drinks', passport.authenticate('local'), drinkRouter)
app.use('/entries', entryRouter)
app.use('/users', passport.authenticate('local'), userRouter)

app.get('/', (req, res) => {
  res.json({ info: 'Typescript With Express' })
})

sequelize.sync({ alter: true })
  .then(async () => {
    // await Drink.bulkCreate([
    //   {
    //     name: 'Water',
    //     coefficient: 1,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Coffee',
    //     coefficient: 0.8,
    //     caffeine: 73,
    //   },
    //   {
    //     name: 'Tea',
    //     coefficient: 0.85,
    //     caffeine: 26,
    //   },
    //   {
    //     name: 'Smoothie',
    //     coefficient: 0.33,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Yogurt',
    //     coefficient: 0.5,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Soda',
    //     coefficient: 0.6,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Jioce',
    //     coefficient: 0.55,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Milk',
    //     coefficient: 0.78,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Wine',
    //     coefficient: -1.6,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Beer',
    //     coefficient: -0.6,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Non Alcoholic Beer',
    //     coefficient: 0.6,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Alcohol',
    //     coefficient: -3.5,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Mineral Water',
    //     coefficient: 0.93,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Milkshake',
    //     coefficient: 0.72,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Herbal Tea',
    //     coefficient: 0.95,
    //     caffeine: 0,
    //   },
    //   {
    //     name: 'Energy Drink',
    //     coefficient: 0.4,
    //     caffeine: 34,
    //   },
    //   {
    //     name: 'Cacao',
    //     coefficient: 0.65,
    //     caffeine: 3,
    //   },
    //   {
    //     name: 'Hot Chocolate',
    //     coefficient: 0.4,
    //     caffeine: 22,
    //   },
    //   {
    //     name: 'Coconut Water',
    //     coefficient: 0.85,
    //     caffeine: 0,
    //   },
    // ])
    console.log('Sync complete')
  })
  .catch(err => console.log(err))

app.listen(PORT, () => {
  console.log(`Typescript with Express http://localhost:${PORT}`)
})

