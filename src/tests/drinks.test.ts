import {
  beforeEach,
  describe,
  it,
  expect,
} from 'vitest'
import { v5 as uuidv5 } from 'uuid'
import { seedUsers } from '../../prisma/seeders/users'
import { seedDrinks } from '../../prisma/seeders/drinks'
import assert from 'assert'
import prisma from './helpers/prisma'
import { testServer } from './helpers/server'
import { Request } from 'express-jwt'
import { Response } from 'express'
import { AppContext } from '../types/context'
import { DrinksPaginated } from '../../__generated__/graphql'
import { toCursorHash } from '../utils/cursorHash'
import { namespaceUuid } from '../../prisma/constants'

describe('drinks', () => {
  let ctx: AppContext
  let QUERY: string

  describe('get all drinks', () => {
    beforeEach(async () => {
      ctx = {
        prisma,
        req: {} as Request,
        res: {} as Response,
      }
      await seedUsers(prisma, ['user-123'])
      await seedDrinks(prisma)

      QUERY = `query GetDrinks($first: Int, $after: String) {
        drinks(first: $first, after: $after) {
          edges {
            node {
              ... on Drink {
                id
                name
                coefficient
              }
            }
            cursor
          }
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
        }
      }`
    })

    it('retrieves a paginated list of drinks', async () => {
      const res = await testServer.executeOperation({
        query: QUERY,
        variables: { first: 12 },
      },
      { contextValue: ctx })

      assert(res.body.kind === 'single')
      assert(res.body.singleResult.data?.drinks !== null)

      const result = res.body.singleResult.data?.drinks as DrinksPaginated

      expect(result.edges.length).toEqual(12)
      expect(result.edges[0].cursor).toEqual(result.pageInfo?.startCursor)
      expect(
        result.edges[result.edges.length - 1].cursor,
      ).toEqual(result.pageInfo?.endCursor)
      expect(result.pageInfo?.hasNextPage).toBeTruthy()
      expect(result.pageInfo?.hasPreviousPage).toBeFalsy()
    })

    it('returns an offset when a cursor is provided', async () => {
      const cursor = 'eyJpZF9uYW1lIjp7ImlkIjoiY2UyYzc4OTktMWVkMy01OThmLWFjYjItMTkwZDY2NmYwMjdmIiwibmFtZSI6IkJlZXIifX0='

      const res = await testServer.executeOperation({
        query: QUERY,
        variables: { first: 2, after: cursor },
      }, { contextValue: ctx })

      assert(res.body.kind === 'single')
      assert(res.body.singleResult.data?.drinks !== null)

      const result = res.body.singleResult.data?.drinks as DrinksPaginated

      expect(result.pageInfo?.hasPreviousPage).toBeTruthy()
    })
  })
})
