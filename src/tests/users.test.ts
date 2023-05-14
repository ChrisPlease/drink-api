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

describe('users', () => {
  let ctx: AppContext

  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        { id: 'user-123' },
        { id: 'user-456' },
      ],
    })
  })

  beforeEach(() => {
    ctx = {
      prisma,
      req: {} as Request,
      res: {} as Response,
    }
  })

  describe('createUser', () => {
    it('creates and returns a new user', async () => {
      expect.assertions(2)
      const res = await testServer.executeOperation({
        query: `mutation CreateUser($userId: ID!) {
          userCreate(userId: $userId) {
            id
          }
        }`,
        variables: { userId: 'user-789' },
      }, {
        contextValue: ctx,
      })

      const user = await prisma.user.findUnique({ where: { id: 'user-789' } })

      assert(res.body.kind === 'single')
      expect(res.body.singleResult.data).toEqual({
        userCreate: { id: 'user-789' },
      })
      expect(res.body.singleResult.data?.userCreate).toEqual(user)
    })

    it('returns an error when a user already exists', async () => {
      expect.assertions(2)
      const res = await testServer.executeOperation({
        query: `mutation CreateUser($userId: ID!) {
          userCreate(userId: $userId) {
            id
          }
        }`,
        variables: { userId: 'user-123' },
      }, {
        contextValue: ctx,
      })

      assert(res.body.kind === 'single')
      expect(res.body.singleResult.data?.userCreate).toBeNull()
      expect(res.body.singleResult.errors?.[0].message).toEqual('User already exists')
    })
  })

  describe('me', () => {
    beforeEach(() => {
      ctx = {
        ...ctx,
        req: {
          auth: { sub: 'user-123' },
        } as Request,
      }
    })

    it('returns the user provided by the auth token', async () => {
      const res = await testServer.executeOperation({
        query: `query GetCurrentUser {
          me {
            id
          }
        }`,
      }, {
        contextValue: ctx,
      })

      assert(res.body.kind === 'single')
      expect({ id: 'user-123' }).toEqual(res.body.singleResult.data?.me)
    })
  })

  describe('user', () => {
    it('returns the user by given id', async () => {
      const res = await testServer.executeOperation({
        query: `
        query GetUser($userId: ID!) {
          user(userId: $userId) {
            id
          }
        }
        `,
        variables: { userId: 'user-123' },
      }, {
        contextValue: ctx,
      })

      assert(res.body.kind === 'single')
      expect(res.body.singleResult.data).toEqual({
        user: {
          id: 'user-123',
        },
      })
    })
  })

  describe('users', () => {
    it('retrieves a list of all users', async () => {
      const res = await testServer.executeOperation({
        query: `query GetUsers {
          users {
            id
          }
        }`,
      }, {
        contextValue: ctx,
      })

      assert(res.body.kind === 'single')
      expect(res.body.singleResult.data).toEqual({
        users: [
          { id: 'user-123' },
          { id: 'user-456' },
        ],
      })
    })
  })
})
