import { Prisma, PrismaClient, Entry } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { ConnectionArguments, findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { toCursorHash, fromCursorHash } from '../utils/cursorHash'
import { QueryEntriesArgs } from '../__generated__/graphql'

type Nutrition = {
  caffeine: number,
  waterContent: number,
  sugar: number,
}

interface RawEntry {
  caffeine: number;
  volume: number;
  id: string;
  waterContent: number;
  sugar: number;
  timestamp: Date;
  drink_id: string;
  user_id: string;

}

export function Entries(prismaEntry: PrismaClient['entry']) {
  return Object.assign(prismaEntry, {
    async findWithNutrition(
      args: Prisma.EntryFindManyArgs): Promise<(Entry & { caffeine: number; sugar: number; waterContent: number })[]> {
      const entries = await prismaEntry.findMany({
        ...args,
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
            },
          },
        },
      })

      return entries.map(({ drink, ...entry }) => {
        const nutrition: Nutrition = {
          caffeine: roundNumber((drink?.caffeine ?? 0) * entry.volume),
          sugar: roundNumber((drink?.sugar ?? 0) * entry.volume),
          waterContent: roundNumber((drink?.coefficient ?? 0) * entry.volume),
        }

        return {
          ...nutrition,
          ...entry,
        }
      })
    },

    async findManyPaginated(
      client: PrismaClient,
      { sort, drinkId, distinct }: QueryEntriesArgs,
      { first, last, before, after }: ConnectionArguments,
      userId: string,
    ) {
      console.log('here')
      const orderBy = <Prisma.EntryOrderByWithRelationInput>(
        sort
          ? Object.keys(sort)[0] === 'drink'
            ? { drink: { name: sort.drink } } : sort
          : { drink: { name: 'desc' } }
      )

      const sortKey = Object.keys(orderBy)[0]
      let cursorKey = sortKey

      switch (sortKey) {
        case 'volume':
          cursorKey += '_id'
          break
        case 'drink':
          cursorKey += 'Id_id'
          break
        default:
          break
      }

      const { orderBy: orderByArg, ...baseArgs }: Prisma.EntryFindManyArgs = {
        where: {
          AND: [
            { drinkId: <string>drinkId },
            { userId },
          ],
        },
        orderBy,
      }

      if (distinct) {
        baseArgs.distinct = 'volume'
      }
      return await findManyCursorConnection<Entry, Prisma.EntryWhereUniqueInput>(
        (args) => this.findWithNutrition({
          ...args,
          orderBy: orderByArg,
          ...baseArgs,
        }),
        async () => {
          let count = 0
          if (distinct) {
            ([{ count }] = await client.$queryRaw<{ count: number }[]>`
            SELECT COUNT(DISTINCT (volume)) FROM entries WHERE user_id = ${userId} ${
              drinkId ? Prisma.sql`AND drink_id = ${drinkId}::uuid` : Prisma.empty
            }
            `)
          } else {
            count = await prismaEntry.count(
              { ...baseArgs } as Omit<Prisma.EntryFindManyArgs, 'select' | 'include'>,
            )
          }
          return count
        },
        { first, last, before, after },
        {
          getCursor(record) {
            const key = cursorKey in record ? [cursorKey] : cursorKey.split('_')
            return cursorKey in record
              ? { [cursorKey]: record[cursorKey as keyof Entry] }
              : {
                [cursorKey]: key
                  .reduce(
                    (acc, item) => ({ ...acc, [item]: record?.[item as keyof Entry] }), {},
                  ),
                }
          },
          encodeCursor: (cursor) => toCursorHash(
            JSON.stringify(cursor[cursorKey as keyof Prisma.EntryWhereUniqueInput]),
          ),
          decodeCursor: (cursorString) => (
            { [cursorKey]: JSON.parse(fromCursorHash(cursorString)) }
          ),
        },
      )
    },
  })
}

