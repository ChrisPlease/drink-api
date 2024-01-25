// import { Request as ExpressJwtRequest } from 'express-jwt'

declare namespace Express {
  export type Request = ExpressJwtRequest
}
