import { createJWKSMock } from 'mock-jwks'
import { vi, afterEach, beforeEach, describe, expect, test } from 'vitest'
import { APIGatewayAuthorizerEvent, Context } from 'aws-lambda'
import { handler } from '.'


vi.mock('/opt/nodejs/client', () => ({
  getKeyvClient: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

const jwksMock = createJWKSMock(`${process.env.JWKS_URI}`)

describe('handler', () => {
  let event: APIGatewayAuthorizerEvent

  beforeEach(() => {
    event = {} as APIGatewayAuthorizerEvent
  })

  describe('failures', () => {
    let expectedError: string

    beforeEach(() => {
      expectedError = ''
    })

    afterEach(() => {
      expectedError = ''
    })

    test('rejects when type is not provided', async () => {
      expectedError += 'Expected "event.type" parameter to have value "TOKEN"'
      const res = await handler(event, {} as Context, () => {})

      expect(res).toEqual({
        principalId: 'unauthorized',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: undefined,
          }],
        },
        context: {
          message: `Unauthorized: ${expectedError}`,
        },
      })
    })

    test('rejects when token is not provided', async () => {
      expectedError += 'Expected "event.authorizationToken" parameter to be set'
      event = { ...event, type: 'TOKEN' } as APIGatewayAuthorizerEvent
      const res = await handler(event, {} as Context, () => {})
      expect(res).toEqual({
        principalId: 'unauthorized',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: undefined,
          }],
        },
        context: {
          message: `Unauthorized: ${expectedError}`,
        },
      })
    })

    test('rejects when the token is not correctly formatted', async () => {
      expectedError += 'Invalid Authorization token - Foo 123 does not match "Bearer .*"'
      event = { ...event, type: 'TOKEN', authorizationToken: 'Foo 123' }
      const res = await handler(event, {} as Context, () => {})
      expect(res).toEqual({
        principalId: 'unauthorized',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: undefined,
          }],
        },
        context: {
          message: `Unauthorized: ${expectedError}`,
        },
      })
    })

    test('rejects when the token is invalid', async () => {
      expectedError += 'Invalid token structure'
      event = { ...event, type: 'TOKEN', authorizationToken: 'Bearer foo' }
      const res = await handler(event, {} as Context, () => {})
      expect(res).toEqual({

        principalId: 'unauthorized',
        policyDocument: {
          Version: '2012-10-17',
          Statement: [{
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: undefined,
          }],
        },
        context: {
          message: `Unauthorized: ${expectedError}`,
        },

      })
    })
  })

  describe('success', () => {
    let token: string

    beforeEach(() => {
      jwksMock.start()
      token = jwksMock.token({
        aud: process.env.AUTH0_AUDIENCE,
        iss: process.env.AUTH0_DOMAIN,
      })
    })

    afterEach(() => {
      jwksMock.start()
    })

    test('returns successful when token is valid', async () => {
      event = { ...event, type: 'TOKEN', authorizationToken: `Bearer ${token}`, methodArn: 'foo' }
      const res = await handler(event, {} as Context, () => {})
      expect(res.policyDocument).toStrictEqual({
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: 'foo',
        }],
      })
    })
  })
})
