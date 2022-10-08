import { Request as ExpressJwtRequest } from 'express-jwt'
import { RequestHandler } from 'express'

export const authHandler: RequestHandler = (req: ExpressJwtRequest, res, next) => {
  next()
}
