import {
  describe,
  beforeEach,
  test,
  expect,
  Mock,
} from 'vitest'
import prisma from '../__mocks__/prisma'
import { toCursorHash } from '../utils/cursorHash'
import { DrinkHistory } from './History.model'

describe('DrinkHistory', () => {
  const history = DrinkHistory(prisma)

  describe('findDrinkHistory', () => {
    let mockResponse: any

    beforeEach(() => {
      mockResponse = {
        id: toCursorHash('DrinkHistory:drink-123'),
      };

      (prisma.$transaction as Mock).mockResolvedValue(mockResponse)
    })


    test('makes a transaction to retrieve drink history', async () => {
      await history.findUniqueDrinkHistory(toCursorHash('DrinkHistory:drink-123'), 'user-123')

      expect(prisma.$transaction).toHaveBeenCalled()
    })
  })
})
