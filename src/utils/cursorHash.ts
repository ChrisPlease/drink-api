// import { ModelType } from '../types/models'

const toCursorHash = (str: string) => Buffer.from(str).toString('base64')

const fromCursorHash = (str: string) =>
  Buffer.from(str, 'base64').toString('ascii')

const encodeCursor = (cursor: Record<string, any>, hashKeys: string[]) => {
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

export {
  toCursorHash,
  fromCursorHash,
  encodeCursor,
}
