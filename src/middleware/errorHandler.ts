import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
  res.status(err.status).json({ title: err.title, message: err.message })
}
