import type { RequestHandler } from 'express'
import { dataFormatter } from '../utils/serializer'

export const jsonApiHandler: RequestHandler = async (req, res, next) => {
  const { headers } = req

  if (headers['content-type'] === 'application/vnd.api+json') {
    req.body = dataFormatter.deserialize(req.body)
  }

  next()
}
