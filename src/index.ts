import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import { drinkRouter } from './routes'
import { PORT } from './config/constants'
import { sequelize } from './models'

const app: express.Application = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/drinks', drinkRouter)

app.get('/', (req, res) => {
  res.json({ info: 'Typescript With Express' })
})

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Sync complete')
  })
  .catch(err => console.log(err))

app.listen(PORT, () => {
  console.log(`Typescript with Express http://localhost:${PORT}`)
})

