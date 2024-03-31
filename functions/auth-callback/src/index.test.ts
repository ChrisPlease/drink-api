import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { vi, beforeEach, describe, expect, test } from 'vitest'
import { handler } from '.'

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: {
      access_token: '123',
    } }),
  },
}))

describe('handler', () => {
  let event: APIGatewayProxyEvent

  beforeEach(() => {
    event = {
      queryStringParameters: {
        code: 'foo123',
      },
    } as unknown as APIGatewayProxyEvent
  })

  test('does something', async () => {

    const res = await handler(event, {} as Context, () => {})
    expect(true).toBeTruthy()
  })
})
