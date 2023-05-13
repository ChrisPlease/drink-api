import {
  describe,
  beforeEach,
  test,
  expect,
} from 'vitest'
import prisma from '../../__mocks__/prisma'
import { DrinkHistory } from './History.model'
import { Prisma } from '@prisma/client'
import { toCursorHash } from '../utils/cursorHash'

describe('DrinkHistory', () => {
  const history = DrinkHistory(prisma)

  describe('findDrinkHistory', () => {
    let mockArgs: Pick<Prisma.EntryAggregateArgs, 'where'>
    let mockResponse: any

    beforeEach(() => {
      mockArgs = {
        where: {
          drinkId: 'drink-123',
          userId: 'user-123',
        },
      }

      mockResponse = {
        id: toCursorHash('DrinkHistory:drink-123'),
      }

      prisma.$transaction.mockResolvedValue(mockResponse)
    })


    test('makes a transaction to retrieve drink history', async () => {
      await history.findDrinkHistory(mockArgs)

      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })
})
