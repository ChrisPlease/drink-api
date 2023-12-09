import { describe, expect, test } from 'vitest'
import { stringFilter, rangeFilter } from './filters'

describe('filters', () => {
  describe('stringFilter', () => {
    test('returns an empty object when no string is provided', () => {
      expect(stringFilter('field', undefined)).toEqual({})
    })

    test('assigns prisma field to a search query', () => {
      expect(stringFilter('mockField', 'Mock Search')).toEqual(expect.objectContaining({
        mockField: {
          contains: 'Mock Search',
          mode: 'insensitive',
        },
      }))
    })
  })

  describe('rangeFilter', () => {
    test('assigns a GraphQL number filter to a prisma filter', () => {
      expect(rangeFilter([{
        comparison: 'LTE',
        value: 3,
      }, {
        comparison: 'GT',
        value: 4,
      }])).toEqual(expect.objectContaining({
        GT: 4,
        LTE: 3,
      }))
    })
  })
})
