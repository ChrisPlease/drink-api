import { RequestHandler } from 'express'

export class AuthError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }

  get title(): string {
    if (this.status === 401) {
      return 'Unauthorized'
    }

    if (this.status === 403) {
      return 'Forbidden'
    }

    return 'Error'
  }
}

export const authHandler: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    throw new AuthError(401, 'You lack sufficient authorization to view this resource')
  }

  next()
}
