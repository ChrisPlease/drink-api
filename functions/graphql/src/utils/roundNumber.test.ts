import {
  describe,
  test,
  expect,
} from 'vitest'
import { roundNumber } from './roundNumber'

describe('roundNumber', () => {
  test('rounds the number to the nearest 100', () => {
    expect(roundNumber(4.32123)).toEqual(4.32)
  })

  test('rounds the number to a given decimal', () => {
    expect(roundNumber(4.3241, 10)).toEqual(4.3)
  })
})
