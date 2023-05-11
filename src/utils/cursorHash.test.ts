import {
  expect,
  test,
  describe,
} from 'vitest'
import {
  toCursorHash,
  fromCursorHash,
  encodeCursor,
  deconstructId,
} from './cursorHash'

describe('cursorHash', () => {
  describe('toCursorHash', () => {
    test('converts a string to base64', () => {
      expect(toCursorHash('foo')).toEqual(Buffer.from('foo').toString('base64'))
    })
  })
  describe('fromCursorHash', () => {
    test('converts a string from base64 encoding', () => {
      expect(fromCursorHash('Zm9v')).toEqual('foo')
    })
  })
  describe('encodeCursor', () => {
    test('takes an object and decodes keys', () => {
      const obj = {
        foo: 'foo',
        bar: toCursorHash('key:bar'),
        bat: toCursorHash('key:bat'),
      }

      const res = {
        foo: 'foo',
        bar: 'bar',
        bat: 'bat',
      }

      expect(encodeCursor(obj, ['bar', 'bat'])).toStrictEqual(res)
    })
  })
  describe('deconstructId', () => {
    test('splits an encoded string into an array', () => {
      const str = toCursorHash('foo:bar')
      expect(deconstructId(str)).toStrictEqual(['foo','bar'])
    })
  })
})
