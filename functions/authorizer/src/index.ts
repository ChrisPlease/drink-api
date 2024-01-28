import { promisify } from 'node:util'
import { APIGatewayAuthorizerEvent, Handler } from 'aws-lambda'
import { configDotenv } from 'dotenv'
import jwksClient, { RsaSigningKey } from 'jwks-rsa'
import { decode, verify, JwtPayload } from 'jsonwebtoken'

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
        throw new Error('Expected "event.type" parameter to have value "TOKEN"')
    }

    const tokenString = params.authorizationToken
    if (!tokenString) {
        throw new Error('Expected "event.authorizationToken" parameter to be set')
    }

    const match = tokenString.match(/^Bearer (.*)$/)
    if (!match || match.length < 2) {
        throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`)
    }
    return match[1]
}

const jwtOptions = {
    audience: process.env.AUDIENCE,
    issuer: process.env.TOKEN_ISSUER,
}


const authenticate = async (params: APIGatewayAuthorizerEvent) => {
    const token = getToken(params)

    const decoded = decode(token, { complete: true })
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('invalid token')
    }
    const getSigningKey = promisify(client.getSigningKey)


    return getSigningKey(decoded.header.kid)
        .then((key) => {
            const signingKey = key?.getPublicKey() || (key as RsaSigningKey)?.rsaPublicKey
            return verify(token, signingKey, jwtOptions) as JwtPayload
        })
        .then((decoded)=> ({
            principalId: decoded.sub,
            policyDocument: getPolicyDocument('Allow', params.methodArn),
            context: { scope: decoded.scope },
        }))
}

 const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI,
})


let data

export const handler: Handler = async (event, context, callback) => {
  try {
    data = await authenticate(event)
  }
  catch (err) {
      console.log(err)
      return Promise.reject('Unauthorized')
  }
  return data
}
