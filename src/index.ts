import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import { drinkRouter } from './routes'
import { PORT } from './config/constants'
import { Drink, sequelize } from './models'

const app: express.Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/drinks', drinkRouter)

app.get('/', (req, res) => {
  res.json({ info: 'Typescript With Express' })
})

sequelize.sync({ alter: true })
  .then(async () => {
  //   await Drink.bulkCreate([
  //     {
  //       name: 'Water',
  //       coefficient: 1,
  //       caffeine: 0
  //     },
  //     {
  //       name: 'Coffee',
  //       coefficient: 0.8,
  //       caffeine: 73,

  //     },
  //     {
  //       name: 'Tea',
  //       coefficient: 0.85,
  //       caffeine: 26,
  //     },
  //     {
  //       name: 'Smoothie',
  //       coefficient: 0.33,
  //       caffeine: 0,
  //     },
  //     {
  //       name: 'Yogurt',
  //       coefficient: 0.5,
  //       caffeine: 0,
  //     },
  //     {
  //       name: 'Soda',
  //       coefficient: 0.6,
  //       caffeine: 25,
  //     },
  //     {
  //       name: 'Juice',
  //       coefficient: 0.55,
  //       caffeine: 0,
  //     },
  //     {
  //       name: 'Milk',
  //       coefficient: 0.78,
  //       caffeine: 0,
  //     },
  //     {
  //       name: 'Wine',
  //       coefficient: -1.6,
  //       caffeine: 0,
  //     },
  //     {
  //       name: 'Beer',
  //       coefficient: -0.6,
  //       caffeine: 0,
  //     },
  //     {
  //       name: 'Alcohol',
  //       coefficient: -3.5,
  //       caffeine: 0,
  //     }
  // ])
    console.log('Sync complete')
  })
  .catch(err => console.log(err))

app.listen(PORT, () => {
  console.log(`Typescript with Express http://localhost:${PORT}`)
})

