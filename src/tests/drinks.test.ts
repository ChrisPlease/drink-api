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
import { AppContext } from '../types/context'
import { DrinkResult, DrinksPaginated, MixedDrink } from '../__generated__/graphql'
import { deconstructId, toCursorHash } from '../utils/cursorHash'
import prisma from './helpers/prisma'
import { redis } from './helpers/redis'
import { testServer } from './helpers/server'

describe('drinks', () => {
  let contextValue: AppContext
  let QUERY: DocumentNode
  let waterId: string
  let coffeeId: string

  beforeEach(async () => {
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
    await seedUsers(prisma, ['user-123'])
    const { water, dripCoffee } = await seedDrinks(prisma, new Array(14).fill({}).map((item, index) => ({
      name: `Drink ${index}`,
      icon: 'glass-water',
      nutrition: {
        create: {
          servingSize: 12,
          servingUnit: 'fl oz',
          metricSize: 350,
          imperialSize: 12,
        },
      },
    })))
    waterId = toCursorHash(`BaseDrink:${water}`)
    coffeeId = toCursorHash(`BaseDrink:${dripCoffee}`)
  })

  describe('queries', () => {
    describe('get all drinks', () => {
      let result: DrinksPaginated
      beforeEach(async () => {
        QUERY = gql`query GetDrinks($first: Int, $after: String, $filter: DrinkFilter) {
          drinks(first: $first, after: $after, filter: $filter) {
            edges {
              node {
                __typename
                ... on Drink {
                  id
                  name
                  entries {
                    edges {
                      node {
                        volume
                      }
                    }
                  }
                  nutrition {
                    ... on DrinkNutrition {
                      caffeine
                      servingSize
                    }
                  }
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
          variables: { filter: { search: 'w' } },
        }, { contextValue })

        assert(res.body.kind === 'single')
        assert(res.body.singleResult.data?.drinks !== null)

        result = res.body.singleResult.data?.drinks as DrinksPaginated

        const resultNames = result.edges.map(({ node: { name } }) => name)
        expect(resultNames.every(name => name.toLowerCase().includes('w'))).toBeTruthy()
      })
    })
  })

  describe('mutations', () => {
    let result: DrinkResult

    describe('drinkCreate', () => {
      beforeEach(() => {
        QUERY = gql`
        mutation CreateDrink($drinkInput: DrinkCreateInput!) {
          drinkCreate(drinkInput: $drinkInput) {
            ... on Drink {
              id
              name
              icon
            }
            ... on MixedDrink {
              ingredients {
                ... on RelativeIngredient {
                  parts
                }
                ... on DrinkIngredient {
                  drink {
                    ... on Drink {
                      name
                    }
                  }

                }
              }
            }
          }
        }`
      })

      it('returns a base drink', async () => {
        expect.assertions(2)
        const res = await testServer.executeOperation({
          query: QUERY,
          variables: {
            drinkInput: {
              name: 'Test Drink',
              icon: 'test-icon',
              nutrition: {
                servingSize: 12,
                servingUnit: 'fl oz',
                metricSize: 350,
              },
            },
          },
        }, { contextValue })

        assert(res.body.kind === 'single')
        assert(res.body.singleResult.data?.drinkCreate !== null)

        result = res.body.singleResult.data?.drinkCreate as DrinkResult

        const [type] = deconstructId(result.id)
        expect(type).toEqual('BaseDrink')
        expect(result).toEqual(
          expect.objectContaining({
            name: 'Test Drink',
            icon: 'test-icon',
          }),
        )
      })

      it('returns a mixed drink', async () => {
        const res = await testServer.executeOperation({
          query: QUERY,
          variables: {
            drinkInput: {
              name: 'Mixed drink',
              icon: 'test-mixed',
              nutrition: {
                servingSize: 12,
                metricSize: 350,
                servingUnit: 'fl oz',
              },
              ingredients: [
                { drinkId: waterId, parts: 1 },
                { drinkId: coffeeId, parts: 1 },
              ],
            },
          },
        }, { contextValue })

        assert(res.body.kind === 'single')
        assert(res.body.singleResult.data?.drinkCreate !== null)

        result = res.body.singleResult.data?.drinkCreate as DrinkResult

        const [type] = deconstructId(result.id)
        expect(type).toEqual('MixedDrink')
        expect(result).toEqual(
          expect.objectContaining({
            name: 'Mixed drink',
            icon: 'test-mixed',
          }),
        )
        expect((result as MixedDrink).ingredients).toHaveLength(2)
      })
    })

    describe('drinkDelete', () => {
      let newDrinkId: string

      beforeEach(async () => {
        QUERY = gql`
        mutation DeleteDrink($id: ID!) {
          drinkDelete(id: $id) {
            ... on Drink {
              name
            }
          }
        }`
        const { id } = await prisma.drink.create({
          data: {
            name: 'New drink',
            icon: 'new-icon',
            nutrition: {
              create: {
                servingUnit: 'fl oz',
                metricSize: 355,
                imperialSize: 8,
                caffeine: 0,
                sugar: 0,
                servingSize: 8,
                coefficient: 1,

              },
            },
            userId: 'user-123',
          },
        })

        newDrinkId = toCursorHash(`BaseDrink:${id}`)
      })

      it('returns the deleted drink', async () => {
        const res = await testServer.executeOperation({
          query: QUERY,
          variables: { id: newDrinkId },
        }, { contextValue })

        assert(res.body.kind === 'single')
        assert(res.body.singleResult.data?.drinkDelete !== null)

        result = res.body.singleResult.data?.drinkDelete as DrinkResult
        expect(result.name).toEqual('New drink')
      })

      it('removes the drink from the database', async () => {
        await testServer.executeOperation({
          query: QUERY,
          variables: { id: newDrinkId },
        }, { contextValue })

        const [,dehashedId] = deconstructId(newDrinkId)

        const res = await prisma.drink.findUnique({
          where: { id: dehashedId },
        })

        expect(res).toBeNull()
      })
    })

    describe('drinkEdit', () => {
      let mockId: string

      beforeEach( async () => {
        const { id } = await prisma.drink.create({
          data: {
            name: 'Test Drink',
            icon: 'test-icon',
            nutrition: {
              create: {
                servingUnit: 'fl oz',
                metricSize: 350,
                imperialSize: 12,
                caffeine: 12,
                sugar: 12,
                coefficient: 1,
                servingSize: 12,
              },
            },
            userId: 'user-123',
          },
        })

        mockId = toCursorHash(`BaseDrink:${id}`)

        QUERY = gql`
        mutation EditDrink($drinkInput: DrinkEditInput!) {
          drinkEdit(drinkInput: $drinkInput) {
            ... on Drink {
              id
              name
            }
          }
        }`
      })

      it('edits the drink in the database', async () => {
        const res = await testServer.executeOperation({
          query: QUERY,
          variables: {
            drinkInput: {
              id: mockId,
              name: 'Edited drink',
            },
          },
        }, { contextValue })

        assert(res.body.kind === 'single')
        assert(res.body.singleResult.data?.drinkEdit !== null)
        const [,dehashedId] = deconstructId(mockId)
        const drink = await prisma.drink.findUnique({
          where: { id: dehashedId },
        })

        expect(drink?.name).toEqual('Edited drink')
      })

      it('returns the edited drink', async () => {
        const res = await testServer.executeOperation({
          query: QUERY,
          variables: {
            drinkInput: {
              id: mockId,
              name: 'Edited drink',
            },
          },
        }, { contextValue })

        assert(res.body.kind === 'single')
        assert(res.body.singleResult.data?.drinkEdit !== null)
        result = res.body.singleResult.data?.drinkEdit as DrinkResult
        expect(result).toEqual(
          expect.objectContaining({ id: mockId, name: 'Edited drink' }),
        )
      })
    })
  })
})
