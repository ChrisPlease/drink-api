import { RequestHandler } from 'express'
import { ErrorHandler } from '../utils/error'

export const authHandler: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    throw new ErrorHandler({
      status: 401,
      title: '',
      message: 'You lack sufficient authorization to view this resource',
    })
  }

  next()
}
