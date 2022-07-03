import 'dotenv/config'

import express from 'express'
import bodyParser from 'body-parser'
import { userRouter } from './routes';

const app: express.Application = express()

const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({ extended: true })
)

app.use('/users', userRouter)

app.get('/', (req, res) => {
  res.json({ info: 'Typescript With Express' })
})

app.listen(port, () => {
  console.log(`Typescript with Express http://localhost:${port}`)
})
