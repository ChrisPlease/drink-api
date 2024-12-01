import { promisify } from 'node:util'
import { APIGatewayAuthorizerEvent, Handler } from 'aws-lambda'
import { configDotenv } from 'dotenv'
import { ApiError } from '@waterlog/utils'
import jwksClient, { RsaSigningKey } from 'jwks-rsa'
import { decode, verify, JwtPayload, SignOptions } from 'jsonwebtoken'
import { getKeyvClient } from '/opt/nodejs/client'

configDotenv()

const cache = getKeyvClient()

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

  if (!decoded || typeof decoded !== 'object' || !decoded.header || !decoded.header.kid) {
    throw new ApiError(403, 'Invalid token structure')
  }

  const kid = decoded.header.kid

  let signingKey = await cache.get<string>(kid)

  if (!signingKey) {

    console.log(`Cache miss for key: ${kid}`);
    const getSigningKey = promisify(client.getSigningKey)

    const key = await getSigningKey(kid)

    if (!key) {
      throw new ApiError(403, 'Signing key not found')
    }

    signingKey = key?.getPublicKey() || (key as RsaSigningKey)?.rsaPublicKey

    if (!signingKey || typeof signingKey !== 'string') {
      throw new ApiError(403, 'Invalid signing key retrieved from JWKS');
    }

    await cache.set(kid, signingKey, 300)
  } else {
    console.log(`Cache hit for key: ${kid}`);
  }

  try {
    const verifiedToken = verify(token, signingKey, jwtOptions) as JwtPayload

    return {
      principalId: verifiedToken.sub,
      policyDocument: getPolicyDocument('Allow', params.methodArn),
      context: { scope: verifiedToken.scope }
    }
  } catch (err: any) {
    console.error('Token verification error:', err);
    throw new ApiError(403, `Token verification failed: ${err.message}`)
  }
}

const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: process.env.JWKS_URI,
})

export const handler: Handler = async (event) => {
  if (!process.env.JWKS_URI || !process.env.AUTH0_AUDIENCE || !process.env.AUTH0_DOMAIN) {
    throw new Error('Missing required environment variables');
  }

  try {

    const response = await authenticate(event)

    return response
  }
  catch (err: any) {
    console.error('Error in Authorizer:', err)

    // Return a Deny response with a principalId to satisfy API Gateway
    return {
      principalId: 'unauthorized',
      policyDocument: getPolicyDocument('Deny', event.methodArn),
      context: {
        message: `Unauthorized: ${err.message}`,
      },
    }
  }
}

