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
import { seedEntries } from '../../prisma/seeders/entries'
import { AppContext } from '../types/context'
import { DrinksHistoryPaginated } from '../__generated__/graphql'
import redis from '../__mocks__/redis'
import prisma from './helpers/prisma'
import { testServer } from './helpers/server'

describe('history', () => {
  let contextValue: AppContext
  let QUERY: DocumentNode
  let result: DrinksHistoryPaginated

  beforeEach(async () => {
    await seedUsers(prisma, ['user-123'])
    const {
      water: waterId,
      dripCoffee: coffeeId,
      whiskey: whiskeyId,
    } = await seedDrinks(prisma)
    const drinksArray = [waterId, coffeeId, whiskeyId]
    const volumeArray = [12, 8, 16]
    await seedEntries(
      prisma,
      Array.from(new Array(20))
        .map((item, index) => ({
          userId: 'user-123',
          drinkId: drinksArray[index % drinksArray.length],
          volume: volumeArray[index % volumeArray.length],
        })),
    )

    contextValue = {
      redis,
      prisma,
      req: {
        auth: {
          sub: 'user-123',
        },
      } as Request,
      res: {} as Response,
    }

    QUERY = gql`
    query GetDrinkHistory(
      $first: Int,
      $last: Int,
      $after: String,
      $filter: DrinkHistoryFilter
    ) {
      drinksHistory(
        first: $first,
        last: $last,
        after: $after,
        filter: $filter
      ) {
        edges {
          node {
            count
            water
            volume
            drink {
              ... on Drink {
                name
              }
            }
            entries {
              edges {
                node {
                  volume
                }
              }
            }
          }
        }
      }
    }
    `
  })

  it('limits results to entries when filter is applied', async () => {
    const res = await testServer.executeOperation({
      query: QUERY,
      variables: {
      },
    }, { contextValue })

    assert(res.body.kind === 'single')
    assert(res.body.singleResult.data?.drinksHistory !== null)
    result = res.body.singleResult.data?.drinksHistory as DrinksHistoryPaginated

    expect(result.edges).toHaveLength(3)
  })
})
