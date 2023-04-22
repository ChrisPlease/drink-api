import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log('err', err)
  res.status(err.status).json({ title: err.name, message: err.message })
  next()
}
