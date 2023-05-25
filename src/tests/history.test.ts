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
import prisma from './helpers/prisma'
import { testServer } from './helpers/server'

describe('history', () => {
  let contextValue: AppContext
  let QUERY: DocumentNode
  let result: DrinksHistoryPaginated

  beforeEach(async () => {
    await seedUsers(prisma, ['user-123'])
    const {
      Water: waterId,
      Coffee: coffeeId,
      Whiskey: whiskeyId,
      Soda: sodaId,
    } = await seedDrinks(prisma)
    const drinksArray = [waterId, coffeeId, whiskeyId, sodaId]
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
      $filter: DrinksHistoryFilter
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
            waterVolume
            totalVolume
            lastEntry
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

  it('does something', async () => {
    const res = await testServer.executeOperation({
      query: QUERY,
      variables: {
        filter: {
          hasEntries: true,
        },
      },
    }, { contextValue })

    assert(res.body.kind === 'single')
    assert(res.body.singleResult.data?.drinksHistory !== null)

    result = res.body.singleResult.data?.drinksHistory as DrinksHistoryPaginated
  })
})