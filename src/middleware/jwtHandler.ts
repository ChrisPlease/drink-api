import { expressjwt, GetVerificationKey } from 'express-jwt'
import { expressJwtSecret } from 'jwks-rsa'

export const jwtHandler = expressjwt({
  secret: <GetVerificationKey>expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: `${process.env.AUTH0_AUDIENCE}`,
  issuer: `${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  credentialsRequired: false,
})
