const toCursorHash = (str: string) => Buffer.from(str).toString('base64')

const fromCursorHash = (str: string) =>
  Buffer.from(str, 'base64').toString('ascii')

export { toCursorHash, fromCursorHash }
