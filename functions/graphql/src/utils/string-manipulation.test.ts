import { describe, expect, test } from 'vitest'
import { snakeToCamel } from './string-manipulation'

describe('string-manipulation', () => {
  test('snakeToCamel', () => {
    expect(snakeToCamel('converted_case')).toEqual('convertedCase')
  })
})
