import { ParsedQs } from 'qs'
import { RequestHandler } from 'express'
import { PAGINATION } from '../config/constants'

export const paginationHandler: RequestHandler = async (req, res, next) => {
  const page = Object.entries(req.query.page as ParsedQs || {})
    .reduce((acc, [key, val]) => {
      if (val && !isNaN(+val)) {
        acc[key] = +val
      }
      return acc
    }, {} as Record<string, number>)
  const pagination = Object.assign(
    {},
    PAGINATION,
    page,
  )

  req.pagination = pagination
  next()
}
