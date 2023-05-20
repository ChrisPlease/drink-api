import assert from 'assert'
import {
  beforeEach,
  describe,
  it,
  expect,
} from 'vitest'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { gql } from 'graphql-tag'
import { DocumentNode } from 'graphql'
import prisma from './helpers/prisma'
import { testServer } from './helpers/server'
import { AppContext } from '@/types/context'

describe('users', () => {
  let ctx: AppContext
  let QUERY: DocumentNode

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
    beforeEach(() => {
      QUERY = gql`
        mutation CreateUser($userId: ID!) {
          userCreate(userId: $userId) {
            id
          }
        }
      `
    })
    it('creates and returns a new user', async () => {
      expect.assertions(2)
      const res = await testServer.executeOperation({
        query: QUERY,
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
        query: QUERY,
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
      QUERY = gql`
        query GetCurrentUser {
          me {
            id
          }
        }
      `
      ctx = {
        ...ctx,
        req: {
          auth: { sub: 'user-123' },
        } as Request,
      }
    })

    it('returns the user provided by the auth token', async () => {
      const res = await testServer.executeOperation({
        query: QUERY,
      }, {
        contextValue: ctx,
      })

      assert(res.body.kind === 'single')
      expect({ id: 'user-123' }).toEqual(res.body.singleResult.data?.me)
    })
  })

  describe('user', () => {
    beforeEach(() => {
      QUERY = gql`
        query GetUser($userId: ID!) {
          user(userId: $userId) {
            id
          }
        }
      `
    })
    it('returns the user by given id', async () => {
      const res = await testServer.executeOperation({
        query: QUERY,
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
    beforeEach(() => {
      QUERY = gql`
        query GetUsers {
          users {
            id
          }
        }`
    })
    it('retrieves a list of all users', async () => {
      const res = await testServer.executeOperation({
        query: QUERY,
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
