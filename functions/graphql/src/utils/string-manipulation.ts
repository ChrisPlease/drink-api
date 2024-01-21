export const snakeToCamel = (str: string) => str.replace(/_([a-z])/g, (_, m) => m.toUpperCase())
