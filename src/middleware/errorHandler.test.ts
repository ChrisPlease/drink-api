import { describe, expect, test, vi } from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'undici'
import { errorHandler } from './errorHandler'

describe('errorHandler', () => {
  test('does something', () => {
    console.log(errorHandler('foo', {} as Request, {} as Response, vi.fn()))
  })
})
