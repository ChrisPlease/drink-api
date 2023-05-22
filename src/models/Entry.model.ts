import { Prisma, PrismaClient, Entry, Drink } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { roundNumber } from '@/utils/roundNumber'
import { toCursorHash, fromCursorHash, encodeCursor, getCursor } from '@/utils/cursorHash'
import { QueryEntriesArgs } from '@/__generated__/graphql'
import { Nutrition } from '@/types/models'

type EntryNutrition = {
  caffeine: number,
  sugar: number,
  waterContent: number,
  servings: number,
}

export function Entries(prismaEntry: PrismaClient['entry']) {
  return Object.assign(prismaEntry, {
    computeNutrition(
      { caffeine, sugar, coefficient, servingSize }: Nutrition,
      volume: number,
    ): EntryNutrition {
      return {
        caffeine: roundNumber(caffeine * (volume / servingSize)),
        sugar: roundNumber(sugar * (volume / servingSize)),
        waterContent: roundNumber(coefficient * volume),
        servings: roundNumber(volume / servingSize) || 0,
      }
    },
    async findUniqueWithNutrition(
      args: Prisma.EntryFindUniqueArgs,
    ): Promise<(Entry & { caffeine: number; sugar: number; waterContent: number }) | null> {
      const {
        drink,
        ...entry
      } = await prismaEntry.findUnique({
        ...args,
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
              servingSize: true,
            },
          },
        },
      }) as Entry & { drink: Pick<Drink, 'caffeine' | 'sugar' | 'coefficient' | 'servingSize' > }

      const nutrition = this.computeNutrition(
        {
          caffeine: drink?.caffeine ?? 0,
          sugar: drink?.sugar ?? 0,
          coefficient: drink?.coefficient ?? 0,
          servingSize: drink?.servingSize ?? 1,
        },
        entry?.volume ?? 0,
      )

      return entry ? {
        ...entry,
        ...nutrition,
      } : null
    },
    async findWithNutrition(
      args: Prisma.EntryFindManyArgs,
    ): Promise<(Entry & { caffeine: number; sugar: number; waterContent: number })[]> {
      const entries = await prismaEntry.findMany({
        ...args,
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
              servingSize: true,
            },
          },
        },
      })

      return entries.map(({ id, drink, ...entry }) => {
        const nutrition = this.computeNutrition(
          {
            caffeine: drink?.caffeine ?? 0,
            sugar: drink?.sugar ?? 0,
            coefficient: drink?.coefficient ?? 0,
            servingSize: drink?.servingSize ?? 0,
          },
          entry.volume,
        )

        return {
          id: toCursorHash(`Entry:${id}`),
          ...nutrition,
          ...entry,
        }
      })
    },

    async findManyPaginated(
      client: PrismaClient,
      args: QueryEntriesArgs & { userId: string },
    ) {
      const {
        first,
        sort,
        last,
        before,
        after,
        drinkId,
        distinct,
        userId,
      } = args
      const orderBy = <Prisma.EntryOrderByWithRelationInput>(
        sort
          ? Object.keys(sort)[0] === 'drink'
            ? { drink: { name: sort.drink } } : sort
          : { drink: { name: 'desc' } }
      )



      const sortKey = Object.keys(orderBy)[0]
      let cursorKey = sortKey as keyof Prisma.EntryWhereUniqueInput

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
            { deleted: false },
          ],
        },
        orderBy,
      }

      if (distinct) {
        baseArgs.distinct = ['volume', 'drinkId']
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
            SELECT COUNT(DISTINCT (volume)) FROM entries WHERE user_id = ${
              userId
            } AND deleted = false ${
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
          getCursor: (record) => getCursor<Entry, Prisma.EntryWhereUniqueInput>(record, cursorKey),
          encodeCursor: (cursor) => {
            const dehashedCursor = encodeCursor(cursor, ['id'])
            return toCursorHash(JSON.stringify(dehashedCursor))
          },
          decodeCursor: (cursorString) => JSON.parse(fromCursorHash(cursorString)),
        },
      )
    },
  })
}

