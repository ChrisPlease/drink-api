import { Drink, Entry } from '@prisma/client'
import { ModelType } from '@/types/models'

export const toCursorHash = (str: string) => Buffer.from(str).toString('base64')

export const fromCursorHash = (str: string) =>
  Buffer.from(str, 'base64').toString('ascii')

export const encodeCursor = (cursor: Record<string, any>, hashKeys: string[]) => {
  return Object.entries(cursor)
    .reduce((acc, [key, val]) => {
      if (
        typeof val === 'object'
        && typeof val.getMonth !== 'function'
        && !Array.isArray(val)
        && val !== null
      ) {
        acc[key] = encodeCursor(val, hashKeys)
      } else {
        if (hashKeys.includes(key)) {
          acc[key] = fromCursorHash(val).split(':')[1]
        } else {
          acc[key] = val
        }
      }
      return acc
    }, {} as Record<string, any>)
}

export const deconstructId = (id: string): [ModelType, string] => {
  return fromCursorHash(id).split(':') as [ModelType, string]
}

type RecordType = Drink | Entry

export const getCursor = <T extends RecordType, U>(record: T, cursorKey: string) => {
  const key = cursorKey in record ? [cursorKey] : cursorKey.split('_')
  return (cursorKey in record
    ? { [cursorKey]: record[cursorKey as keyof T] }
    : { [cursorKey]: key.reduce(
      (acc, item) => ({
        ...acc,
        [item]: record?.[item as keyof T],
      }), {}) }) as U
}
