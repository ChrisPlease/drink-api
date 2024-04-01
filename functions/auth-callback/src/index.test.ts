import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { vi, beforeEach, describe, expect, test, Mock } from 'vitest'
import axios from 'axios'
import { handler } from '.'

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {
      access_token: 'mock_token',
      id_token: 'mock_id_token',
      token_type: 'mock_token_type',
      expires_in: 'mock_expires_in',
    } }),
  },
}))

describe('handler', () => {
  let event: APIGatewayProxyEvent
  const ctx: Context = {} as Context

  test('throws an error when a code is not provided', async () => {
    const res = await handler({}, ctx, () => {})
    expect(res).toStrictEqual({
      statusCode: 400,
      body: JSON.stringify({ message: 'Error: `code` was missing from the request' }),
    })
  })

  describe('when code is provided', () => {

    beforeEach(() => {
      event = {
        queryStringParameters: {
          code: 'foo123',
        },
      } as unknown as APIGatewayProxyEvent
    })

    test('makes a POST to the token endpoint with the code parameter', () => {
      handler(event, ctx, () => {})
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.AUTH0_DOMAIN}oauth/token`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          redirect_uri: process.env.AUTH0_CALLBACK_URI,
          code: 'foo123',
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
    })

    test('Returns a 302 with redirect URL when successful', async () => {
      const res = await handler(event, ctx, () => {})
      expect(res).toStrictEqual({
        statusCode: 302,
        headers: {
          Location: 'shortcuts://run-shortcut?name=Callback&input=text&text={"access_token":"mock_token","id_token":"mock_id_token","token_type":"mock_token_type","expires_in":"mock_expires_in"}',
        },
        body: '',
      })
    })

    describe('when the code parameter is invalid', () => {
      beforeEach(() => {
        (axios.post as Mock).mockRejectedValue({ status: 400 })
      })

      test('returns an error when the request failed', async () => {
        const res = await handler(event, ctx, () => {})
        expect(res).toStrictEqual({
          statusCode: 500,
          body: JSON.stringify({ message: 'Request failed' }),
        })
      })
    })
  })

})
