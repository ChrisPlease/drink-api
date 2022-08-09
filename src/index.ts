import 'dotenv/config'
import express from 'express'
import session, { Store } from 'express-session'
import bodyParser from 'body-parser'
import { drinkRouter, entryRouter, userRouter } from './routes'
import { PORT } from './config/constants'
import { sequelize } from './models'
import SequelizeSessionInit from 'connect-session-sequelize'

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
  }),
)

app.use('/drinks', drinkRouter)
app.use('/entries', entryRouter)
app.use('/users', userRouter)

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

