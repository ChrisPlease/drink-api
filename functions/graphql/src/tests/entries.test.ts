import assert from 'assert'
import {
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import { gql } from 'graphql-tag'
import { DocumentNode } from 'graphql'
import { seedUsers } from '../../prisma/seeders/users'
import { seedDrinks } from '../../prisma/seeders/drinks'
import { seedEntries } from '../../prisma/seeders/entries'
import { EntriesPaginated } from '../__generated__/graphql'
import { AppContext } from '../types/context'
// import redis from '../__mocks__/redis'
import { testServer } from './helpers/server'
import prisma from './helpers/prisma'

describe('entries', () => {
  let contextValue: AppContext
  let QUERY: DocumentNode
  let result: EntriesPaginated

  beforeEach(async () => {
    await seedUsers(prisma, ['user-123', 'user-456'])
    const {
      water: waterId,
      dripCoffee: coffeeId,
      whiskey: whiskeyId,
    } = await seedDrinks(prisma)
    const drinksArray = [waterId, coffeeId, whiskeyId]
    const volumeArray = [12, 8, 16]

    await seedEntries(prisma, new Array(40).fill({}).map((_, index) => ({
      userId: 'user-123',
      drinkId: drinksArray[index % drinksArray.length],
      volume: volumeArray[index % volumeArray.length],
    })))

    contextValue = {
      // redis,
      prisma,
      user: 'user-123',
    }

    QUERY = gql`
      query GetEntries($first: Int, $after: String, $distinct: Boolean) {
        entries(first: $first, after: $after, filter: { distinct: $distinct }) {
          edges {
            node {
              volume
              drink {
                ... on Drink {
                  name
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `
  })

  test('returns a paginated list of entries', async () => {
    const res = await testServer.executeOperation({
      query: QUERY,
      variables: { filter: { distinct: false }, first: 12 },
    }, { contextValue })

    assert(res.body.kind === 'single')

    result = res.body.singleResult.data?.entries as EntriesPaginated
    expect(result.edges).toHaveLength(12)
  })

  test('returns only entries for the specified user', async () => {
    contextValue = { ...contextValue,  user: 'user-456' }
    const res = await testServer.executeOperation({
      query: QUERY,
      variables: { distinct: true },
    }, { contextValue })

    assert(res.body.kind === 'single')

    result = res.body.singleResult.data?.entries as EntriesPaginated
    expect(result?.edges || []).toHaveLength(0)
  })
})