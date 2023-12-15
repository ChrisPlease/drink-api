import {
  describe,
  expect,
  test,
} from 'vitest'
import { isIsoDate } from './datetime'

describe('datetime', () => {

  describe('isIsoDate', () => {
    test('returns true when string is a valid ISO date', () => {
      expect(isIsoDate(new Date().toISOString())).toBeTruthy()
    })

    test('returns false when string is not a valid ISO date', () => {
      expect(isIsoDate('foo')).toBeFalsy()
    })
  })
})
