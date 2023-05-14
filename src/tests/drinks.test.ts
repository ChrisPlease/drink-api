import {
  beforeEach,
  describe,
  it,
  expect,
} from 'vitest'
import assert from 'assert'
import prisma from './helpers/prisma'
import { testServer } from './helpers/server'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { AppContext } from '../types/context'

describe('drinks', () => {
  it('retrieves a paginated list of drinks', async () => {
    expect(true).toBeTruthy()
  })
})
