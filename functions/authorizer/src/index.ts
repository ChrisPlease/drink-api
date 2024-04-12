import { promisify } from 'node:util'
import { APIGatewayAuthorizerEvent, Handler } from 'aws-lambda'
import { configDotenv } from 'dotenv'
import { ApiError } from '@waterlog/utils'
import jwksClient, { RsaSigningKey, SigningKey } from 'jwks-rsa'
import { decode, verify, JwtPayload, SignOptions } from 'jsonwebtoken'

configDotenv()

const getPolicyDocument = (effect: string, resource: string) => {
  const policyDocument = {
    Version: '2012-10-17', // default version
    Statement: [{
      Action: 'execute-api:Invoke', // default action
      Effect: effect,
      Resource: resource,
    }],
  }
  return policyDocument
}

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params: APIGatewayAuthorizerEvent) => {
  if (!params.type || params.type !== 'TOKEN') {
    throw new ApiError(400, 'Expected "event.type" parameter to have value "TOKEN"')
  }

  const tokenString = params.authorizationToken
  if (!tokenString) {
    throw new ApiError(400, 'Expected "event.authorizationToken" parameter to be set')
  }

  const match = tokenString.match(/^Bearer (.*)$/)
  if (!match || match.length < 2) {
    throw new ApiError(400, `Invalid Authorization token - ${tokenString} does not match "Bearer .*"`)
  }
  return match[1]
}

const jwtOptions: SignOptions = {
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_DOMAIN,
}

const authenticate = async (params: APIGatewayAuthorizerEvent) => {
  const token = getToken(params)

  const decoded = decode(token, { complete: true })
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new ApiError(403, 'Invalid token')
  }
  const getSigningKey = promisify(client.getSigningKey)

  return getSigningKey(decoded.header.kid)
    .then((key: SigningKey | RsaSigningKey | undefined) => {
      const signingKey = key?.getPublicKey() || (key as RsaSigningKey)?.rsaPublicKey
      return verify(token, signingKey, jwtOptions) as JwtPayload
    })
    .then((decoded: JwtPayload)=> ({
      principalId: decoded.sub,
      policyDocument: getPolicyDocument('Allow', params.methodArn),
      context: { scope: decoded.scope },
    }))
}

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: process.env.JWKS_URI,
})

export const handler: Handler = async (event) => {
  let data
  try {
    data = await authenticate(event)
  }
  catch (err: any) {
    return Promise.reject(`Unauthorized: ${err.message}`)
  }
  return data
}

