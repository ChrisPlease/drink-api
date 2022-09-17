import type { RequestHandler } from 'express'
import { ErrorHandler } from '../utils/error'
import { dataFormatter } from '../utils/serializer'

export const jsonApiHandler: RequestHandler = async (req, res, next) => {
  const { headers } = req

  if (headers['content-type'] === 'application/vnd.api+json') {
    req.body = dataFormatter.deserialize(req.body)
    next()
  } else {
    next(new ErrorHandler({
      status: 415,
      title: 'Check ya content type',
      message: 'Unsupported content type',
    }))
  }
}
