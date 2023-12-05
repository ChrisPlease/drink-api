import { Prisma } from '@prisma/client'
import { NumberFilter } from '@/__generated__/graphql'

export const stringFilter = (key: string, str?: string) =>
  str ? { [key]: { contains: str, mode: 'insensitive' as const } } : {}

export const rangeFilter = (filters: NumberFilter[]): Prisma.FloatNullableFilter =>
  filters.reduce((acc, { comparison, value }) => ({ ...acc, [comparison]: value }), {})
