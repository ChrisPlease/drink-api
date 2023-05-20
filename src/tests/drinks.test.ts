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
import { seedUsers } from '../../prisma/seeders/users'
import { seedDrinks } from '../../prisma/seeders/drinks'
import prisma from './helpers/prisma'
import { testServer } from './helpers/server'
import { AppContext } from '@/types/context'
import { DrinksPaginated } from '@/__generated__/graphql'

describe('drinks', () => {
  let contextValue: AppContext
  let QUERY: DocumentNode
  let result: DrinksPaginated

  describe('get all drinks', () => {
    beforeEach(async () => {
      contextValue = {
        prisma,
        req: {} as Request,
        res: {} as Response,
      }
      await seedUsers(prisma, ['user-123'])
      await seedDrinks(prisma)

      QUERY = gql`query GetDrinks($first: Int, $after: String, $search: String) {
        drinks(first: $first, after: $after, search: $search) {
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
      { contextValue })

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
      }, { contextValue })

      assert(res.body.kind === 'single')
      assert(res.body.singleResult.data?.drinks !== null)

      result = res.body.singleResult.data?.drinks as DrinksPaginated

      expect(result.pageInfo?.hasPreviousPage).toBeTruthy()
    })

    it('filters results when search term is provided', async () => {
      const res = await testServer.executeOperation({
        query: QUERY,
        variables: { search: 'w' },
      }, { contextValue })

      assert(res.body.kind === 'single')
      assert(res.body.singleResult.data?.drinks !== null)

      result = res.body.singleResult.data?.drinks as DrinksPaginated

      const resultNames = result.edges.map(({ node: { name } }) => name)
      expect(resultNames.every(name => name.toLowerCase().includes('w'))).toBeTruthy()
    })
  })
})
