const toCursorHash = (str: string): string => Buffer.from(str).toString('base64')

const fromCursorHash = (str: string): string =>
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


const constructId = <T extends string>(prefix: T, id: string): string => {
  return toCursorHash(`${prefix}:${id}`)
}

const deconstructId = <T extends string>(id: string): [T, string] => {
  return fromCursorHash(id).split(':') as [T, string]
}

const getCursor = <T extends object, U>(record: T, cursorKey: string): U => {
  const key = cursorKey in record ? [cursorKey] : cursorKey.split('_')
  return (cursorKey in record
    ? { [cursorKey]: record[cursorKey as keyof T] }
    : { [cursorKey]: key.reduce(
      (acc, item) => ({
        ...acc,
        [item]: record?.[item as keyof T],
      }), {}) }) as U
}

export {
  toCursorHash,
  fromCursorHash,
  encodeCursor,
  constructId,
  deconstructId,
  getCursor,
}
