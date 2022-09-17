import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log('foooooooo')
  res.status(err.status).json({ title: err.title, message: err.message })
  next()
}
