import {
  expect,
  beforeEach,
  test,
  describe,
} from 'vitest'
import { Drink, Prisma } from '@prisma/client'
import {
  toCursorHash,
  fromCursorHash,
  encodeCursor,
  deconstructId,
  getCursor,
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
    test('takes an object and decodes given keys', () => {
      const obj = {
        foo: 'foo',
        bar: toCursorHash('key:bar'),
        bat: toCursorHash('key:bat'),
        nest: {
          key: toCursorHash('key:val'),
          arr: ['foo', 'bar'],
        },
      }

      const res = {
        foo: 'foo',
        bar: 'bar',
        bat: 'bat',
        nest: {
          key: 'val',
          arr: ['foo', 'bar'],
        },
      }

      expect(encodeCursor(obj, ['bar', 'bat', 'key'])).toStrictEqual(res)
    })
  })
  describe('deconstructId', () => {
    test('splits an encoded string into an array', () => {
      const str = toCursorHash('foo:bar')
      expect(deconstructId(str)).toStrictEqual(['foo','bar'])
    })
  })

  describe('getCursor', () => {
    let cursorKey: string
    let record: Drink

    beforeEach(() => {
      record = {
        id: '123',
        upc: 'foo',
        name: 'Test',
        icon: 'test',
        deleted: null,
        createdAt: new Date(2023, 0, 0, 0, 0),
        userId: 'user-123',
      }
    })
    test('creates a key from the record property when the key is a property', () => {
      cursorKey = 'id'
      expect(getCursor<Drink, Prisma.DrinkWhereUniqueInput>(record, cursorKey)).toStrictEqual({ id: '123' })
    })

    test('creates a nested key from the record when the key is not a property', () => {
      cursorKey = 'id_name'
      expect(getCursor<Drink, Prisma.DrinkWhereUniqueInput>(record, cursorKey)).toStrictEqual({
        id_name: {
          id: '123',
          name: 'Test',
        },
      })
    })
  })
})
